import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dueSlot, spreadSlots } from '../src/market/schedule.js';

test('spreads 20 runs evenly across 24 hours', () => {
  const slots = spreadSlots(20);
  assert.equal(slots.length, 20);
  assert.equal(slots[0], 0);
  assert.ok(slots.every((slot, i) => i === 0 || slot - slots[i - 1]! === 72));
  assert.ok(slots.at(-1)! < 1440);
});

test('spreads 5 runs every 288 minutes with an offset', () => {
  assert.deepEqual(spreadSlots(5, 60), [60, 348, 636, 924, 1212]);
});

test('rejects invalid run counts', () => {
  for (const bad of [0, -1, 1.5, 1441]) assert.throws(() => spreadSlots(bad));
});

test('slot is due when the provider never ran', () => {
  const now = new Date('2026-11-15T10:10:00Z');
  assert.equal(dueSlot([0, 72, 144, 216, 288, 360, 432, 504, 576, 648], now, null), 576);
});

test('slot is not due again after running within it', () => {
  const now = new Date('2026-11-15T10:10:00Z'); // minute 610 -> slot 576 (09:36)
  assert.equal(dueSlot([0, 576], now, new Date('2026-11-15T09:40:00Z')), null);
});

test('next slot is due after the previous one ran', () => {
  const now = new Date('2026-11-15T11:00:00Z'); // minute 660
  assert.equal(dueSlot([0, 576, 648], now, new Date('2026-11-15T09:40:00Z')), 648);
});

test('nothing is due before the first slot of the day', () => {
  assert.equal(dueSlot([60, 300], new Date('2026-11-15T00:30:00Z'), null), null);
});

test('only the latest missed slot is returned (no catch-up stacking)', () => {
  assert.equal(dueSlot([0, 100, 200], new Date('2026-11-15T05:00:00Z'), null), 200);
});
