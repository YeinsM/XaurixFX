import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { calculateEma, calculateMomentum, calculateRsi } from '../src/analysis/indicators.js';
import { createGeminiAnalysisClient, GeminiAnalysisError } from '../src/analysis/gemini.js';
import { createMarketDataClient, MarketDataError } from '../src/analysis/marketData.js';
import { calculateScenarioMetrics, validateScenario } from '../src/analysis/scenarios.js';
import { runDailyAnalysis } from '../src/analysis/service.js';
import { registerAnalysisScheduler, startDailyAnalysisScheduler } from '../src/analysis/scheduler.js';
import { readConfig } from '../src/config.js';
import type { AnalysisInput, AnalysisRecord, AnalysisReport, MarketInterval, MarketSnapshot } from '../src/analysis/types.js';

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

const analysisInput: AnalysisInput = {
  analysisTime: '2026-11-17T13:00:00Z',
  snapshot: {
    symbol: 'XAU-USD-SPOT',
    spot: {
      price: '2000.00', isStale: false, computedAt: '2026-11-17T12:00:00Z',
      source: 'GoldPrice.dev', sources: [],
    },
    bars: ['5m', '15m', '1h', '4h'].map(interval => ({
      interval: interval as '5m' | '15m' | '1h' | '4h',
      bars: [{
        barStart: '2026-11-17T11:55:00Z', open: '1999', high: '2001',
        low: '1998', close: '2000', volume: null, isClosed: true,
      }],
    })),
  },
  indicators: ['5m', '15m', '1h', '4h'].map(interval => ({
    interval: interval as '5m' | '15m' | '1h' | '4h',
    ema20: 2000, ema50: 1998, ema200: 1990, rsi14: 52, momentum14: 101,
  })),
  actionableData: true,
  barsAreCurrent: true,
};

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

function calendarResponse(text = 'Próximo evento relevante: dato de inflación de EE. UU.') {
  return {
    output_text: text,
    steps: [{
      type: 'model_output',
      content: [{
        type: 'text',
        text,
        annotations: [{ type: 'url_citation', url: 'https://www.federalreserve.gov/calendar.htm', title: 'Federal Reserve' }],
      }],
    }],
  };
}

