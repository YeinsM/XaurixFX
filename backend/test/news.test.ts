import assert from 'node:assert/strict';
import test from 'node:test';
import { createNewsService, extractArticleExcerpt, parseNewsFeed } from '../src/news.js';

const fed = { url: 'https://www.federalreserve.gov/feeds/press_monetary.xml', host: 'federalreserve.gov', source: 'Reserva Federal', category: 'Política monetaria' } as const;
const xml = (link: string, title = 'Actualización de política monetaria') => `<rss><channel><item><title>${title}</title><link>${link}</link><description>Comunicado oficial.</description><pubDate>Thu, 12 Nov 2026 17:45:00 GMT</pubDate></item></channel></rss>`;

test('normaliza titulares oficiales y descarta enlaces a otros dominios', () => {
  const valid = parseNewsFeed(xml('https://www.federalreserve.gov/newsevents/pressreleases/one.htm'), fed);
  assert.equal(valid.length, 1);
  assert.equal(valid[0]?.source, 'Reserva Federal');
  assert.equal(parseNewsFeed(xml('https://example.com/redirect'), fed).length, 0);
  assert.equal(parseNewsFeed(xml('javascript:alert(1)'), fed).length, 0);
  assert.equal(parseNewsFeed(xml('https://www.federalreserve.gov/a', 'Board&#39;s decision'), fed)[0]?.title, "Board's decision");
});

test('agrupa solicitudes y conserva los resultados cuando falla una fuente', async () => {
  let requests = 0;
  const getNews = createNewsService(async input => {
    requests++;
    if (String(input).includes('ecb.europa.eu')) throw new Error('Fuente no disponible');
    if (String(input).endsWith('one.htm')) return new Response('<main><p>The committee decided to keep the target range unchanged after reviewing recent data on inflation and labor markets.</p></main>', { status: 200 });
    return new Response(xml('https://www.federalreserve.gov/newsevents/pressreleases/one.htm'), { status: 200 });
  }, async texts => texts.map(value => value ? `ES: ${value}` : ''));
  const [first, second] = await Promise.all([getNews(), getNews()]);
  assert.equal(requests, 3);
  assert.equal(first.items.length, 1);
  assert.match(first.items[0]?.titleEs ?? '', /^ES:/);
  assert.match(first.items[0]?.excerptEs ?? '', /committee decided/);
  assert.deepEqual(first, second);
  await getNews();
  assert.equal(requests, 3);
});

test('extrae un párrafo breve del cuerpo del comunicado, sin incluir navegación', () => {
  const html = '<nav><p>This is navigation and must not be used as the excerpt even if it contains a lot of text.</p></nav><main><p>The Governing Council decided to leave its key interest rates unchanged after examining incoming economic and financial data.</p></main>';
  assert.match(extractArticleExcerpt(html, 'Banco Central Europeo'), /^The Governing Council/);
});

test('conserva la noticia original cuando falla el traductor', async () => {
  const service = createNewsService(async input => {
    if (String(input).includes('/feeds/')) return new Response(xml('https://www.federalreserve.gov/newsevents/pressreleases/one.htm'));
    return new Response('<main><p>The Federal Reserve published a statement that explains its decision about monetary policy and the economic outlook.</p></main>');
  }, async () => { throw new Error('Modelo ausente'); });
  const { items } = await service();
  assert.equal(items.length, 1);
  assert.equal(items[0]?.titleEs, undefined);
  assert.match(items[0]?.excerpt ?? '', /Federal Reserve published/);
});
