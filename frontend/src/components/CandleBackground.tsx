import { useEffect, useRef } from 'react';
import { nextCandle, seedCandles, visibleRange, type Candle } from '../lib/candles';

const WIDTH = 14, GAP = 5, SPEED = 0.35;

/** Fondo decorativo de velas ilustrativas (no representan datos reales). */
export function CandleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, offset = 0, raf = 0;
    let candles: Candle[] = seedCandles(260, Math.random);

    const resize = () => { w = canvas.width = Math.floor(innerWidth * dpr); h = canvas.height = Math.floor(innerHeight * dpr); };
    resize(); addEventListener('resize', resize);

    const frame = () => {
      const step = (WIDTH + GAP) * dpr;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(53,224,161,.06)'; ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 80 * dpr) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      const visible = candles.slice(-(Math.ceil(w / step) + 2));
      const { min, max } = visibleRange(visible);
      const scale = (h * 0.55) / (max - min), top = h * 0.2, Y = (v: number) => top + (max - v) * scale;
      visible.forEach((c, i) => {
        const x = w - (visible.length - i) * step + offset;
        ctx.strokeStyle = ctx.fillStyle = c.c >= c.o ? '#35e0a1' : '#ff5d6c';
        ctx.lineWidth = 2 * dpr; ctx.beginPath(); ctx.moveTo(x + (WIDTH * dpr) / 2, Y(c.h)); ctx.lineTo(x + (WIDTH * dpr) / 2, Y(c.l)); ctx.stroke();
        ctx.fillRect(x, Math.min(Y(c.o), Y(c.c)), WIDTH * dpr, Math.max(3 * dpr, Math.abs(Y(c.o) - Y(c.c))));
      });
      if (reduce) return;
      offset += SPEED * dpr;
      if (offset >= step) { offset -= step; candles = [...candles.slice(-500), nextCandle(candles[candles.length - 1].c, Math.random)]; }
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);

  return <><canvas ref={ref} className="tm-canvas" aria-hidden="true" /><div className="tm-vignette" aria-hidden="true" /></>;
}
