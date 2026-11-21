import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { randomBytes } from 'node:crypto';
import type { Pool } from 'pg';
import { hashPassword, verifyPassword } from './security.js';
import { createSession, findUserByEmail, getSessionUser, registerUser, revokeSession, SESSION_SECONDS, updateProfile, type User } from './repository.js';
import { analysisQuery, emptyQuery, loginBody, profileBody, registerBody } from './schemas.js';
import { content } from './content.js';
import { registerAcademy } from './academy.js';
import { createNewsService } from './news.js';
import { listAnalysisRecords } from './analysisRepository.js';
import type { AnalysisRecord } from './analysis/types.js';
import type { ImageStore } from './analysis/imageStore.js';
import { createScenarioImageRepository, type AnalysisImage } from './analysis/scenarioImages.js';

class HttpError extends Error {
  constructor(public statusCode: number, message: string) { super(message); }
}

export type AnalysisTrigger = { adminUserIds: string[]; generate: () => Promise<AnalysisRecord> };

export function buildApp(options: { pool: Pool; origin: string; secureCookies: boolean; logger?: boolean; analysis?: AnalysisTrigger; imageStore?: ImageStore }) {
  const { pool, origin, secureCookies } = options;
  const allowedOrigins = loopbackOrigins(origin);
  const imageRepository = createScenarioImageRepository(pool);
  // Autoriza cuentas existentes por ID: un correo no verificado nunca concede permisos.
  const analysisAdmins = new Set((options.analysis?.adminUserIds ?? []).map(id => id.trim()).filter(Boolean));
  const canGenerateAnalysis = (user: User) => Boolean(options.analysis) && analysisAdmins.has(user.id);
  let generating: Promise<AnalysisRecord> | undefined;
  const app = Fastify({
    logger: options.logger ? { redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'] } : false,
    bodyLimit: 16 * 1024,
    trustProxy: false,
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
  });
  const cookieName = secureCookies ? '__Host-xaurix_session' : 'xaurix_session';
  const cookieOptions = { path: '/', httpOnly: true, sameSite: 'strict', secure: secureCookies } as const;
  const dummyHash = hashPassword(randomBytes(32).toString('hex'));
  const getNews = createNewsService();
  void app.register(cookie);
  void app.register(cors, { origin: allowedOrigins, credentials: true, methods: ['GET', 'POST', 'PATCH', 'OPTIONS'] });
  void app.register(rateLimit, { max: 120, timeWindow: '1 minute', errorResponseBuilder: () => new HttpError(429, 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.') });

  app.addHook('onRequest', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !allowedOrigins.includes(request.headers.origin ?? '')) {
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
  app.get('/api/content', { schema: { querystring: emptyQuery } }, async () => content);
  // Los administradores (mismos IDs que el análisis, nunca por correo) ven todos los niveles desbloqueados.
  registerAcademy(app, {
    isAdmin: async request => {
      const user = await getSessionUser(pool, request.cookies[cookieName]);
      return Boolean(user && analysisAdmins.has(user.id));
    },
  });
  app.get('/api/news', { schema: { querystring: emptyQuery } }, async (_request, reply) => {
    try { return await getNews(); }
    catch { return reply.code(503).send({ message: 'Las noticias no están disponibles en este momento.' }); }
  });
  app.get<{ Querystring: { limit?: string; before?: string } }>('/api/analysis', {
    schema: { querystring: analysisQuery },
  }, async (request, reply) => {
    const { before } = request.query;
    if (before && !isValidAnalysisDate(before)) {
      return reply.code(400).send({ message: 'La fecha anterior debe ser una fecha válida en formato YYYY-MM-DD.' });
    }
    try {
      const page = await listAnalysisRecords(pool, {
        limit: request.query.limit === undefined ? 10 : Number(request.query.limit),
        before,
      });
      // Las imágenes son complementarias: si fallan, el informe se sigue mostrando.
      const images = await imageRepository.listForDates(page.analyses.map(analysis => analysis.analysisDate))
        .catch(() => new Map<string, AnalysisImage[]>());
      return { ...page, analyses: page.analyses.map(analysis => ({ ...analysis, images: images.get(analysis.analysisDate) ?? [] })) };
    } catch (error) {
      // Publica solo un diagnóstico acotado; nunca SQL, credenciales o detalles de filas.
      const code = (error as { code?: string })?.code;
      request.log.error({ requestId: request.id, code: code ?? 'ANALYSIS_READ_FAILED' }, 'Analysis history query failed');
      const schemaMissing = code === '42P01' || code === '42703';
      const databaseUnavailable = ['ECONNREFUSED', 'ENOTFOUND', 'EACCES', 'ETIMEDOUT', '28P01', '3D000', '08006', '08001'].includes(code ?? '');
      return reply.code(503).send({
        code: schemaMissing ? 'analysis_schema_missing' : databaseUnavailable ? 'analysis_database_unavailable' : 'analysis_read_failed',
        message: schemaMissing
          ? 'Falta preparar el historial de análisis. Ejecuta npm run db:migrate y reinicia el backend.'
          : databaseUnavailable
            ? 'No se puede conectar con PostgreSQL para cargar los análisis. Revisa que la base esté iniciada y DATABASE_URL sea correcta.'
            : 'No se pudo leer el historial de análisis. Revisa el registro del backend.',
      });
    }
  });

  app.get<{ Params: { date: string; scenario: string } }>('/api/analysis/:date/images/:scenario', async (request, reply) => {
    const { date, scenario } = request.params;
    if (!isValidAnalysisDate(date) || (scenario !== 'A' && scenario !== 'B') || !options.imageStore) {
      return reply.code(404).send({ message: 'Imagen no encontrada.' });
    }
    const image = await imageRepository.find(date, scenario);
    const data = image && await options.imageStore.get(image.storageKey);
    if (!image || !data) return reply.code(404).send({ message: 'Imagen no encontrada.' });
    // La URL lleva versión, así que el navegador puede guardarla en caché.
    return reply.header('Cache-Control', 'public, max-age=86400, immutable').type(image.mimeType).send(data);
  });

  // Genera y publica el análisis del día; consume Gemini, por eso solo para administradores.
  app.post('/api/analysis/generate', {
    schema: { querystring: emptyQuery },
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
  }, async (request, reply) => {
    const user = await requireUser(request);
    if (!canGenerateAnalysis(user) || !options.analysis) throw new HttpError(403, 'Solo un administrador puede generar el análisis.');
    // Evita llamadas simultáneas a Gemini si se pulsa varias veces.
    generating ??= options.analysis.generate().finally(() => { generating = undefined; });
    const record = await generating;
    if (record.status !== 'published') {
      return reply.code(502).send({ message: record.sources?.errorMessage ?? 'No se pudo generar el análisis. Revisa el registro del backend.' });
    }
    return { analysis: record };
  });

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

  app.get('/api/auth/me', { schema: { querystring: emptyQuery } }, async request => {
    const user = await requireUser(request);
    return { user, canGenerateAnalysis: canGenerateAnalysis(user) };
  });

  app.post('/api/auth/logout', { schema: { querystring: emptyQuery } }, async (request, reply) => {
    await revokeSession(pool, request.cookies[cookieName]);
    reply.clearCookie(cookieName, cookieOptions);
    return reply.code(204).send();
  });

  app.patch<{ Body: { name: string } }>('/api/profile', { schema: { body: profileBody, querystring: emptyQuery } }, async request => {
    const user = await requireUser(request);
    return { user: await updateProfile(pool, user.id, request.body.name.trim()) };
  });

  });
  return app;
}

/** En local, localhost y 127.0.0.1 son el mismo equipo: acepta ambos con el mismo puerto. */
export function loopbackOrigins(origin: string): string[] {
  const url = new URL(origin);
  const twin = url.hostname === 'localhost' ? '127.0.0.1' : url.hostname === '127.0.0.1' ? 'localhost' : undefined;
  if (!twin) return [origin];
  url.hostname = twin;
  return [origin, url.origin];
}

function isValidAnalysisDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
