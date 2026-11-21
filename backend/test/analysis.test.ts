import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import cron from 'node-cron';
import { buildApp } from '../src/app.js';
import type { Pool } from 'pg';
import { GenerateContentResponse } from '@google/genai';
import { findAnalysisByDate, saveAnalysisRecord } from '../src/analysisRepository.js';
import { calculateEma, calculateMomentum, calculateRsi } from '../src/analysis/indicators.js';
import { createGeminiAnalysisClient, GeminiAnalysisError } from '../src/analysis/gemini.js';
import { createMarketDataClient, MarketDataError } from '../src/analysis/marketData.js';
import { calculateScenarioMetrics, validateScenario } from '../src/analysis/scenarios.js';
import { runDailyAnalysis } from '../src/analysis/service.js';
import { registerAnalysisScheduler, startDailyAnalysisScheduler } from '../src/analysis/scheduler.js';
import { readConfig } from '../src/config.js';
import type { AnalysisRecord, AnalysisReport } from '../src/analysis/types.js';

const referenceTime = new Date('2026-11-17T12:00:00Z');
const testApiKey = 'test-secret-not-for-logs';

function spotResponse(isStale = false, price = '2000.00') {
  return new Response(JSON.stringify({
    symbols: [{
      symbol: 'XAU', quote_currency: 'USD', unit: 'troy_ounce',
      contract_type: 'spot', price, is_stale: isStale,
      computed_at: '2026-11-17T12:00:00Z', sources: [],
    }],
  }), { status: 200, headers: { 'content-type': 'application/json' } });
}

function barResponse(interval: string) {
  return new Response(JSON.stringify({
    symbol: 'XAU-USD-SPOT', interval, next_cursor: null,
    meta: { tier: 'pro_2026', count: 2, source_id: 'test' },
    bars: [
      { bar_start: '2026-11-17T11:50:00Z', open: '1999', high: '2001', low: '1998', close: '2000', volume: null, is_closed: true },
      { bar_start: '2026-11-17T11:55:00Z', open: '2000', high: '2002', low: '1999', close: '2001', volume: null, is_closed: false },
    ],
  }), { status: 200, headers: { 'content-type': 'application/json' } });
}

function validAnalysisReport(): AnalysisReport {
  return {
    macro: 'H4 y H1 muestran una estructura mixta.',
    confluence: 'EMA 20: 2000; RSI 14: 52; Momentum 14: 101.',
    entryPlan: 'Esperar cierre M5 y retesteo.',
    scenarios: [
      {
        name: 'A', direction: 'buy', context: 'Continuación condicionada.',
        preconditions: 'Cierre por encima del swing.',
        m15Zone: '1998-2000', m5Confirmation: 'BOS por cierre y retesteo.',
        entryType: 'market_after_confirmation', entryLow: 2000, entryHigh: 2002,
        stopLoss: 1996, takeProfits: [2010, 2014, 2018],
        cancellation: 'Cancelar si pierde el mínimo.',
        management: 'Parcial en TP1; revisar estructura para mover stop.',
        validity: 'Válido hasta el cierre H1 siguiente.',
        invalidation: 'Cierre H1 bajo 1996.', rationale: 'Estructura alcista confirmada.',
      },
      {
        name: 'B', direction: 'wait', context: 'Alternativa si A se invalida.',
        preconditions: 'Sin confirmación contraria.',
        m15Zone: 'No disponible', m5Confirmation: 'Esperar CHoCH por cierre.',
        entryType: 'wait', entryLow: null, entryHigh: null, stopLoss: null,
        takeProfits: [null, null, null], cancellation: 'No aplica.',
        management: 'No aplica sin entrada.', validity: 'Reanalizar tras nuevo cierre H1.',
        invalidation: 'Ninguna entrada propuesta.', rationale: 'No hay una señal contraria confirmada.',
      },
    ],
  };
}

