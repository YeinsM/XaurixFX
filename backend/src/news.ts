import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import { load } from 'cheerio';
import { translateNews } from './newsTranslation.js';

export type NewsItem = {
  id: string; title: string; excerpt: string; titleEs?: string; excerptEs?: string;
  source: 'Reserva Federal' | 'Banco Central Europeo';
  category: 'Política monetaria' | 'Economía europea';
  publishedAt: string; url: string;
};

const feeds = [
  { url: 'https://www.federalreserve.gov/feeds/press_monetary.xml', host: 'federalreserve.gov', source: 'Reserva Federal', category: 'Política monetaria' },
  { url: 'https://www.ecb.europa.eu/rss/press.html', host: 'ecb.europa.eu', source: 'Banco Central Europeo', category: 'Economía europea' },
] as const;
const parser = new XMLParser({ ignoreAttributes: false, trimValues: true, processEntities: true });
const asText = (value: unknown): string => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
const clean = (value: unknown): string => asText(value).replace(/<[^>]*>/g, ' ').replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16))).replace(/&(amp|quot|apos|lt|gt|#39);/g, (_, n: string) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', '#39': "'" })[n as 'amp'] ?? '').replace(/\s+/g, ' ').trim();
const shorten = (value: string, limit: number) => value.length > limit ? `${value.slice(0, limit).trimEnd()}…` : value;
const passageText = (value: string, limit: number) => {
  if (value.length <= limit) return value;
  const complete = value.slice(0, limit + 1).match(/^.{150,}[.!?](?=\s|$)/s)?.[0];
  return complete || shorten(value, limit);
};

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
    return [{ id: createHash('sha256').update(url.href).digest('hex').slice(0, 16), title, excerpt: excerpt === title ? '' : excerpt, source: feed.source, category: feed.category, publishedAt: date.toISOString(), url: url.href }];
  });
}

/** Extract a short passage from the official article, without mirroring it. */
export function extractArticleExcerpt(html: string, source: NewsItem['source']): string {
  const $ = load(html);
  $('script, style, nav, footer, header, aside, form').remove();
  const root = source === 'Banco Central Europeo'
    ? $('.ecb-pressContent, .ecb-content, main, article').first()
    : $('#article, .article, #content, main, article').first();
  const paragraphs = (root.length ? root : $('body')).find('p').map((_, el) => clean($(el).text()).replace(/\[\d+\]/g, '')).get();
  const eligible = paragraphs.filter(p => p.length >= 80 && p.length <= 1800 && !/^(official websites|our monetary policy strategy|insights into our work|in-depth studies)/i.test(p));
  const passage = eligible.find(p => p.length >= 140) || eligible[0];
  return passage ? passageText(passage, 340) : '';
}

export function createNewsService(fetchFeed: typeof fetch = fetch, translate: typeof translateNews = translateNews) {
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
    const deduped = [...new Map(items.map(item => [item.url, item])).values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 30);
    const first = deduped.slice(0, 12);
    for (let offset = 0; offset < first.length; offset += 4) {
      await Promise.allSettled(first.slice(offset, offset + 4).map(async item => {
        const response = await fetchFeed(item.url, { signal: AbortSignal.timeout(6500), headers: { Accept: 'text/html' } });
        if (!response.ok || Number(response.headers.get('content-length') ?? 0) > 750_000) return;
        const html = await response.text();
        if (html.length > 750_000) return;
        item.excerpt = extractArticleExcerpt(html, item.source) || item.excerpt;
      }));
    }
    try {
      const texts = deduped.flatMap(item => [item.title, item.excerpt]);
      const translated = await translate(texts);
      if (translated.length === texts.length) deduped.forEach((item, index) => {
        item.titleEs = translated[index * 2] || undefined;
        item.excerptEs = translated[index * 2 + 1] || undefined;
      });
    } catch (error) { console.warn('Traducción de noticias no disponible:', error); }
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