function completeSnapshot(options: { stale?: boolean; bars?: number; omit?: MarketInterval } = {}): MarketSnapshot {
  const now = referenceTime.getTime();
  const intervals: Array<[MarketInterval, number]> = [
    ['5m', 5 * 60_000], ['15m', 15 * 60_000], ['1h', 60 * 60_000], ['4h', 4 * 60 * 60_000],
  ];
  const length = options.bars ?? 200;
  return {
    symbol: 'XAU-USD-SPOT',
    spot: {
      price: '2000.00', isStale: options.stale ?? false,
      computedAt: referenceTime.toISOString(), source: 'GoldPrice.dev', sources: [],
    },
    bars: intervals.filter(([interval]) => interval !== options.omit).map(([interval, duration]) => ({
      interval,
      bars: Array.from({ length }, (_, index) => {
        const close = 1900 + index / 10;
        return {
          barStart: new Date(now - (length - index) * duration).toISOString(),
          open: close.toFixed(2), high: (close + 1).toFixed(2),
          low: (close - 1).toFixed(2), close: close.toFixed(2),
          volume: null, isClosed: true,
        };
      }),
    })),
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

function geminiClient(responses: unknown[] | Error[]) {
  const calls: Array<Record<string, unknown>> = [];
  return {
    calls,
    client: {
      interactions: {
        create: async (request: Record<string, unknown>) => {
          calls.push(request);
          const response = responses.shift();
          if (response instanceof Error) throw response;
          return response;
        },
      },
    },
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

test('Gemini grounds only the calendar request and analyzes supplied market data without search', async () => {
  const fake = geminiClient([
    calendarResponse(),
    { output_text: JSON.stringify(validAnalysisReport()) },
  ]);
  const service = createGeminiAnalysisClient({
    apiKey: testApiKey,
    model: 'gemini-test',
    client: fake.client,
  });
  const result = await service.generateReport(analysisInput);

  assert.equal(fake.calls.length, 2);
  assert.deepEqual(fake.calls[0]?.tools, [{ type: 'google_search' }]);
  assert.equal(fake.calls[0]?.store, false);
  assert.equal(fake.calls[1]?.tools, undefined);
  assert.equal(fake.calls[1]?.store, false);
  assert.match(String(fake.calls[0]?.input), /calendario/i);
  assert.match(String(fake.calls[0]?.input), /9:00/);
  assert.match(String(fake.calls[1]?.input), /GoldPrice\.dev/);
  assert.match(String(fake.calls[1]?.input), /no busques.*cotizaciones/i);
  assert.match(String(fake.calls[1]?.input), /precio de referencia/i);
  assert.match(String(fake.calls[1]?.input), /no recibió capturas/i);
  assert.match(String(fake.calls[1]?.input), /isStale.*no propongas niveles/i);
  assert.match(String(fake.calls[1]?.input), /actionableData.*false.*dirección wait/i);
  assert.match(String(fake.calls[1]?.input), /EMA 20/);
  assert.equal(result.calendar.status, 'verified');
  assert.deepEqual(result.calendar.citations, [{
    url: 'https://www.federalreserve.gov/calendar.htm', title: 'Federal Reserve',
  }]);
});

test('Gemini reports calendar unavailable without citations and still generates technical analysis', async () => {
  const fake = geminiClient([
    {
      output_text: 'Evento de inflación no verificado.',
      steps: [{ type: 'model_output', content: [{ type: 'text', text: 'Evento de inflación no verificado.' }] }],
    },
    { output_text: JSON.stringify(validAnalysisReport()) },
  ]);
  const service = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'gemini-test', client: fake.client });
  const result = await service.generateReport(analysisInput);
  assert.equal(result.calendar.status, 'unavailable');
  assert.deepEqual(result.calendar.citations, []);
  assert.match(result.calendar.summary, /no se pudo verificar/i);
  assert.doesNotMatch(String(fake.calls[1]?.input), /Evento de inflación no verificado/);
  assert.equal(fake.calls.length, 2);
});

test('Gemini rejects malformed JSON, missing fields and raw HTML in report text', async () => {
  const incomplete = { macro: 'Estructura', confluence: 'EMA' };
  for (const output of ['{', JSON.stringify(incomplete), JSON.stringify({ ...validAnalysisReport(), macro: '<script>alert(1)</script>' })]) {
    const fake = geminiClient([calendarResponse(), { output_text: output }]);
    const service = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'gemini-test', client: fake.client });
    await assert.rejects(service.generateReport(analysisInput), error =>
      error instanceof GeminiAnalysisError && error.code === 'invalid_report');
  }
});

test('Gemini provider failures are explicit and do not expose credentials', async () => {
  const fake = geminiClient([calendarResponse(), new Error(`provider rejected ${testApiKey}`)]);
  const service = createGeminiAnalysisClient({ apiKey: testApiKey, model: 'gemini-test', client: fake.client });
  await assert.rejects(service.generateReport(analysisInput), error =>
    error instanceof GeminiAnalysisError && error.code === 'provider_error' && !error.message.includes(testApiKey));
});

test('daily analysis calculates indicators, publishes the report and attaches scenario metrics', async () => {
  const repository = dailyAnalysisRepository();
  let receivedInput: AnalysisInput | undefined;
  const result = await runDailyAnalysis('2026-11-17', {
    repository,
    marketData: { fetchSnapshot: async () => completeSnapshot() },
    generateReport: async input => {
      receivedInput = input;
      return { report: validAnalysisReport(), calendar: calendarResponseResult };
    },
    model: 'gemini-test',
    clock: () => referenceTime,
  });

  assert.equal(result.status, 'published');
  assert.equal(result.referencePrice, '2000.00');
  assert.equal(receivedInput?.indicators.find(item => item.interval === '4h')?.ema200, 1909.95);
  assert.equal(result.report?.scenarios[0].metrics?.entryReference, 2001);
  assert.deepEqual(result.report?.scenarios[0].metrics?.rewardRisk, [1.8, 2.6, 3.4]);
  assert.equal(result.sources.calendar.status, 'verified');
});