function dailyAnalysisRepository() {
  const records = new Map<string, AnalysisRecord>();
  return {
    records,
    withDateLock: async <T>(_date: string, operation: () => Promise<T>) => operation(),
    findByDate: async (date: string) => records.get(date),
    save: async (record: AnalysisRecord) => { records.set(record.analysisDate, record); },
  };
}

test('EMA seeds with a period SMA, then uses alpha 2/(period+1)', () => {
  assert.deepEqual(calculateEma([10, 11, 12, 13], 3), [null, null, 11, 12]);
});

test('EMA rejects invalid prices and periods', () => {
  assert.throws(() => calculateEma([10, Number.NaN], 2), /finite/);
  assert.throws(() => calculateEma([10], 0), /period/);
});

test('Momentum 14 uses close/close[-14] times 100', () => {
  assert.ok(Math.abs(calculateMomentum([100, ...Array(13).fill(100), 110], 14)! - 110) < 1e-10);
});

test('Momentum returns null for insufficient data or a zero reference close', () => {
  assert.equal(calculateMomentum([100, 101], 14), null);
  assert.equal(calculateMomentum([0, ...Array(14).fill(1)], 14), null);
});

test('RSI returns null until enough closes exist and handles flat closes', () => {
  assert.ok(calculateRsi(Array(15).fill(100), 14).every(value => value === null || value === 50));
});

test('RSI returns 100 when gains exist without losses', () => {
  assert.equal(calculateRsi(Array.from({ length: 15 }, (_, index) => 100 + index), 14).at(-1), 100);
});

test('scenario metrics use the midpoint of an entry range', () => {
  const metrics = calculateScenarioMetrics({
    direction: 'buy', entryLow: 2000, entryHigh: 2002, stopLoss: 1996,
    takeProfits: [2010, 2014, 2018],
  });
  assert.equal(metrics.entryReference, 2001);
  assert.equal(metrics.risk, 5);
  assert.deepEqual(metrics.rewardDistances, [9, 13, 17]);
  assert.deepEqual(metrics.rewardRisk, [1.8, 2.6, 3.4]);
  assert.deepEqual(metrics.belowMinimumRewardRisk, [true, false, false]);
});

test('scenario direction must place stop and targets on valid sides', () => {
  assert.equal(validateScenario({
    direction: 'buy', entryLow: 2000, entryHigh: 2002, stopLoss: 2003,
    takeProfits: [2010, 2014, 2018],
  }).valid, false);
  assert.equal(validateScenario({
    direction: 'sell', entryLow: 2000, entryHigh: 2002, stopLoss: 2003,
    takeProfits: [1990, 1985, 1980],
  }).valid, true);
});

test('scenario validation rejects reversed ranges, non-finite prices and wrong-side targets', () => {
  const scenario = {
    direction: 'buy' as const, entryLow: 2002, entryHigh: 2000, stopLoss: 1996,
    takeProfits: [2010, 2014, 2018] as [number, number, number],
  };
  assert.equal(validateScenario(scenario).valid, false);
  assert.equal(validateScenario({ ...scenario, entryLow: Number.POSITIVE_INFINITY }).valid, false);
  assert.equal(validateScenario({ ...scenario, entryLow: 2000, entryHigh: 2002, takeProfits: [2010, 1999, 2018] }).valid, false);
});

test('scenario metrics reject zero risk', () => {
  assert.throws(() => calculateScenarioMetrics({
    direction: 'buy', entryLow: 2000, entryHigh: 2002, stopLoss: 2001,
    takeProfits: [2010, 2014, 2018],
  }), /invalid scenario/i);
});

