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
