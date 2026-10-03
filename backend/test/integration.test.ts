import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { buildApp } from '../src/app.js';
import { migrate } from '../src/migrate.js';

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

test('anonymous users cannot see accounts or transact; demo is explicitly separate', async () => {
  for (const route of ['/api/dashboard', '/api/auth/me']) {
    assert.equal((await app.inject(route)).statusCode, 401);
  }
  assert.equal((await app.inject({ method: 'POST', url: '/api/deposits', headers })).statusCode, 401);
  const demo = (await app.inject('/api/demo/dashboard')).json();
  assert.equal(demo.mode, 'demo');
  assert.equal(demo.account.balance, '28796.00');
  assert.equal(demo.capabilities.deposits, false);
});

test('registration is atomic and case-normalized duplicate requests create one zero account', async () => {
  const payload = { name: 'Test Investor', email: ' Investor@Example.com ', password };
  const results = await Promise.all(Array.from({ length: 4 }, () => app.inject({ method: 'POST', url: '/api/auth/register', headers, payload })));
  assert.deepEqual(results.map(r => r.statusCode).sort(), [201, 409, 409, 409]);
  const registered = results.find(r => r.statusCode === 201)!;
  assert.match(String(registered.headers['set-cookie']), /HttpOnly/);
  assert.match(String(registered.headers['set-cookie']), /SameSite=Strict/);
  const user = registered.json().user;
  assert.equal(user.email, 'investor@example.com');
  const counts = await pool.query('SELECT count(*)::int AS count FROM accounts WHERE user_id = $1', [user.id]);
  assert.equal(counts.rows[0].count, 1);
  await assert.rejects(pool.query('INSERT INTO accounts (user_id) VALUES ($1)', [user.id]), /unique/);
  const dashboard = (await app.inject({ url: '/api/dashboard', headers: { cookie: cookie(registered) } })).json();
  assert.equal(dashboard.mode, 'live');
  assert.equal(dashboard.account.balance, '0.000000000000000000');
  assert.equal(dashboard.account.returnPercent, null);
  assert.deepEqual(dashboard.transactions, []);
  const stored = await pool.query('SELECT token_hash FROM sessions WHERE user_id = $1', [user.id]);
  assert.notEqual(stored.rows[0].token_hash, cookie(registered).split('=')[1]);
});

test('unsafe requests require exact origin and reject client-owned balances and identities', async () => {
  for (const origin of [undefined, 'https://evil.example']) {
    const response = await app.inject({ method: 'POST', url: '/api/auth/login', headers: origin ? { origin } : {}, payload: { email: 'x@example.com', password } });
    assert.equal(response.statusCode, 403);
  }
  const invalid = await app.inject({ method: 'POST', url: '/api/auth/register', headers, payload: { name: 'Other', email: 'other@example.com', password, userId: 'x', balance: 100 } });
  assert.equal(invalid.statusCode, 400);
});

test('accounts stay isolated, profile updates use session identity, expiry and logout revoke access', async () => {
  const register = async (email: string) => app.inject({ method: 'POST', url: '/api/auth/register', headers, payload: { name: 'Private Investor', email, password } });
  const a = await register('client-a@example.com');
  const b = await register('client-b@example.com');
  const aHeaders = { ...headers, cookie: cookie(a) };
  const bHeaders = { ...headers, cookie: cookie(b) };
  const aDashboard = (await app.inject({ url: '/api/dashboard', headers: aHeaders })).json();
  const bDashboard = (await app.inject({ url: '/api/dashboard', headers: bHeaders })).json();
  assert.equal(aDashboard.user.id, a.json().user.id);
  assert.equal(bDashboard.user.id, b.json().user.id);
  assert.notEqual(aDashboard.account.id, bDashboard.account.id);
  assert.equal((await app.inject({ method: 'PATCH', url: '/api/profile', headers, payload: { name: 'Anonymous' } })).statusCode, 401);
  const invalid = await app.inject({ method: 'PATCH', url: '/api/profile', headers: aHeaders, payload: { name: 'Attack', userId: b.json().user.id } });
  assert.equal(invalid.statusCode, 400);
  const updated = await app.inject({ method: 'PATCH', url: '/api/profile', headers: aHeaders, payload: { name: 'Updated Name' } });
  assert.equal(updated.json().user.name, 'Updated Name');
  assert.equal((await app.inject({ url: '/api/auth/me', headers: bHeaders })).json().user.name, 'Private Investor');
  assert.equal((await app.inject({ url: `/api/dashboard?userId=${b.json().user.id}`, headers: aHeaders })).statusCode, 400);
  for (const route of ['/api/deposits', '/api/withdrawals']) {
    const response = await app.inject({ method: 'POST', url: route, headers: aHeaders });
    assert.equal(response.statusCode, 503);
    assert.equal(typeof response.json().message, 'string');
  }
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

test('database account failure rolls back the new user and session', async () => {
  await pool.query("CREATE FUNCTION reject_account() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test account failure'; END $$");
  await pool.query('CREATE TRIGGER reject_account BEFORE INSERT ON accounts FOR EACH ROW EXECUTE FUNCTION reject_account()');
  try {
    const response = await app.inject({ method: 'POST', url: '/api/auth/register', headers, payload: { name: 'Rollback', email: 'rollback@example.com', password } });
    assert.equal(response.statusCode, 500);
    assert.equal((await pool.query('SELECT id FROM users WHERE email = $1', ['rollback@example.com'])).rowCount, 0);
  } finally {
    await pool.query('DROP TRIGGER reject_account ON accounts');
    await pool.query('DROP FUNCTION reject_account()');
  }
});

test('starter catalog has actual text lessons and health checks PostgreSQL', async () => {
  assert.equal((await app.inject('/api/health')).statusCode, 200);
  const content = (await app.inject('/api/content')).json();
  assert.equal(content.courses.length, 3);
  assert.ok(content.courses.every((course: { body: string[] }) => course.body.length >= 3));
  assert.ok(content.analyses.every((analysis: { body: string[] }) => analysis.body.join(' ').includes('demostrativo')));
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
    assert.equal((await pool.query("SELECT to_regclass('accounts') AS table_name")).rows[0].table_name, 'accounts');
  } finally {
    await pool.query('UPDATE schema_migrations SET checksum = $1 WHERE version = $2', [original.rows[0].checksum, '001_initial.sql']);
  }
});