test('market data requests only XAU-USD-SPOT and retains closed bars', async () => {
  const requests: Array<{ url: URL; init?: RequestInit }> = [];
  const client = createMarketDataClient({
    apiKey: testApiKey,
    fetch: async (input, init) => {
      const url = new URL(String(input));
      requests.push({ url, init });
      return url.pathname === '/v1/prices' ? spotResponse() : barResponse(url.searchParams.get('interval')!);
    },
  });

  const snapshot = await client.fetchSnapshot(referenceTime);
  assert.deepEqual(snapshot.bars.map(({ interval }) => interval), ['5m', '15m', '1h', '4h']);
  assert.ok(snapshot.bars.every(({ bars }) => bars.length === 1 && bars[0]?.isClosed));
  assert.equal(snapshot.bars[0]?.bars[0]?.volume, null);
  assert.equal(snapshot.spot.price, '2000.00');
  assert.equal(requests.length, 5);
  assert.ok(requests.every(({ url }) => url.searchParams.get('symbol') === 'XAU-USD-SPOT'));
  assert.deepEqual(requests.slice(1).map(({ url }) => url.searchParams.get('interval')), ['5m', '15m', '1h', '4h']);
  assert.equal(requests[0]?.url.searchParams.get('include'), 'sources');
  assert.ok(requests.every(({ init }) => (init?.headers as Headers).get('authorization') === `Bearer ${testApiKey}`));
});

test('market data preserves stale spot status for orchestration to reject entries', async () => {
  const client = createMarketDataClient({
    apiKey: testApiKey,
    fetch: async input => {
      const url = new URL(String(input));
      return url.pathname === '/v1/prices' ? spotResponse(true) : barResponse(url.searchParams.get('interval')!);
    },
  });
  assert.equal((await client.fetchSnapshot(referenceTime)).spot.isStale, true);
});

test('market data rejects a zero spot price as unusable', async () => {
  const client = createMarketDataClient({
    apiKey: testApiKey,
    fetch: async input => {
      const url = new URL(String(input));
      return url.pathname === '/v1/prices' ? spotResponse(false, '0.00') : barResponse(url.searchParams.get('interval')!);
    },
  });
  await assert.rejects(client.fetchSnapshot(referenceTime), error =>
    error instanceof MarketDataError && error.code === 'invalid_payload');
});

test('market data classifies retryable server failures separately from permanent provider errors', async () => {
  for (const [status, code] of [
    [403, 'provider_forbidden'],
    [429, 'rate_limited'],
    [401, 'provider_error'],
    [503, 'provider_unavailable'],
  ] as const) {
    const client = createMarketDataClient({
      apiKey: testApiKey,
      fetch: async input => {
        const url = new URL(String(input));
        return url.pathname === '/v1/prices' ? spotResponse() : new Response('{}', { status });
      },
    });
    await assert.rejects(client.fetchSnapshot(referenceTime), error =>
      error instanceof MarketDataError && error.code === code && !error.message.includes(testApiKey));
  }
});

test('market data rejects malformed JSON and times out explicitly', async () => {
  const malformedClient = createMarketDataClient({
    apiKey: testApiKey,
    fetch: async () => new Response('{', { status: 200 }),
  });
  await assert.rejects(malformedClient.fetchSnapshot(referenceTime), error =>
    error instanceof MarketDataError && error.code === 'invalid_payload');

  const timeoutClient = createMarketDataClient({
    apiKey: testApiKey,
    timeoutMs: 5,
    fetch: async (_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
    }),
  });
  await assert.rejects(timeoutClient.fetchSnapshot(referenceTime), error =>
    error instanceof MarketDataError && error.code === 'timeout');
});

test('market data requires a configured key and never calls the provider without one', async () => {
  let requests = 0;
  const client = createMarketDataClient({ fetch: async () => { requests++; return spotResponse(); } });
  await assert.rejects(client.fetchSnapshot(referenceTime), error =>
    error instanceof MarketDataError && error.code === 'missing_api_key');
  assert.equal(requests, 0);
});

test('readConfig exposes optional analysis credentials without requiring them', () => {
  const config = readConfig({ DATABASE_URL: 'postgresql://test', GEMINI_API_KEY: 'gemini-key', GOLDPRICE_API_KEY: 'gold-key' });
  assert.equal(config.geminiApiKey, 'gemini-key');
  assert.equal(config.goldPriceApiKey, 'gold-key');
  assert.equal(config.geminiModel, 'gemini-4-hydrogen');
  const withoutKeys = readConfig({ DATABASE_URL: 'postgresql://test' });
  assert.equal(withoutKeys.geminiApiKey, undefined);
  assert.equal(withoutKeys.goldPriceApiKey, undefined);
});

