import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { randomBytes } from 'node:crypto';
import type { Pool } from 'pg';
import { hashPassword, verifyPassword } from './security.js';
import { createSession, findUserByEmail, getAccount, getSessionUser, registerUser, revokeSession, SESSION_SECONDS, updateProfile, type User } from './repository.js';
import { emptyQuery, loginBody, profileBody, registerBody } from './schemas.js';
import { blockedReason, capabilities, demoDashboard } from './demo.js';
import { content } from './content.js';

class HttpError extends Error {
  constructor(public statusCode: number, message: string) { super(message); }
}

export function buildApp(options: { pool: Pool; origin: string; secureCookies: boolean; logger?: boolean }) {
  const { pool, origin, secureCookies } = options;
  const app = Fastify({
    logger: options.logger ? { redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'] } : false,
    bodyLimit: 16 * 1024,
    trustProxy: false,
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
  });
  const cookieName = secureCookies ? '__Host-xaurix_session' : 'xaurix_session';
  const cookieOptions = { path: '/', httpOnly: true, sameSite: 'strict', secure: secureCookies } as const;
  const dummyHash = hashPassword(randomBytes(32).toString('hex'));
  void app.register(cookie);
  void app.register(cors, { origin, credentials: true, methods: ['GET', 'POST', 'PATCH', 'OPTIONS'] });
  void app.register(rateLimit, { max: 120, timeWindow: '1 minute', errorResponseBuilder: () => new HttpError(429, 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.') });

  app.addHook('onRequest', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && request.headers.origin !== origin) {
      return reply.code(403).send({ message: 'El origen de la solicitud no está autorizado.' });
    }
  });

  app.setErrorHandler((error, request, reply) => {
    const err = error as Error & { statusCode?: number; validation?: unknown; code?: string };
    if (err.validation) return reply.code(400).send({ message: 'Datos inválidos. Revisa los campos y no incluyas propiedades adicionales.' });
    if (err.code === '23505') return reply.code(409).send({ message: 'Ya existe una cuenta con ese correo electrónico.' });
    const status = err.statusCode && err.statusCode >= 400 && err.statusCode < 500 ? err.statusCode : 500;
    if (status === 500) {
      // Do not log SQL error detail or bodies: they can include emails/passwords.
      request.log.error({ requestId: request.id, code: err.code ?? 'INTERNAL' }, 'Request failed');
    }
    return reply.code(status).send({ message: status === 500 ? 'No se pudo completar la solicitud. Inténtalo de nuevo.' : err.message });
  });
  app.setNotFoundHandler((_request, reply) => reply.code(404).send({ message: 'Ruta no encontrada.' }));

  async function requireUser(request: FastifyRequest): Promise<User> {
    const user = await getSessionUser(pool, request.cookies[cookieName]);
    if (!user) throw new HttpError(401, 'Inicia sesión para acceder a tu cuenta.');
    return user;
  }
  function setSession(reply: FastifyReply, token: string) {
    reply.setCookie(cookieName, token, { ...cookieOptions, maxAge: SESSION_SECONDS });
  }

  // Wait for plugin hooks (including rate-limit's onRoute) before defining routes.
  app.after(() => {
  app.get('/api/health', async (_request, reply) => {
    try {
      await pool.query('SELECT 1');
      return { status: 'ok', database: 'connected' };
    } catch {
      return reply.code(503).send({ message: 'La base de datos no está disponible.' });
    }
  });
  app.get('/api/demo/dashboard', { schema: { querystring: emptyQuery } }, async () => demoDashboard);
  app.get('/api/content', { schema: { querystring: emptyQuery } }, async () => content);

  app.post<{ Body: { name: string; email: string; password: string } }>('/api/auth/register', {
    schema: { body: registerBody, querystring: emptyQuery },
    config: { rateLimit: { max: 20, timeWindow: '15 minutes' } },
  }, async (request, reply) => {
    const { name, email, password } = request.body;
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.length > 254) throw new HttpError(400, 'El correo electrónico es demasiado largo.');
    const result = await registerUser(pool, name.trim(), normalizedEmail, await hashPassword(password));
    setSession(reply, result.token);
    return reply.code(201).send({ user: result.user });
  });

  app.post<{ Body: { email: string; password: string } }>('/api/auth/login', {
    schema: { body: loginBody, querystring: emptyQuery },
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
  }, async (request, reply) => {
    const user = await findUserByEmail(pool, request.body.email.trim().toLowerCase());
    const valid = await verifyPassword(request.body.password, user?.password_hash ?? await dummyHash);
    if (!valid || !user) throw new HttpError(401, 'El correo o la contraseña no son correctos.');
    // Revoke this browser's prior session to rotate the credential on login.
    await revokeSession(pool, request.cookies[cookieName]);
    const token = await createSession(pool, user.id);
    setSession(reply, token);
    return { user: { id: user.id, name: user.name, email: user.email } };
  });

  app.get('/api/auth/me', { schema: { querystring: emptyQuery } }, async request => ({ user: await requireUser(request) }));

  app.post('/api/auth/logout', { schema: { querystring: emptyQuery } }, async (request, reply) => {
    await revokeSession(pool, request.cookies[cookieName]);
    reply.clearCookie(cookieName, cookieOptions);
    return reply.code(204).send();
  });

  app.patch<{ Body: { name: string } }>('/api/profile', { schema: { body: profileBody, querystring: emptyQuery } }, async request => {
    const user = await requireUser(request);
    return { user: await updateProfile(pool, user.id, request.body.name.trim()) };
  });

  app.get('/api/dashboard', { schema: { querystring: emptyQuery } }, async request => {
    const user = await requireUser(request);
    const account = await getAccount(pool, user.id);
    if (!account) throw new Error('Registered user is missing account');
    return { mode: 'live', user, account, performance: [], transactions: [], capabilities };
  });

  for (const path of ['/api/deposits', '/api/withdrawals']) {
    app.post(path, { schema: { querystring: emptyQuery } }, async (request, reply) => {
      await requireUser(request);
      return reply.code(503).send({ message: blockedReason });
    });
  }
  });
  return app;
}
