import { describe, expect, it } from 'vitest';
import { nextCandle, seedCandles, visibleRange, type Candle } from './candles';

const seq = (values: number[]) => { let i = 0; return () => values[i++ % values.length]; };

describe('nextCandle', () => {
  it('abre donde cerró la vela anterior', () => {
    const c = nextCandle(120, seq([0.5, 0.5, 0.5]));
    expect(c.o).toBe(120);
  });
  it('mantiene máximo >= max(o,c) y mínimo <= min(o,c)', () => {
    for (let i = 0; i < 200; i++) {
      const c = nextCandle(100, Math.random);
      expect(c.h).toBeGreaterThanOrEqual(Math.max(c.o, c.c));
      expect(c.l).toBeLessThanOrEqual(Math.min(c.o, c.c));
    }
  });
  it('sube cuando el azar es alto y baja cuando es bajo', () => {
    expect(nextCandle(100, seq([0.99, 0, 0])).c).toBeGreaterThan(100);
    expect(nextCandle(100, seq([0, 0, 0])).c).toBeLessThan(100);
  });
});

describe('seedCandles', () => {
  it('encadena las velas y respeta la cantidad', () => {
    const cs = seedCandles(50, Math.random);
    expect(cs).toHaveLength(50);
    for (let i = 1; i < cs.length; i++) expect(cs[i].o).toBe(cs[i - 1].c);
  });
});

describe('visibleRange', () => {
  it('devuelve el mínimo y máximo del tramo visible', () => {
    const cs: Candle[] = [{ o: 1, c: 2, h: 3, l: 0 }, { o: 2, c: 5, h: 9, l: 1 }];
    expect(visibleRange(cs)).toEqual({ min: 0, max: 9 });
  });
  it('evita rango cero', () => {
    const r = visibleRange([{ o: 5, c: 5, h: 5, l: 5 }]);
    expect(r.max).toBeGreaterThan(r.min);
  });
});
