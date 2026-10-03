import { describe, it, expect } from 'vitest';
import { formatMoney, filterPeriod, transactionCsv } from './format';
describe('presentation without accounting changes', () => {
 it('formats exact integer and cent parts without floating point loss', () => {
  expect(formatMoney('9007199254740993.01')).toContain('9,007,199,254,740,993.01');
  expect(formatMoney('-1234.50')).toContain('-$1,234.50');
 });
 it('keeps full history and anchors periods to the latest valuation', () => {
  const points = [{date:'2026-01-01',value:1},{date:'2026-08-01',value:2},{date:'2026-09-08',value:3}];
  expect(filterPeriod(points,'1M')).toEqual([points[2]]);
  expect(filterPeriod(points,'ALL')).toEqual(points);
 });
 it('escapes exported strings and prevents formula execution', () => {
  const csv = transactionCsv([{id:'1',type:'deposit',label:'=SUM(1,2)',date:'2026-09-08',amount:'25.00',status:'completed'}]);
  expect(csv).toContain("'=SUM(1,2)");
  expect(csv).toContain('25.00');
 });
});
