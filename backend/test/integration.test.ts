import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { buildApp } from '../src/app.js';
import { findAnalysisByDate, saveAnalysisRecord, withAnalysisDateLock } from '../src/analysisRepository.js';
import { migrate } from '../src/migrate.js';
import type { AnalysisRecord, AnalysisScenario } from '../src/analysis/types.js';

const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error('TEST_DATABASE_URL must point to a disposable PostgreSQL database. Tests use an isolated schema.');
const schema = `test_${randomUUID().replaceAll('-', '')}`;
const admin = new Pool({ connectionString: url });
const pool = new Pool({ connectionString: url, options: `-c search_path=${schema}` });
const app = buildApp({ pool, origin: 'http://localhost:5173', secureCookies: false });
const headers = { origin: 'http://localhost:5173' };
const password = 'testing-a-long-secret';
function cookie(response: { headers: Record<string, unknown> }) {
  return String(response.headers['set-cookie']).split(';')[0]!;
}
function waitingScenario(name: 'A' | 'B'): AnalysisScenario {
  return {
    name,
    direction: 'wait',
    context: 'No hay una configuración confirmada.',
    preconditions: 'Esperar cierre de vela.',
    m15Zone: 'No disponible',
    m5Confirmation: 'Esperar confirmación.',
    entryType: 'wait',
    entryLow: null,
    entryHigh: null,
    stopLoss: null,
    takeProfits: [null, null, null],
    cancellation: 'No aplica.',
    management: 'No aplica.',
    validity: 'Reanalizar tras nuevo cierre.',
    invalidation: 'No aplica.',
    rationale: 'Esperar.',
  };
}
function analysisRecord(analysisDate: string, status: AnalysisRecord['status']): AnalysisRecord {
  return {
    analysisDate,
    status,
    report: status === 'published'
      ? {
          macro: 'H4 alcista', confluence: 'EMA alineadas', entryPlan: 'Esperar BOS M5',
          scenarios: [waitingScenario('A'), waitingScenario('B')],
        }
      : null,
    sources: {
      market: [],
      calendar: { status: 'unavailable', summary: 'No se pudo verificar el calendario.', citations: [] },
    },
    referencePrice: status === 'published' ? '2000.00' : null,
    referenceAt: status === 'published' ? '2026-11-18T12:00:00Z' : null,
    generatedAt: status === 'published' ? '2026-11-18T12:01:00Z' : null,
    model: status === 'published' ? 'gemini-test' : null,
    promptVersion: status === 'published' ? 'test-v1' : null,
    errorCode: status === 'failed' ? 'provider_error' : null,
  };
}
before(async () => {
  await admin.query(`CREATE SCHEMA ${schema}`);
  await migrate(pool);
  await migrate(pool);
  await app.ready();
});
after(async () => {
  await app.close();
  await pool.end();
  await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await admin.end();
});

test('anonymous users have no session', async () => {
  assert.equal((await app.inject('/api/auth/me')).statusCode, 401);
  assert.equal((await app.inject('/api/dashboard')).statusCode, 404);
});

test('registration is atomic and case-normalized duplicate requests create one user', async () => {
  const payload = { name: 'Test Investor', email: ' Investor@Example.com ', password };
  const results = await Promise.all(Array.from({ length: 4 }, () => app.inject({ method: 'POST', url: '/api/auth/register', headers, payload })));
  assert.deepEqual(results.map(r => r.statusCode).sort(), [201, 409, 409, 409]);
  const registered = results.find(r => r.statusCode === 201)!;
  assert.match(String(registered.headers['set-cookie']), /HttpOnly/);
  assert.match(String(registered.headers['set-cookie']), /SameSite=Strict/);
  const user = registered.json().user;
  assert.equal(user.email, 'investor@example.com');
  const stored = await pool.query('SELECT token_hash FROM sessions WHERE user_id = $1', [user.id]);
  assert.notEqual(stored.rows[0].token_hash, cookie(registered).split('=')[1]);
});

test('unsafe requests require exact origin and reject client-owned identities', async () => {
  for (const origin of [undefined, 'https://evil.example']) {
    const response = await app.inject({ method: 'POST', url: '/api/auth/login', headers: origin ? { origin } : {}, payload: { email: 'x@example.com', password } });
    assert.equal(response.statusCode, 403);
  }
  const invalid = await app.inject({ method: 'POST', url: '/api/auth/register', headers, payload: { name: 'Other', email: 'other@example.com', password, userId: 'x', role: 'admin' } });
  assert.equal(invalid.statusCode, 400);
});

