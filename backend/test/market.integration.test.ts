import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { buildApp } from '../src/app.js';
import { migrate } from '../src/migrate.js';
import { providerPlans, runMarketRefresh, type ProviderKeys } from '../src/market/refresh.js';
import type { FetchLike } from '../src/market/providers.js';

const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error('TEST_DATABASE_URL must point to a disposable PostgreSQL database. Tests use an isolated schema.');
const schema = `test_${randomUUID().replaceAll('-', '')}`;
const admin = new Pool({ connectionString: url });
const pool = new Pool({ connectionString: url, options: `-c search_path=${schema}` });
const keys: ProviderKeys = { eodhd: 'test-token', massive: 'test-key', massiveBaseUrl: 'https://massive.test' };
const NOON = new Date('2026-11-16T12:00:00Z');

function fakeFetch(price: number, calls: string[]): FetchLike {
  return async requestUrl => {
    calls.push(requestUrl);
    const body = requestUrl.includes('coingecko') ? { bitcoin: { usd: price, usd_24h_change: 1.5 } }
      : requestUrl.includes('eodhd') ? [{ code: 'GSPC.INDX', close: price, change_p: 0.5, timestamp: 1763200000 }]
        : { results: [{ o: price, c: price + 1, t: 1763168400000 }] };
    return { ok: true, status: 200, json: async () => body };
  };
}

before(async () => {
  await admin.query(`CREATE SCHEMA ${schema}`);
  await migrate(pool);
});
after(async () => {
  await pool.end();
  await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await admin.end();
});

test('refresh stores quotes and replaces them on the next slot', async () => {
  const calls: string[] = [];
  const first = await runMarketRefresh(pool, keys, fakeFetch(100, calls), NOON);
  assert.equal(first.find(r => r.provider === 'coingecko')?.status, 'ok');
  const later = new Date(NOON.getTime() + 3 * 60 * 60_000);
  await runMarketRefresh(pool, keys, fakeFetch(200, calls), later);
  const { rows } = await pool.query("SELECT price::float8 AS price FROM market_snapshots WHERE symbol = 'BTC'");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].price, 200);
});

test('a provider is not called twice inside the same slot', async () => {
  const calls: string[] = [];
  const moment = new Date('2026-11-17T12:00:00Z');
  await runMarketRefresh(pool, keys, fakeFetch(1, calls), moment);
  const callsAfterFirst = calls.length;
  await runMarketRefresh(pool, keys, fakeFetch(1, calls), new Date(moment.getTime() + 60_000));
  assert.equal(calls.length, callsAfterFirst);
});

test('daily budget stops further calls', async () => {
  const calls: string[] = [];
  const plans = providerPlans.filter(p => p.name === 'eodhd').map(p => ({ ...p, dailyCalls: 1 }));
  const day = new Date('2026-11-18T10:00:00Z');
  await runMarketRefresh(pool, keys, fakeFetch(1, calls), day, plans);
  const later = await runMarketRefresh(pool, keys, fakeFetch(1, calls), new Date('2026-11-18T20:00:00Z'), plans);
  assert.equal(later[0]?.status, 'skipped');
  assert.equal(later[0]?.reason, 'presupuesto diario agotado');
  assert.equal(calls.length, 1);
});

test('providers without a key are skipped and failures keep the previous data', async () => {
  const noKeys: ProviderKeys = { massiveBaseUrl: 'https://massive.test' };
  const skipped = await runMarketRefresh(pool, noKeys, fakeFetch(1, []), new Date('2026-11-19T12:00:00Z'));
  assert.equal(skipped.find(r => r.provider === 'eodhd')?.reason, 'sin clave de API');
  const read = async () => (await pool.query("SELECT price::float8 AS price FROM market_snapshots WHERE symbol = 'BTC'")).rows[0].price;
  const previous = await read();
  const failing: FetchLike = async () => ({ ok: false, status: 429, json: async () => ({}) });
  const failed = await runMarketRefresh(pool, keys, failing, new Date('2026-11-20T12:00:00Z'));
  assert.equal(failed.find(r => r.provider === 'coingecko')?.status, 'error');
  assert.equal(await read(), previous);
});

test('refresh endpoint requires the cron secret; market endpoint is public', async () => {
  const app = buildApp({ pool, origin: 'http://localhost:5173', secureCookies: false, market: { keys, cronSecret: 'a-long-cron-secret', fetchFn: fakeFetch(5, []) } });
  await app.ready();
  assert.equal((await app.inject('/api/internal/market/refresh')).statusCode, 401);
  assert.equal((await app.inject({ url: '/api/internal/market/refresh', headers: { authorization: 'Bearer wrong' } })).statusCode, 401);
  const ok = await app.inject({ url: '/api/internal/market/refresh', headers: { authorization: 'Bearer a-long-cron-secret' } });
  assert.equal(ok.statusCode, 200);
  const market = await app.inject('/api/market');
  assert.equal(market.statusCode, 200);
  assert.ok(market.json().assets.length >= 13);
  await app.close();
});

test('EODHD is billed per ticker and forex runs on Massive', async () => {
  const calls: string[] = [];
  const day = new Date('2026-11-21T10:00:00Z');
  await runMarketRefresh(pool, keys, fakeFetch(1, calls), day);
  const { rows } = await pool.query("SELECT calls FROM market_api_usage WHERE provider = 'eodhd' AND day = '2026-11-21'");
  assert.equal(rows[0].calls, 3);
  const forex = await pool.query("SELECT provider, provider_symbol FROM market_assets WHERE symbol = 'EURUSD'");
  assert.deepEqual(forex.rows[0], { provider: 'massive', provider_symbol: 'C:EURUSD' });
});

test('two overlapping refreshes spend the slot only once', async () => {
  const calls: string[] = [];
  const day = new Date('2026-11-22T10:00:00Z');
  await Promise.all([runMarketRefresh(pool, keys, fakeFetch(1, calls), day), runMarketRefresh(pool, keys, fakeFetch(1, calls), day)]);
  const eodhd = calls.filter(url => url.includes('eodhd.com'));
  assert.equal(eodhd.length, 1);
  const { rows } = await pool.query("SELECT calls FROM market_api_usage WHERE provider = 'eodhd' AND day = '2026-11-22'");
  assert.equal(rows[0].calls, 3);
});

test('a failure mid-batch keeps partial quotes and refunds unsent calls', async () => {
  const day = new Date('2026-11-22T22:30:00Z');
  let n = 0;
  const flaky: FetchLike = async () => {
    n += 1;
    if (n === 3) return { ok: false, status: 500, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => ({ results: [{ o: 10, c: 11, t: 1763168400000 }] }) };
  };
  const [result] = await runMarketRefresh(pool, keys, flaky, day, providerPlans.filter(p => p.name === 'massive'));
  assert.equal(result?.status, 'error');
  assert.equal(result?.updated, 2);
  const { rows } = await pool.query("SELECT calls FROM market_api_usage WHERE provider = 'massive' AND day = '2026-11-22'");
  assert.equal(rows[0].calls, 3);
});