test('Gemini sends one prompt with Search and preserves non-JSON response verbatim', async () => {
  const calls: any[] = [];
  const text = '## Análisis\nNo dispongo de velas M5 verificables.\n\n| A | B |\n|---|---|\n| 1 | 2 |';
  const service = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'gemini-test', client: {
    models: { generateContent: async request => { calls.push(request); return { text } as any; } },
  } });
  const generated = await service.generateReport({ analysisTime: referenceTime.toISOString() });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, 'gemini-test');
  assert.deepEqual(calls[0].config.tools, [{ googleSearch: {} }]);
  assert.match(calls[0].contents, /H4, H1, M15 y M5/);
  assert.match(calls[0].contents, /DOS ESCENARIOS/);
  assert.equal(calls[0].config.responseSchema, undefined);
  assert.equal(generated.report.rawText, text);
});

test('Gemini returns the provider error without leaking the key and rejects empty output only', async () => {
  const service = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'test', client: {
    models: { generateContent: async () => { throw new Error(`429 quota exceeded ${testApiKey}`); } },
  } });
  await assert.rejects(() => service.generateReport({ analysisTime: referenceTime.toISOString() }),
    (error: unknown) => error instanceof GeminiAnalysisError && /429 quota exceeded/.test(error.message) && !error.message.includes(testApiKey));
  const empty = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'test', client: {
    models: { generateContent: async () => ({ text: '' } as any) },
  } });
  await assert.rejects(() => empty.generateReport({ analysisTime: referenceTime.toISOString() }),
    (error: unknown) => error instanceof GeminiAnalysisError && error.code === 'invalid_report');
});

test('official SDK sends the documented host, API-key header and Google Search payload', async () => {
  let requests = 0;
  const service = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'gemini-4-hydrogen', fetch: async (input, init) => {
    requests++;
    const url = new URL(String(input));
    assert.equal(url.origin, 'https://generativelanguage.googleapis.com');
    assert.equal(url.pathname, '/v1beta/models/gemini-4-hydrogen:generateContent');
    assert.equal(url.searchParams.has('key'), false);
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('x-goog-api-key'), testApiKey);
    assert.equal(init?.method, 'POST');
    const body = JSON.parse(String(init?.body));
    assert.match(body.contents[0].parts[0].text, /XAUUSD/);
    assert.ok(body.tools[0].googleSearch ?? body.tools[0].google_search);
    assert.equal(body.generationConfig?.responseSchema, undefined);
    return new Response(JSON.stringify({ candidates: [{
      content: { role: 'model', parts: [{ text: 'Respuesta intacta' }] }, finishReason: 'STOP',
      groundingMetadata: { groundingChunks: [{ web: { uri: 'https://www.federalreserve.gov/', title: 'Federal Reserve' } }],
        searchEntryPoint: { renderedContent: '<div>Google Search</div>' } },
    }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } });
  const generated = await service.generateReport({ analysisTime: referenceTime.toISOString() });
  assert.equal(requests, 1);
  assert.equal(generated.report.rawText, 'Respuesta intacta');
  assert.equal(generated.report.grounding?.citations[0]?.title, 'Federal Reserve');
  assert.equal(generated.report.grounding?.searchSuggestionsHtml, '<div>Google Search</div>');
});

test('official SDK retries a transient 503 once and never retries a permanent 403', async () => {
  let transientCalls = 0;
  const transient = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'gemini-4-hydrogen', fetch: async () => {
    transientCalls++;
    if (transientCalls === 1) return new Response(JSON.stringify({ error: { code: 503, message: 'Unavailable', status: 'UNAVAILABLE' } }), { status: 503 });
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Recuperado' }] }, finishReason: 'STOP' }] }), { status: 200 });
  } });
  assert.equal((await transient.generateReport({ analysisTime: referenceTime.toISOString() })).report.rawText, 'Recuperado');
  assert.equal(transientCalls, 2);
  let permanentCalls = 0;
  const permanent = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'gemini-4-hydrogen', fetch: async () => {
    permanentCalls++;
    return new Response(JSON.stringify({ error: { code: 403, message: `Permission denied ${testApiKey}`, status: 'PERMISSION_DENIED' } }), { status: 403 });
  } });
  await assert.rejects(() => permanent.generateReport({ analysisTime: referenceTime.toISOString() }),
    (error: unknown) => error instanceof GeminiAnalysisError && /403/.test(error.message) && !error.message.includes(testApiKey));
  assert.equal(permanentCalls, 1);
});

