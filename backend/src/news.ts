import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  source: 'Reserva Federal' | 'Banco Central Europeo';
  category: 'Política monetaria' | 'Economía europea';
  publishedAt: string;
  url: string;
  briefEs?: SpanishBrief;
};

export type SpanishBrief = {
  title: string;
  lead: string;
  facts: { label: string; value: string }[];
  paragraphs: string[];
};

const feeds = [
  { url: 'https://www.federalreserve.gov/feeds/press_monetary.xml', host: 'federalreserve.gov', source: 'Reserva Federal', category: 'Política monetaria' },
  { url: 'https://www.ecb.europa.eu/rss/press.html', host: 'ecb.europa.eu', source: 'Banco Central Europeo', category: 'Economía europea' },
] as const;

const parser = new XMLParser({ ignoreAttributes: false, trimValues: true, processEntities: true });
const asText = (value: unknown): string => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
const codePoint = (code: number, original: string) => Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : original;
const clean = (value: unknown): string => asText(value)
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#(\d+);/g, (match, code: string) => codePoint(Number(code), match))
  .replace(/&#x([\da-f]+);/gi, (match, code: string) => codePoint(parseInt(code, 16), match))
  .replace(/&(amp|quot|apos|lt|gt);/g, (_match, name: string) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[name as 'amp'] ?? '')
  .replace(/\s+/g, ' ').trim();
const shorten = (value: string, limit: number) => value.length > limit ? `${value.slice(0, limit).trimEnd()}…` : value;
const htmlText = (html: string) => clean(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' '));
const percent = (value: string): string | null => {
  const match = /^(\d+)(?:-(\d+)\/(\d+))?(?:\.(\d+))?$/.exec(value.trim());
  if (!match) return null;
  const amount = Number(match[1]) + (match[2] && match[3] ? Number(match[2]) / Number(match[3]) : 0) + (match[4] ? Number(`0.${match[4]}`) : 0);
  return Number.isFinite(amount) ? `${amount.toFixed(2).replace('.', ',')} %` : null;
};

/** Only known, verifiable monetary-policy statements produce Spanish reports. */
export function makeSpanishBrief(item: NewsItem, html: string): SpanishBrief | null {
  const text = htmlText(html);
  if (item.source === 'Reserva Federal' && item.title === 'Federal Reserve issues FOMC statement') {
    const match = /The Committee decided to (maintain|raise|lower) the target range for the federal funds rate at (\d+(?:-\d+\/\d+|\.\d+)?) to (\d+(?:-\d+\/\d+|\.\d+)?) percent/i.exec(text);
    if (!match) return null;
    const low = percent(match[2] ?? '');
    const high = percent(match[3] ?? '');
    if (!low || !high) return null;
    const verb = { maintain: 'mantiene', raise: 'eleva', lower: 'reduce' }[match[1]?.toLowerCase() as 'maintain'];
    if (!verb) return null;
    return {
      title: `La Fed ${verb} el rango de tipos en ${low}–${high}`,
      lead: `El Comité Federal de Mercado Abierto ${verb} el rango objetivo de la tasa de fondos federales entre ${low} y ${high}, según su comunicado oficial.`,
      facts: [{ label: 'Límite inferior', value: low }, { label: 'Límite superior', value: high }],
      paragraphs: [
        'La tasa de fondos federales es una referencia central de la política monetaria de Estados Unidos. El rango procede directamente del comunicado de la Reserva Federal.',
        'Este informe describe la decisión publicada. No interpreta la reacción de los mercados ni anticipa decisiones futuras.',
      ],
    };
  }
  if (item.source === 'Banco Central Europeo' && item.title === 'Monetary policy decisions') {
    const match = /The interest rates on the deposit facility, the main refinancing operations and the marginal lending facility will remain unchanged at (\d+(?:\.\d+)?)%, (\d+(?:\.\d+)?)% and (\d+(?:\.\d+)?)% respectively/i.exec(text);
    if (!match) return null;
    const rates = [match[1], match[2], match[3]].map(value => percent(value ?? ''));
    if (rates.some(value => !value)) return null;
    const [deposit, refinancing, marginal] = rates as [string, string, string];
    return {
      title: `El BCE mantiene el tipo de depósito en ${deposit}`,
      lead: `El Consejo de Gobierno del Banco Central Europeo decidió mantener sin cambios sus tres tipos oficiales, según su comunicado de política monetaria.`,
      facts: [{ label: 'Facilidad de depósito', value: deposit }, { label: 'Operaciones principales', value: refinancing }, { label: 'Facilidad marginal', value: marginal }],
      paragraphs: [
        `La facilidad de depósito se mantiene en ${deposit}; las operaciones principales de financiación, en ${refinancing}; y la facilidad marginal de crédito, en ${marginal}.`,
        'Las cifras se extraen del comunicado oficial. Este informe no atribuye efectos sobre precios de mercado ni adelanta decisiones del BCE.',
      ],
    };
  }
  return null;
}