const calendarResponseResult = {
  status: 'verified' as const,
  summary: 'Próximo evento relevante.',
  citations: [{ url: 'https://www.federalreserve.gov/calendar.htm', title: 'Federal Reserve' }],
};

test('missing credentials persist a sanitized failure without calling providers', async () => {
  const repository = dailyAnalysisRepository();
  const result = await runDailyAnalysis('2026-11-17', {
    repository,
    model: 'gemini-test',
    clock: () => referenceTime,
  });

  assert.equal(result.status, 'failed');
  assert.equal(result.errorCode, 'missing_api_key');
});

test('incomplete market data persists insufficient_data without generating levels', async () => {
  const gappedSnapshot = completeSnapshot();
  const m5Bars = gappedSnapshot.bars.find(item => item.interval === '5m')!.bars;
  m5Bars[80]!.barStart = new Date(Date.parse(m5Bars[80]!.barStart) + 5 * 60_000).toISOString();
  for (const snapshot of [
    completeSnapshot({ omit: '5m' }),
    completeSnapshot({ bars: 199 }),
    gappedSnapshot,
  ]) {
    const repository = dailyAnalysisRepository();
    let reportCalls = 0;
    const result = await runDailyAnalysis('2026-11-17', {
      repository,
      marketData: { fetchSnapshot: async () => snapshot },
      generateReport: async () => {
        reportCalls++;
        return { report: validAnalysisReport(), calendar: calendarResponseResult };
      },
      model: 'gemini-test',
      clock: () => referenceTime,
    });

    assert.equal(result.status, 'insufficient_data');
    assert.equal(reportCalls, 0);
  }
});

test('stale bars keep historical context but never publish actionable scenario levels', async () => {
  const staleBars = completeSnapshot();
  const staleBarsSnapshot = completeSnapshot();
  for (const bar of staleBarsSnapshot.bars.find(item => item.interval === '5m')!.bars) {
    bar.barStart = new Date(Date.parse(bar.barStart) - 30 * 60_000).toISOString();
  }
  for (const timeframe of staleBars.bars) {
    for (const bar of timeframe.bars) {
      bar.barStart = new Date(Date.parse(bar.barStart) - 48 * 60 * 60_000).toISOString();
    }
  }
  for (const snapshot of [staleBars, staleBarsSnapshot, completeSnapshot({ stale: true })]) {
    const repository = dailyAnalysisRepository();
    let actionableData = true;
    const result = await runDailyAnalysis('2026-11-17', {
      repository,
      marketData: { fetchSnapshot: async () => snapshot },
      generateReport: async input => {
        actionableData = input.actionableData;
        return { report: validAnalysisReport(), calendar: calendarResponseResult };
      },
      model: 'gemini-test',
      clock: () => referenceTime,
    });

    assert.equal(result.status, 'published');
    assert.equal(actionableData, false);
    assert.ok(result.report?.scenarios.every(scenario =>
      scenario.direction === 'wait' && scenario.entryLow === null && scenario.entryHigh === null &&
      scenario.stopLoss === null && scenario.takeProfits.every(price => price === null)));
    assert.match(result.report?.entryPlan ?? '', /datos no actuales/i);
    const barSource = result.sources.market.find(source => source.displayName === 'Velas cerradas');
    assert.equal(barSource?.isStale, snapshot === staleBars || snapshot === staleBarsSnapshot);
  }
});

test('a provider quote newer than the fetch start is validated against post-fetch time', async () => {
  const snapshot = completeSnapshot();
  snapshot.spot.computedAt = '2026-11-17T12:00:00.500Z';
  let clockCalls = 0;
  const result = await runDailyAnalysis('2026-11-17', {
    repository: dailyAnalysisRepository(),
    marketData: { fetchSnapshot: async () => snapshot },
    generateReport: async () => ({ report: validAnalysisReport(), calendar: calendarResponseResult }),
    model: 'gemini-test',
    clock: () => new Date(referenceTime.getTime() + Math.max(0, clockCalls++) * 1000),
  });
  assert.equal(result.status, 'published');
});