test('network causes and empty-response reasons remain actionable without exposing keys', async () => {
  const cause = Object.assign(new Error('getaddrinfo generativelanguage.googleapis.com'), { code: 'ENOTFOUND' });
  const network = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'test', client: {
    models: { generateContent: async () => { throw new Error('fetch failed', { cause }); } },
  } });
  await assert.rejects(() => network.generateReport({ analysisTime: referenceTime.toISOString() }), /ENOTFOUND/);
  const response = new GenerateContentResponse();
  response.promptFeedback = { blockReason: 'SAFETY' as any };
  const blocked = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'test', client: {
    models: { generateContent: async () => response },
  } });
  await assert.rejects(() => blocked.generateReport({ analysisTime: referenceTime.toISOString() }), /SAFETY/);
});

test('partial text is preserved when the provider reports a token limit', async () => {
  const response = new GenerateContentResponse();
  response.candidates = [{ content: { parts: [{ text: 'Texto parcial original' }] }, finishReason: 'MAX_TOKENS' as any }];
  const service = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'test', client: {
    models: { generateContent: async () => response },
  } });
  const result = await service.generateReport({ analysisTime: referenceTime.toISOString() });
  assert.equal(result.report.rawText, 'Texto parcial original');
  assert.equal(result.report.finishReason, 'MAX_TOKENS');
});

test('daily analysis needs no market provider and never changes Gemini text', async () => {
  const repository = dailyAnalysisRepository();
  const text = 'Respuesta libre, con niveles y limitaciones propias del modelo.';
  let calls = 0;
  const dependencies = {
    repository, model: 'test', clock: () => referenceTime,
    generateReport: async () => { calls++; return {
      report: { rawText: text, macro: '', confluence: '', entryPlan: '', scenarios: [] as [] },
      calendar: { status: 'unavailable' as const, summary: '', citations: [] },
    }; },
  };
  const record = await runDailyAnalysis('2026-11-17', dependencies);
  assert.equal(record.status, 'published');
  assert.equal(record.report?.rawText, text);
  assert.equal(record.referencePrice, null);
  await runDailyAnalysis('2026-11-17', dependencies);
  assert.equal(calls, 1);
});

test('a previously failed daily record can recover instead of blocking Gemini forever', async () => {
  const repository = dailyAnalysisRepository();
  const failed = await runDailyAnalysis('2026-11-17', { repository, model: 'test', clock: () => referenceTime });
  assert.equal(failed.errorCode, 'missing_api_key');
  const recovered = await runDailyAnalysis('2026-11-17', {
    repository, model: 'test', clock: () => referenceTime,
    generateReport: async () => ({ report: validAnalysisReport(), calendar: { status: 'unavailable', summary: '', citations: [] } }),
  });
  assert.equal(recovered.status, 'published');
  assert.equal(recovered.errorCode, null);
});

test('daily analysis stores the sanitized provider reason for display', async () => {
  const record = await runDailyAnalysis('2026-11-17', {
    repository: dailyAnalysisRepository(), model: 'test', clock: () => referenceTime,
    generateReport: async () => { throw new GeminiAnalysisError('provider_error', '429 quota exceeded'); },
  });
  assert.equal(record.status, 'failed');
  assert.equal(record.sources.errorMessage, '429 quota exceeded');
});

