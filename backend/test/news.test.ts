import assert from 'node:assert/strict';
import test from 'node:test';
import { createNewsService, makeSpanishBrief, parseNewsFeed } from '../src/news.js';

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

test('redacta un breve en español solo con tipos verificados de la Fed', () => {
  const item = parseNewsFeed(xml('https://www.federalreserve.gov/newsevents/pressreleases/one.htm', 'Federal Reserve issues FOMC statement'), fed)[0]!;
  const brief = makeSpanishBrief(item, '<p>The Committee decided to maintain the target range for the federal funds rate at 3-3/4 to 4 percent, in support of its mandate.</p>');
  assert.match(brief?.title ?? '', /3,75 %–4,00 %/);
  assert.equal(brief?.facts.length, 2);
  assert.equal(makeSpanishBrief(item, '<p>No rate is published here.</p>'), null);
});

test('extrae las tres tasas del BCE sin interpretar otros comunicados', () => {
  const ecb = { url: 'https://www.ecb.europa.eu/rss/press.html', host: 'ecb.europa.eu', source: 'Banco Central Europeo', category: 'Economía europea' } as const;
  const item = parseNewsFeed(xml('https://www.ecb.europa.eu/press/pr/date/2026/a.html', 'Monetary policy decisions'), ecb)[0]!;
  const brief = makeSpanishBrief(item, '<p>The interest rates on the deposit facility, the main refinancing operations and the marginal lending facility will remain unchanged at 2.50%, 2.65% and 2.90% respectively.</p>');
  assert.match(brief?.title ?? '', /2,50 %/);
  assert.deepEqual(brief?.facts.map(fact => fact.value), ['2,50 %', '2,65 %', '2,90 %']);
});
