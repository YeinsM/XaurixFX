import { describe, it, expect } from 'vitest';
import { demoDashboard } from '../../../backend/src/demo';
describe('demo percentage chart contract',()=>{
 it('uses percentage points and agrees with the summary',()=>{
  expect(demoDashboard.performance[0].value).toBe(0);
  expect(demoDashboard.performance.at(-1)?.value).toBe(Number(demoDashboard.account.returnPercent));
  expect(demoDashboard.performance.every(p=>Math.abs(p.value)<100)).toBe(true);
 });
});