test('profile updates use session identity; expiry and logout revoke access', async () => {
  const register = async (email: string) => app.inject({ method: 'POST', url: '/api/auth/register', headers, payload: { name: 'Private Investor', email, password } });
  const a = await register('client-a@example.com');
  const b = await register('client-b@example.com');
  const aHeaders = { ...headers, cookie: cookie(a) };
  const bHeaders = { ...headers, cookie: cookie(b) };
  assert.equal((await app.inject({ url: '/api/auth/me', headers: aHeaders })).json().user.id, a.json().user.id);
  assert.equal((await app.inject({ url: '/api/auth/me', headers: bHeaders })).json().user.id, b.json().user.id);
  assert.equal((await app.inject({ method: 'PATCH', url: '/api/profile', headers, payload: { name: 'Anonymous' } })).statusCode, 401);
  const invalid = await app.inject({ method: 'PATCH', url: '/api/profile', headers: aHeaders, payload: { name: 'Attack', userId: b.json().user.id } });
  assert.equal(invalid.statusCode, 400);
  const updated = await app.inject({ method: 'PATCH', url: '/api/profile', headers: aHeaders, payload: { name: 'Updated Name' } });
  assert.equal(updated.json().user.name, 'Updated Name');
  assert.equal((await app.inject({ url: '/api/auth/me', headers: bHeaders })).json().user.name, 'Private Investor');
  assert.equal((await app.inject({ method: 'POST', url: '/api/auth/logout', headers: aHeaders })).statusCode, 204);
  assert.equal((await app.inject({ url: '/api/auth/me', headers: aHeaders })).statusCode, 401);
  await pool.query("UPDATE sessions SET expires_at = NOW() - INTERVAL '1 hour' WHERE user_id = $1", [b.json().user.id]);
  assert.equal((await app.inject({ url: '/api/auth/me', headers: bHeaders })).statusCode, 401);
  assert.equal((await app.inject({ method: 'POST', url: '/api/auth/login', headers, payload: { email: 'client-a@example.com', password: 'incorrect-secret' } })).statusCode, 401);
  const login = await app.inject({ method: 'POST', url: '/api/auth/login', headers, payload: { email: 'CLIENT-A@example.com', password } });
  assert.equal(login.statusCode, 200);
  const rotated = await app.inject({ method: 'POST', url: '/api/auth/login', headers: { ...headers, cookie: cookie(login) }, payload: { email: 'client-a@example.com', password } });
  assert.notEqual(cookie(login), cookie(rotated));
  assert.equal((await app.inject({ url: '/api/auth/me', headers: { cookie: cookie(login) } })).statusCode, 401);
});

test('database session failure rolls back the new user', async () => {
  await pool.query("CREATE FUNCTION reject_session() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test session failure'; END $$");
  await pool.query('CREATE TRIGGER reject_session BEFORE INSERT ON sessions FOR EACH ROW EXECUTE FUNCTION reject_session()');
  try {
    const response = await app.inject({ method: 'POST', url: '/api/auth/register', headers, payload: { name: 'Rollback', email: 'rollback@example.com', password } });
    assert.equal(response.statusCode, 500);
    assert.equal((await pool.query('SELECT id FROM users WHERE email = $1', ['rollback@example.com'])).rowCount, 0);
  } finally {
    await pool.query('DROP TRIGGER reject_session ON sessions');
    await pool.query('DROP FUNCTION reject_session()');
  }
});

test('starter catalog has actual text lessons and health checks PostgreSQL', async () => {
  assert.equal((await app.inject('/api/health')).statusCode, 200);
  const content = (await app.inject('/api/content')).json();
  assert.equal(content.courses.length, 3);
  assert.ok(content.courses.every((course: { body: string[] }) => course.body.length >= 3));
  assert.equal(content.analyses, undefined);
});

test('daily analyses are unique by date and public history is descending and paginated', async () => {
  await saveAnalysisRecord(pool, analysisRecord('2026-11-18', 'published'));
  await saveAnalysisRecord(pool, analysisRecord('2026-11-17', 'insufficient_data'));
  await saveAnalysisRecord(pool, analysisRecord('2026-11-16', 'failed'));
  // Reintentar el mismo día actualiza el registro sin duplicar el historial.
  await saveAnalysisRecord(pool, analysisRecord('2026-11-18', 'published'));
  assert.equal((await pool.query("SELECT count(*)::int AS count FROM market_analyses WHERE analysis_date = '2026-11-18'")).rows[0].count, 1);

  const first = await app.inject('/api/analysis?limit=2');
  assert.equal(first.statusCode, 200);
  assert.deepEqual(first.json().analyses.map((record: { analysisDate: string }) => record.analysisDate), ['2026-11-18', '2026-11-17']);
  assert.equal(first.json().nextBefore, '2026-11-16');
  assert.equal(first.json().analyses[0].report.macro, 'H4 alcista');
  assert.equal(first.json().analyses[1].report, null);

  const second = await app.inject(`/api/analysis?before=${first.json().nextBefore}&limit=2`);
  assert.equal(second.statusCode, 200);
  assert.deepEqual(second.json().analyses.map((record: { analysisDate: string }) => record.analysisDate), ['2026-11-16']);
  assert.equal(second.json().nextBefore, null);
  assert.doesNotMatch(JSON.stringify(first.json()), /GEMINI_API_KEY|GOLDPRICE_API_KEY|apiKey/);
});

