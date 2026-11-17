import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateEma, calculateMomentum, calculateRsi } from '../src/analysis/indicators.js';
import { createGeminiAnalysisClient, GeminiAnalysisError } from '../src/analysis/gemini.js';
import { createMarketDataClient, MarketDataError } from '../src/analysis/marketData.js';
import { calculateScenarioMetrics, validateScenario } from '../src/analysis/scenarios.js';
import { readConfig } from '../src/config.js';
import type { AnalysisInput, AnalysisReport } from '../src/analysis/types.js';

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

test('market data reports provider errors without exposing the API key', async () => {
  for (const [status, code] of [[403, 'provider_forbidden'], [429, 'rate_limited']] as const) {
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
  assert.match(String(fake.calls[1]?.input), /GoldPrice\.dev/);
  assert.match(String(fake.calls[1]?.input), /no busques.*cotizaciones/i);
  assert.match(String(fake.calls[1]?.input), /precio de referencia/i);
  assert.match(String(fake.calls[1]?.input), /no recibió capturas/i);
  assert.match(String(fake.calls[1]?.input), /isStale.*no propongas niveles/i);
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