test('free-form response and provider reason survive repository serialization', async () => {
  let row: Record<string, unknown> | undefined;
  const pool = { query: async (_sql: string, values: unknown[]) => {
    if (_sql.includes('INSERT INTO')) {
      const keys = ['analysis_date', 'status', 'report', 'sources', 'market_source', 'reference_price', 'reference_at', 'generated_at', 'model', 'prompt_version', 'error_code'];
      row = Object.fromEntries(keys.map((key, index) => [key, values[index]]));
      return { rows: [] };
    }
    return { rows: row ? [row] : [] };
  } } as unknown as Pool;
  const record = await runDailyAnalysis('2026-11-17', {
    repository: dailyAnalysisRepository(), model: 'test', clock: () => referenceTime,
    generateReport: async () => ({
      report: { rawText: '  ## Texto original\n\nSin esquema JSON.  ', macro: '', confluence: '', entryPlan: '', scenarios: [], finishReason: 'STOP', grounding: { citations: [{ title: 'Fuente', url: 'https://www.federalreserve.gov/' }], searchSuggestionsHtml: '<div>Search</div>' } },
      calendar: { status: 'unavailable', summary: '', citations: [] },
    }),
  });
  await saveAnalysisRecord(pool, record);
  assert.deepEqual((await findAnalysisByDate(pool, record.analysisDate))?.report, record.report);
  // El mismo informe persistido se entrega públicamente sin exigir una sesión.
  const app = buildApp({ pool, origin: 'http://localhost:5173', secureCookies: false });
  try {
    assert.equal((await app.inject('/api/auth/me')).statusCode, 401);
    const response = await app.inject('/api/analysis?limit=10');
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().analyses[0].report.rawText, record.report?.rawText);
  } finally { await app.close(); }

  record.status = 'failed'; record.report = null; record.errorCode = 'provider_error';
  record.sources.errorMessage = '429 quota exceeded';
  await saveAnalysisRecord(pool, record);
  assert.equal((await findAnalysisByDate(pool, record.analysisDate))?.sources.errorMessage, '429 quota exceeded');
});

test('analysis API distinguishes missing migrations from database connection errors without leaking secrets', async () => {
  for (const [databaseCode, expected] of [['42P01', 'analysis_schema_missing'], ['ECONNREFUSED', 'analysis_database_unavailable']] as const) {
    const pool = { query: async () => { throw Object.assign(new Error('private database details'), { code: databaseCode }); } } as unknown as Pool;
    const app = buildApp({ pool, origin: 'http://localhost:5173', secureCookies: false });
    try {
      const response = await app.inject('/api/analysis?limit=10');
      assert.equal(response.statusCode, 503);
      assert.equal(response.json().code, expected);
      assert.doesNotMatch(response.body, /private database details/);
      assert.match(response.json().message, databaseCode === '42P01' ? /db:migrate/ : /PostgreSQL/);
    } finally { await app.close(); }
  }
});

test('only allowlisted admins can trigger analysis generation from the API', async () => {
  const token = 'a'.repeat(43);
  let email = 'admin@example.test';
  let userId = 'u1';
  const pool = { query: async () => ({ rows: [{ id: userId, name: 'Admin', email }] }) } as unknown as Pool;
  let calls = 0;
  const app = buildApp({
    pool, origin: 'http://localhost:5173', secureCookies: false,
    analysis: { adminUserIds: ['u1'], generate: async () => { calls += 1; return { analysisDate: '2026-11-17', status: 'published' } as AnalysisRecord; } },
  });
  const post = (cookie?: string) => app.inject({ method: 'POST', url: '/api/analysis/generate', headers: { origin: 'http://localhost:5173', ...(cookie ? { cookie } : {}) } });
  try {
    assert.equal((await post()).statusCode, 401);
    assert.equal(calls, 0);
    const me = await app.inject({ url: '/api/auth/me', headers: { cookie: `xaurix_session=${token}` } });
    assert.equal(me.json().canGenerateAnalysis, true);
    const ok = await post(`xaurix_session=${token}`);
    assert.equal(ok.statusCode, 200);
    assert.equal(ok.json().analysis.analysisDate, '2026-11-17');
    // Reutilizar el correo del admin con otro ID no concede acceso.
    userId = 'u2';
    assert.equal((await post(`xaurix_session=${token}`)).statusCode, 403);
    assert.equal((await app.inject({ url: '/api/auth/me', headers: { cookie: `xaurix_session=${token}` } })).json().canGenerateAnalysis, false);
    assert.equal(calls, 1);
  } finally { await app.close(); }
});

