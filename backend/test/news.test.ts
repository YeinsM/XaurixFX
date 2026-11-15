import assert from 'node:assert/strict';
import test from 'node:test';
import { createNewsService, parseNewsFeed } from '../src/news.js';

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
    return new Response(xml('https://www.federalreserve.gov/newsevents/pressreleases/one.htm'), { status: 200 });
  });
  const [first, second] = await Promise.all([getNews(), getNews()]);
  assert.equal(requests, 2);
  assert.equal(first.items.length, 1);
  assert.deepEqual(first, second);
  await getNews();
  assert.equal(requests, 2);
});
