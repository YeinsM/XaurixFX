import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AcademyLevel } from '../types';
import { LevelPanel, priceLabel } from './LearningPath';

const capsule = { id: '1.3-a', title: 'Bid, ask y spread', topic: '1.3 · Cómo se forma el precio', objective: 'Leer los dos precios.', durationSec: 39, narrated: true };
const free: AcademyLevel = { level: 1, name: 'Trading desde cero', free: true, priceUsdt: null, unlocked: true,
  capsules: [{ ...capsule, media: { video: '/api/academy/media/1.3-a/video', subtitles: '/api/academy/media/1.3-a/subtitles', pdf: '/api/academy/media/1.3-a/pdf' } }] };
const paid: AcademyLevel = { level: 3, name: 'Análisis', free: false, priceUsdt: null, unlocked: false, capsules: [{ ...capsule, id: '3.1-a', media: null }] };

describe('LevelPanel', () => {
  it('reproduce el video con subtítulos y ofrece la guía PDF en niveles gratuitos', () => {
    const html = renderToStaticMarkup(<LevelPanel level={free} />);
    expect(html).toContain('src="/api/academy/media/1.3-a/video"');
    expect(html).toContain('<track');
    expect(html).toContain('href="/api/academy/media/1.3-a/pdf"');
    expect(html).toContain('Gratis');
  });
  it('muestra solo el temario bloqueado en niveles de pago', () => {
    const html = renderToStaticMarkup(<LevelPanel level={paid} />);
    expect(html).not.toContain('<video');
    expect(html).toContain('Precio por definir');
    expect(priceLabel({ ...paid, priceUsdt: 59 })).toBe('59 USDT');
  });
  it('un nivel de pago desbloqueado por el backend (admin) muestra el reproductor', () => {
    const media = { video: '/v', subtitles: '/s', pdf: '/p' };
    const html = renderToStaticMarkup(<LevelPanel level={{ ...paid, unlocked: true, capsules: [{ ...paid.capsules[0], media }] }} />);
    expect(html).toContain('<video');
    expect(html).toContain('Vista de administrador');
  });
  it('ofrece el manual del nivel solo si el backend da su URL', () => {
    expect(renderToStaticMarkup(<LevelPanel level={{ ...paid, unlocked: true, manual: '/api/academy/manual/3', capsules: [{ ...paid.capsules[0], media: { video: '/v', subtitles: '/s', pdf: '/p' } }] }} />))
      .toContain('href="/api/academy/manual/3"');
    const locked = renderToStaticMarkup(<LevelPanel level={{ ...paid, hasManual: true, manual: null }} />);
    expect(locked).not.toContain('/api/academy/manual');
    expect(locked).toContain('manual completo en PDF');
  });
});