test('raw Gemini text persists without market prices and replaces a failed daily record', async () => {
  const date = '2026-11-14';
  await saveAnalysisRecord(pool, analysisRecord(date, 'failed'));
  const record = analysisRecord(date, 'published');
  record.report = { rawText: '## Respuesta original\nSin JSON y con limitaciones del modelo.', macro: '', confluence: '', entryPlan: '', scenarios: [] };
  record.marketSource = null;
  record.referencePrice = null;
  record.referenceAt = null;
  await saveAnalysisRecord(pool, record);
  const stored = await findAnalysisByDate(pool, date);
  assert.equal(stored?.status, 'published');
  assert.equal(stored?.report?.rawText, record.report.rawText);
  const response = await app.inject(`/api/analysis?limit=1&before=${date}`);
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().analyses[0].report.rawText, record.report.rawText);
  await pool.query('DELETE FROM market_analyses WHERE analysis_date = $1', [date]);
});

test('daily advisory lock serializes same-date jobs and releases after errors', async () => {
  let releaseFirst!: () => void;
  let markFirstEntered!: () => void;
  const firstEntered = new Promise<void>(resolve => { markFirstEntered = resolve; });
  const firstGate = new Promise<void>(resolve => { releaseFirst = resolve; });
  let secondEntered = false;
  const first = withAnalysisDateLock(pool, '2026-11-15', async () => {
    markFirstEntered();
    await firstGate;
    return 'first';
  });
  await firstEntered;
  const second = withAnalysisDateLock(pool, '2026-11-15', async () => {
    secondEntered = true;
    return 'second';
  });
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(secondEntered, false);
  releaseFirst();
  assert.deepEqual(await Promise.all([first, second]), ['first', 'second']);
  await assert.rejects(
    withAnalysisDateLock(pool, '2026-11-15', async () => { throw new Error('test failure'); }),
    /test failure/,
  );
  assert.equal(
    await withAnalysisDateLock(pool, '2026-11-15', async () => 'released'),
    'released',
  );
});

test('analysis history validates query parameters and treats before as inclusive', async () => {
  const response = await app.inject('/api/analysis?limit=1&before=2026-11-17');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().analyses.map((record: { analysisDate: string }) => record.analysisDate), ['2026-11-17']);
  assert.equal((await app.inject('/api/analysis?limit=31')).statusCode, 400);
  assert.equal((await app.inject('/api/analysis?before=2026-02-31')).statusCode, 400);
});

test('production cookie is host-only and secure; login attempts are rate limited', async () => {
  const production = buildApp({ pool, origin: 'https://app.example.com', secureCookies: true });
  try {
    const registered = await production.inject({ method: 'POST', url: '/api/auth/register', headers: { origin: 'https://app.example.com' }, payload: { name: 'Secure Session', email: 'secure@example.com', password } });
    assert.equal(registered.statusCode, 201);
    const setCookie = String(registered.headers['set-cookie']);
    assert.match(setCookie, /^__Host-xaurix_session=/);
    assert.match(setCookie, /; Secure/);
    assert.doesNotMatch(setCookie, /Domain=/);
    let result;
    for (let attempt = 0; attempt < 11; attempt++) {
      result = await production.inject({ method: 'POST', url: '/api/auth/login', headers: { origin: 'https://app.example.com' }, payload: { email: 'unknown@example.com', password } });
      assert.equal(result.statusCode, attempt === 10 ? 429 : 401);
    }
    assert.equal(typeof result!.json().message, 'string');
  } finally {
    await production.close();
  }
});

test('migration checksum changes are rejected without changing applied schema', async () => {
  const original = await pool.query('SELECT checksum FROM schema_migrations WHERE version = $1', ['001_initial.sql']);
  await pool.query('UPDATE schema_migrations SET checksum = $1 WHERE version = $2', ['0'.repeat(64), '001_initial.sql']);
  try {
    await assert.rejects(migrate(pool), /checksum mismatch/);
    assert.equal((await pool.query("SELECT to_regclass('users') AS table_name")).rows[0].table_name, 'users');
  } finally {
    await pool.query('UPDATE schema_migrations SET checksum = $1 WHERE version = $2', [original.rows[0].checksum, '001_initial.sql']);
  }
});
