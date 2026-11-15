export type Quote = { providerSymbol: string; price: number; changePercent: number | null; sourceTime: Date | null };
export type FetchLike = (url: string, init?: { headers?: Record<string, string>; signal?: AbortSignal; redirect?: 'error' }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
export type ProviderName = 'coingecko' | 'eodhd' | 'massive';

const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);
const obj = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' ? (value as Record<string, unknown>) : {});

export function parseCoinGecko(body: unknown): Quote[] {
  return Object.entries(obj(body)).flatMap(([id, raw]) => {
    const row = obj(raw);
    const price = num(row.usd);
    return price === null ? [] : [{ providerSymbol: id, price, changePercent: num(row.usd_24h_change), sourceTime: null }];
  });
}

export function parseEodhd(body: unknown): Quote[] {
  const rows = Array.isArray(body) ? body : [body];
  return rows.flatMap(raw => {
    const row = obj(raw);
    const price = num(row.close);
    if (typeof row.code !== 'string' || price === null) return [];
    const ts = num(row.timestamp);
    return [{ providerSymbol: row.code, price, changePercent: num(row.change_p), sourceTime: ts === null ? null : new Date(ts * 1000) }];
  });
}

export function parseMassive(symbol: string, body: unknown): Quote[] {
  const results = obj(body).results;
  const bar = Array.isArray(results) ? obj(results[0]) : {};
  const open = num(bar.o);
  const close = num(bar.c);
  if (close === null) return [];
  const ts = num(bar.t);
  return [{ providerSymbol: symbol, price: close, changePercent: open ? ((close - open) / open) * 100 : null, sourceTime: ts === null ? null : new Date(ts) }];
}

async function getJson(fetchFn: FetchLike, url: string, headers?: Record<string, string>): Promise<unknown> {
  const response = await fetchFn(url, { headers, signal: AbortSignal.timeout(8000), redirect: 'error' });
  if (!response.ok) throw new Error(`Provider responded ${response.status}`);
  return response.json();
}

/** One call for many symbols. */
export async function fetchCoinGecko(fetchFn: FetchLike, apiKey: string | undefined, ids: string[]): Promise<Quote[]> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=usd&include_24hr_change=true`;
  return parseCoinGecko(await getJson(fetchFn, url, apiKey ? { 'x-cg-demo-api-key': apiKey } : undefined));
}

/** One request for many symbols (first in the path, rest in `s`); EODHD bills one call per ticker. */
export async function fetchEodhd(fetchFn: FetchLike, token: string, symbols: string[]): Promise<Quote[]> {
  const [first, ...rest] = symbols;
  if (!first) return [];
  const extra = rest.length ? `&s=${encodeURIComponent(rest.join(','))}` : '';
  const url = `https://eodhd.com/api/real-time/${encodeURIComponent(first)}?api_token=${encodeURIComponent(token)}&fmt=json${extra}`;
  return parseEodhd(await getJson(fetchFn, url));
}

/** One call per symbol. Base URL is configurable: confirm it against Massive's docs. */
export async function fetchMassive(fetchFn: FetchLike, baseUrl: string, apiKey: string, symbol: string): Promise<Quote[]> {
  const url = `${baseUrl}/v2/aggs/ticker/${encodeURIComponent(symbol)}/prev?adjusted=true&apiKey=${encodeURIComponent(apiKey)}`;
  return parseMassive(symbol, await getJson(fetchFn, url));
}
