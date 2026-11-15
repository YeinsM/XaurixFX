export type Candle = { o: number; c: number; h: number; l: number };
type Rand = () => number;

/** Vela ilustrativa: abre en `open` y se mueve al azar. No son datos de mercado. */
export function nextCandle(open: number, rand: Rand): Candle {
  const c = open + (rand() - 0.48) * 7;
  const h = Math.max(open, c) + rand() * 4;
  const l = Math.min(open, c) - rand() * 4;
  return { o: open, c, h, l };
}

export function seedCandles(count: number, rand: Rand, start = 100): Candle[] {
  const out: Candle[] = [];
  let price = start;
  for (let i = 0; i < count; i++) { const c = nextCandle(price, rand); out.push(c); price = c.c; }
  return out;
}

export function visibleRange(candles: Candle[]): { min: number; max: number } {
  let min = Infinity, max = -Infinity;
  for (const c of candles) { if (c.l < min) min = c.l; if (c.h > max) max = c.h; }
  if (max - min < 1e-9) max = min + 1;
  return { min, max };
}