test('reads never generate, and manual calls reject non-admins, forged roles and foreign origins', async () => {
  let calls = 0;
  const pool = { query: async (sql: string) => ({ rows: sql.includes('FROM sessions')
    ? [{ id: 'regular-user', name: 'User', email: 'admin@example.test' }] : [] }) } as unknown as Pool;
  const app = buildApp({ pool, origin: 'http://localhost:5173', secureCookies: false,
    analysis: { adminUserIds: ['real-admin'], generate: async () => { calls++; throw new Error('must not run'); } },
  });
  try {
    assert.equal((await app.inject('/api/analysis?limit=10')).statusCode, 200);
    assert.equal((await app.inject('/api/analysis?limit=10')).statusCode, 200);
    const headers = { origin: 'http://localhost:5173', cookie: `xaurix_session=${'a'.repeat(43)}` };
    assert.equal((await app.inject({ method: 'POST', url: '/api/analysis/generate', headers,
      payload: { role: 'admin', userId: 'real-admin', canGenerateAnalysis: true },
    })).statusCode, 403);
    assert.equal((await app.inject({ method: 'POST', url: '/api/analysis/generate', headers: { ...headers, origin: 'https://foreign.test' } })).statusCode, 403);
    assert.equal(calls, 0);
  } finally { await app.close(); }
});

test('simultaneous admin clicks share a single generation', async () => {
  const pool = { query: async () => ({ rows: [{ id: 'admin-id', name: 'Admin', email: 'admin@example.test' }] }) } as unknown as Pool;
  let calls = 0;
  let finish!: () => void;
  let entered!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const gate = new Promise<void>(resolve => { finish = resolve; });
  const app = buildApp({ pool, origin: 'http://localhost:5173', secureCookies: false,
    analysis: { adminUserIds: ['admin-id'], generate: async () => {
      calls++; entered(); await gate;
      return { analysisDate: '2026-11-17', status: 'published' } as AnalysisRecord;
    } },
  });
  const request = { method: 'POST' as const, url: '/api/analysis/generate', headers: {
    origin: 'http://localhost:5173', cookie: `xaurix_session=${'a'.repeat(43)}`,
  } };
  try {
    const first = app.inject(request);
    await started;
    const second = app.inject(request);
    await new Promise(resolve => setImmediate(resolve));
    finish();
    const results = await Promise.all([first, second]);
    assert.deepEqual(results.map(response => response.statusCode), [200, 200]);
    assert.equal(calls, 1);
  } finally { finish(); await app.close(); }
});

test('published reports are reused after prompt updates without calling Gemini', async () => {
  const repository = dailyAnalysisRepository();
  const record = await runDailyAnalysis('2026-11-17', {
    repository, model: 'test', clock: () => referenceTime,
    generateReport: async () => ({ report: validAnalysisReport(), calendar: { status: 'unavailable', summary: '', citations: [] } }),
  });
  record.promptVersion = 'old-version';
  assert.equal(await runDailyAnalysis('2026-11-17', { repository, model: 'test',
    generateReport: async () => { assert.fail('must reuse the stored daily report'); },
  }), record);
});