test('non-transient provider errors fail once while transient errors retry with backoff', async () => {
  const permanentRepository = dailyAnalysisRepository();
  let permanentAttempts = 0;
  const permanent = await runDailyAnalysis('2026-11-17', {
    repository: permanentRepository,
    marketData: {
      fetchSnapshot: async () => {
        permanentAttempts++;
        throw new MarketDataError('provider_error', 'permanent request failure');
      },
    },
    generateReport: async () => ({ report: validAnalysisReport(), calendar: calendarResponseResult }),
    model: 'gemini-test',
    clock: () => referenceTime,
    sleep: async () => {},
  });
  assert.equal(permanent.status, 'failed');
  assert.equal(permanentAttempts, 1);

  const forbiddenRepository = dailyAnalysisRepository();
  let forbiddenAttempts = 0;
  const forbidden = await runDailyAnalysis('2026-11-17', {
    repository: forbiddenRepository,
    marketData: {
      fetchSnapshot: async () => {
        forbiddenAttempts++;
        throw new MarketDataError('provider_forbidden', 'plan does not allow bars');
      },
    },
    generateReport: async () => ({ report: validAnalysisReport(), calendar: calendarResponseResult }),
    model: 'gemini-test',
    clock: () => referenceTime,
  });
  assert.equal(forbidden.status, 'failed');
  assert.equal(forbidden.errorCode, 'provider_forbidden');
  assert.equal(forbiddenAttempts, 1);

  const retryRepository = dailyAnalysisRepository();
  let attempts = 0;
  const delays: number[] = [];
  const retried = await runDailyAnalysis('2026-11-17', {
    repository: retryRepository,
    marketData: {
      fetchSnapshot: async () => {
        attempts++;
        if (attempts === 1) throw new MarketDataError('provider_unavailable', 'temporary failure');
        return completeSnapshot();
      },
    },
    generateReport: async () => ({ report: validAnalysisReport(), calendar: calendarResponseResult }),
    model: 'gemini-test',
    clock: () => referenceTime,
    sleep: async milliseconds => { delays.push(milliseconds); },
  });
  assert.equal(retried.status, 'published');
  assert.equal(attempts, 2);
  assert.deepEqual(delays, [60_000]);

  const modelRepository = dailyAnalysisRepository();
  let modelAttempts = 0;
  const modelDelays: number[] = [];
  const modelRetried = await runDailyAnalysis('2026-11-17', {
    repository: modelRepository,
    marketData: { fetchSnapshot: async () => completeSnapshot() },
    generateReport: async () => {
      modelAttempts++;
      if (modelAttempts === 1) throw new GeminiAnalysisError('provider_error', 'temporary failure');
      return { report: validAnalysisReport(), calendar: calendarResponseResult };
    },
    model: 'gemini-test',
    clock: () => referenceTime,
    sleep: async milliseconds => { modelDelays.push(milliseconds); },
  });
  assert.equal(modelRetried.status, 'published');
  assert.equal(modelAttempts, 2);
  assert.deepEqual(modelDelays, [60_000]);
});

test('exhausted transient retries persist failed and duplicate daily runs are idempotent', async () => {
  const repository = dailyAnalysisRepository();
  let attempts = 0;
  const delays: number[] = [];
  const dependencies = {
    repository,
    marketData: {
      fetchSnapshot: async () => {
        attempts++;
        throw new MarketDataError('rate_limited', 'temporary failure');
      },
    },
    generateReport: async () => ({ report: validAnalysisReport(), calendar: calendarResponseResult }),
    model: 'gemini-test',
    clock: () => referenceTime,
    sleep: async (milliseconds: number) => { delays.push(milliseconds); },
  };
  const failed = await runDailyAnalysis('2026-11-17', dependencies);
  assert.equal(failed.status, 'failed');
  assert.equal(attempts, 4);
  assert.deepEqual(delays, [60_000, 300_000, 900_000]);

  let duplicateProviderCalls = 0;
  const existing = await runDailyAnalysis('2026-11-17', {
    repository,
    marketData: { fetchSnapshot: async () => { duplicateProviderCalls++; return completeSnapshot(); } },
    generateReport: async () => ({ report: validAnalysisReport(), calendar: calendarResponseResult }),
    model: 'gemini-test',
    clock: () => referenceTime,
  });
  assert.equal(existing, failed);
  assert.equal(duplicateProviderCalls, 0);
  assert.equal(repository.records.size, 1);
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
