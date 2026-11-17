import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateEma, calculateMomentum, calculateRsi } from '../src/analysis/indicators.js';
import { calculateScenarioMetrics, validateScenario } from '../src/analysis/scenarios.js';

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
