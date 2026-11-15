import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseCoinGecko, parseEodhd, parseMassive } from '../src/market/providers.js';

test('parses CoinGecko simple price response', () => {
  const quotes = parseCoinGecko({ bitcoin: { usd: 65000.5, usd_24h_change: -1.25 }, ethereum: { usd: 3200 } });
  assert.deepEqual(quotes, [
    { providerSymbol: 'bitcoin', price: 65000.5, changePercent: -1.25, sourceTime: null },
    { providerSymbol: 'ethereum', price: 3200, changePercent: null, sourceTime: null },
  ]);
});

test('parses EODHD array and single-object responses', () => {
  const row = { code: 'GSPC.INDX', close: 5900.1, change_p: 0.42, timestamp: 1763200000 };
  assert.equal(parseEodhd([row])[0]?.providerSymbol, 'GSPC.INDX');
  assert.equal(parseEodhd(row)[0]?.sourceTime?.toISOString(), '2025-11-15T09:46:40.000Z');
});

test('skips EODHD rows with non-numeric prices ("NA")', () => {
  assert.deepEqual(parseEodhd([{ code: 'X.US', close: 'NA', change_p: 'NA' }]), []);
});

test('parses Massive previous-day aggregate', () => {
  const [quote] = parseMassive('AAPL', { results: [{ o: 100, c: 102, t: 1763168400000 }] });
  assert.equal(quote?.providerSymbol, 'AAPL');
  assert.equal(quote?.price, 102);
  assert.equal(quote?.changePercent, 2);
});

test('Massive response without results yields no quotes', () => {
  assert.deepEqual(parseMassive('AAPL', { resultsCount: 0 }), []);
});