test('analysis generation reports provider failures without leaking details', async () => {
  const pool = { query: async () => ({ rows: [{ id: 'u1', name: 'Admin', email: 'admin@example.test' }] }) } as unknown as Pool;
  const app = buildApp({
    pool, origin: 'http://localhost:5173', secureCookies: false,
    analysis: { adminUserIds: ['u1'], generate: async () => ({ analysisDate: '2026-11-17', status: 'failed', sources: { errorMessage: 'Cuota de Gemini agotada.' } }) as unknown as AnalysisRecord },
  });
  try {
    const response = await app.inject({ method: 'POST', url: '/api/analysis/generate', headers: { origin: 'http://localhost:5173', cookie: `xaurix_session=${'a'.repeat(43)}` } });
    assert.equal(response.statusCode, 502);
    assert.match(response.json().message, /Cuota de Gemini agotada/);
  } finally { await app.close(); }
});

test('daily analysis scheduler runs at 08:00 Dominican time and catches up after 08:00', async () => {
  let now = new Date('2026-11-17T11:59:59Z');
  const calls: string[] = [];
  let scheduledCallback: (() => void) | undefined;
  const scheduler = startDailyAnalysisScheduler({
    run: async date => { calls.push(date); },
    clock: () => now,
    onError: () => assert.fail('scheduler should not report an error'),
    schedule: (_expression, callback, options) => {
      assert.equal(_expression, '0 8 * * *');
      assert.equal(options.timezone, 'America/Santo_Domingo');
      scheduledCallback = callback;
      return { stop: () => {} };
    },
  });
  assert.deepEqual(calls, []);
  now = new Date('2026-11-17T12:00:00Z');
  scheduledCallback?.();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(calls, ['2026-11-17']);
  scheduler.stop();

  now = new Date('2026-11-17T12:01:00Z');
  const catchUp = startDailyAnalysisScheduler({
    run: async date => { calls.push(date); },
    clock: () => now,
    onError: () => assert.fail('scheduler should not report an error'),
    schedule: () => ({ stop: () => {} }),
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(calls, ['2026-11-17', '2026-11-17']);
  catchUp.stop();
});

test('daily analysis scheduler stops with Fastify shutdown', async () => {
  const app = Fastify();
  let stopped = false;
  registerAnalysisScheduler(app, { stop: () => { stopped = true; } });
  await app.close();
  assert.equal(stopped, true);
});

test('node-cron accepts the Dominican time zone and daily schedule options', async () => {
  const scheduler = startDailyAnalysisScheduler({
    run: async () => assert.fail('startup is before 08:00 Dominican time'),
    onError: error => assert.fail(String(error)),
    clock: () => new Date('2026-11-17T11:00:00Z'),
  });
  await scheduler.stop();
});

test('real cron next execution is 08:00 RD (12:00 UTC)', async () => {
  const task = cron.schedule('0 8 * * *', () => {}, { timezone: 'America/Santo_Domingo', noOverlap: true });
  try {
    const next = task.getNextRun();
    assert.ok(next);
    assert.equal(next.getUTCHours(), 12);
    assert.equal(next.getUTCMinutes(), 0);
    assert.equal(next.getUTCSeconds(), 0);
    assert.equal(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Santo_Domingo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(next), '08:00');
  } finally { await task.destroy(); }
});

test('scheduler does not overlap active runs and stops after shutdown', async () => {
  let callback!: () => void;
  let finish!: () => void;
  let calls = 0;
  const gate = new Promise<void>(resolve => { finish = resolve; });
  const scheduler = startDailyAnalysisScheduler({
    clock: () => new Date('2026-11-17T12:00:00Z'),
    run: async () => { calls++; await gate; }, onError: error => assert.fail(String(error)),
    schedule: (_expr, cb) => { callback = cb; return { stop: () => {} }; },
  });
  callback(); callback();
  assert.equal(calls, 1);
  finish(); await scheduler.stop(); callback();
  assert.equal(calls, 1);
});
