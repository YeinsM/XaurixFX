export type MarketCategory = 'index' | 'stock' | 'forex' | 'crypto' | 'commodity';
export type MarketAsset = {
  symbol: string; name: string; category: MarketCategory;
  price: number | null; changePercent: number | null; fetchedAt: string | null; sourceTime: string | null;
};
export type Tone = 'up' | 'down' | 'flat';

export const categoryLabels: Record<MarketCategory, string> = {
  index: 'Índices', stock: 'Acciones', forex: 'Divisas', crypto: 'Cripto', commodity: 'Materias primas',
};
export const categoryOrder: MarketCategory[] = ['index', 'stock', 'forex', 'crypto', 'commodity'];

export function groupByCategory(assets: MarketAsset[]): Record<MarketCategory, MarketAsset[]> {
  const groups: Record<MarketCategory, MarketAsset[]> = { index: [], stock: [], forex: [], crypto: [], commodity: [] };
  for (const asset of assets) groups[asset.category].push(asset);
  return groups;
}

const number = (digits: number) => new Intl.NumberFormat('es', { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: 'always' as unknown as boolean }) // 'always' is valid at runtime; missing from this TS lib;
const priceFormats = { forex: number(5), index: number(2), stock: number(2), crypto: number(2), commodity: number(2) };
const changeFormat = number(2);

export function formatPrice(price: number | null, category: MarketCategory): string {
  return price === null ? '—' : priceFormats[category].format(price);
}

export function formatChange(value: number | null): { text: string; tone: Tone } {
  if (value === null) return { text: '—', tone: 'flat' };
  const rounded = Math.round(value * 100) / 100;
  if (rounded === 0) return { text: '0,00%', tone: 'flat' };
  return { text: `${rounded > 0 ? '+' : '-'}${changeFormat.format(Math.abs(rounded))}%`, tone: rounded > 0 ? 'up' : 'down' };
}

export function toggleWatch(list: readonly string[], symbol: string): string[] {
  return list.includes(symbol) ? list.filter(item => item !== symbol) : [...list, symbol];
}

export function newestFetch(assets: readonly MarketAsset[]): string | null {
  return assets.reduce<string | null>((latest, asset) => (asset.fetchedAt && (!latest || asset.fetchedAt > latest) ? asset.fetchedAt : latest), null);
}

export function minutesAgo(iso: string, now = new Date()): number {
  return Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
}

const WATCH_KEY = 'xaurix.watchlist';
/** Anonymous preference; per-account persistence arrives with user preferences in the API. */
export function loadWatchlist(): string[] | null {
  try {
    const raw = localStorage.getItem(WATCH_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.every(item => typeof item === 'string') ? parsed : null;
  } catch { return null; }
}
export function saveWatchlist(list: readonly string[]): void {
  try { localStorage.setItem(WATCH_KEY, JSON.stringify(list)); } catch { /* storage unavailable: keep in memory */ }
}