export function parseNewsFeed(xml: string, feed: typeof feeds[number]): NewsItem[] {
  const parsed = parser.parse(xml) as { rss?: { channel?: { item?: unknown } } };
  const items = parsed?.rss?.channel?.item;
  return (Array.isArray(items) ? items : items ? [items] : []).flatMap((raw): NewsItem[] => {
    if (!raw || typeof raw !== 'object') return [];
    const item = raw as Record<string, unknown>;
    const title = shorten(clean(item.title), 220);
    const excerpt = shorten(clean(item.description), 420);
    const date = new Date(asText(item.pubDate));
    let url: URL;
    try { url = new URL(asText(item.link)); } catch { return []; }
    if (!title || !Number.isFinite(date.getTime()) || url.protocol !== 'https:' || (url.hostname !== feed.host && !url.hostname.endsWith(`.${feed.host}`))) return [];
    return [{ id: createHash('sha256').update(url.href).digest('hex').slice(0, 16), title, excerpt, source: feed.source, category: feed.category, publishedAt: date.toISOString(), url: url.href }];
  });
}

export function createNewsService(fetchFeed: typeof fetch = fetch) {
  let cache: { items: NewsItem[]; updatedAt: string; expires: number } | null = null;
  let inFlight: Promise<{ items: NewsItem[]; updatedAt: string }> | null = null;
  const refresh = async () => {
    const results = await Promise.allSettled(feeds.map(async feed => {
      const response = await fetchFeed(feed.url, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
      if (!response.ok) throw new Error(`Feed ${feed.source}: HTTP ${response.status}`);
      if (Number(response.headers.get('content-length') ?? 0) > 1_000_000) throw new Error('El RSS excede el tamaño permitido.');
      const xml = await response.text();
      if (xml.length > 1_000_000) throw new Error('El RSS excede el tamaño permitido.');
      return parseNewsFeed(xml, feed);
    }));
    const items = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
    if (!items.length) {
      if (cache) return { items: cache.items, updatedAt: cache.updatedAt };
      throw new Error('Las fuentes de noticias no están disponibles.');
    }
    const deduped = [...new Map(items.map(item => [item.url, item])).values()]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 30);
    const reportCandidates = [
      deduped.find(item => item.source === 'Reserva Federal' && item.title === 'Federal Reserve issues FOMC statement'),
      deduped.find(item => item.source === 'Banco Central Europeo' && item.title === 'Monetary policy decisions'),
    ].filter((item): item is NewsItem => Boolean(item));
    await Promise.allSettled(reportCandidates.map(async item => {
      const response = await fetchFeed(item.url, { signal: AbortSignal.timeout(8000), headers: { Accept: 'text/html' } });
      if (!response.ok || Number(response.headers.get('content-length') ?? 0) > 500_000) return;
      const html = await response.text();
      if (html.length > 500_000) return;
      const brief = makeSpanishBrief(item, html);
      if (brief) item.briefEs = brief;
    }));
    const updatedAt = new Date().toISOString();
    cache = { items: deduped, updatedAt, expires: Date.now() + 15 * 60_000 };
    return { items: deduped, updatedAt };
  };
  return () => {
    if (cache && cache.expires > Date.now()) return Promise.resolve({ items: cache.items, updatedAt: cache.updatedAt });
    if (!inFlight) inFlight = refresh().finally(() => { inFlight = null; });
    return inFlight;
  };
}
