import { describe, it, expect } from 'vitest';
import { formatMoney } from './format';
describe('money formatting', () => {
 it('formats exact integer and cent parts without floating point loss', () => {
  expect(formatMoney('9007199254740993.01')).toContain('9,007,199,254,740,993.01');
  expect(formatMoney('-1234.50')).toContain('-$1,234.50');
 });
 it('rejects malformed amounts', () => {
  expect(formatMoney('abc')).toBe('—');
 });
});
