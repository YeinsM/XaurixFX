import type { MarketBar, MarketInterval, MarketSnapshot, MarketSource } from './types.js';

const BASE_URL = 'https://api.goldprice.dev/v1';
const SYMBOL = 'XAU-USD-SPOT';
const INTERVALS: MarketInterval[] = ['5m', '15m', '1h', '4h'];
const MAX_CLOSED_BARS = 250;
const HISTORY_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

export type MarketDataErrorCode =
  | 'missing_api_key'
  | 'provider_forbidden'
  | 'rate_limited'
  | 'timeout'
  | 'provider_unavailable'
  | 'provider_error'
  | 'invalid_payload';

export class MarketDataError extends Error {
  constructor(readonly code: MarketDataErrorCode, message: string) {
    super(message);
    this.name = 'MarketDataError';
  }
}

interface MarketDataOptions {
  apiKey?: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
}

interface MarketDataClient {
  fetchSnapshot(referenceTime: Date): Promise<MarketSnapshot>;
}

export function createMarketDataClient({
  apiKey,
  fetch: fetchImplementation = globalThis.fetch,
  timeoutMs = 10_000,
}: MarketDataOptions): MarketDataClient {
  return {
    async fetchSnapshot(referenceTime) {
      if (!apiKey?.trim()) {
        throw new MarketDataError('missing_api_key', 'GoldPrice API key is not configured');
      }
      if (!Number.isFinite(referenceTime.getTime())) {
        throw new RangeError('referenceTime must be a valid date');
      }

      const headers = new Headers({ authorization: `Bearer ${apiKey.trim()}` });
      const spotUrl = new URL(`${BASE_URL}/prices`);
      spotUrl.search = new URLSearchParams({ symbol: SYMBOL, include: 'sources' }).toString();
      const spotPayload = await requestJson(spotUrl, headers, fetchImplementation, timeoutMs);
      const spot = parseSpot(spotPayload);

      const bars = await Promise.all(INTERVALS.map(interval =>
        fetchBars(interval, referenceTime, headers, fetchImplementation, timeoutMs)));
      return { symbol: SYMBOL, spot, bars };
    },
  };
}

async function fetchBars(
  interval: MarketInterval,
  referenceTime: Date,
  headers: Headers,
  fetchImplementation: typeof globalThis.fetch,
  timeoutMs: number,
) {
  const from = new Date(referenceTime.getTime() - HISTORY_WINDOW_MS).toISOString();
  const to = referenceTime.toISOString();
  const bars: MarketBar[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  while (bars.length < MAX_CLOSED_BARS) {
    const url = new URL(`${BASE_URL}/bars`);
    const query: Record<string, string> = {
      symbol: SYMBOL,
      interval,
      from,
      to,
      limit: String(MAX_CLOSED_BARS),
    };
    if (cursor) query.cursor = cursor;
    url.search = new URLSearchParams(query).toString();

    const payload = await requestJson(url, headers, fetchImplementation, timeoutMs);
    if (!isRecord(payload) || payload.symbol !== SYMBOL || payload.interval !== interval ||
      !Array.isArray(payload.bars) || !(typeof payload.next_cursor === 'string' || payload.next_cursor === null)) {
      throw invalidPayload('Invalid GoldPrice bars response');
    }

    for (const item of payload.bars) {
      const bar = parseBar(item);
      if (bar) bars.push(bar);
    }
    if (payload.next_cursor === null) break;
    if (!payload.next_cursor) throw invalidPayload('Invalid GoldPrice pagination cursor');
    if (seenCursors.has(payload.next_cursor)) throw invalidPayload('Repeated GoldPrice pagination cursor');
    seenCursors.add(payload.next_cursor);
    cursor = payload.next_cursor;
  }

  return {
    interval,
    bars: bars
      .sort((left, right) => Date.parse(left.barStart) - Date.parse(right.barStart))
      .slice(-MAX_CLOSED_BARS),
  };
}

async function requestJson(
  url: URL,
  headers: Headers,
  fetchImplementation: typeof globalThis.fetch,
  timeoutMs: number,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetchImplementation(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new MarketDataError('timeout', 'GoldPrice request timed out');
    }
    throw new MarketDataError('provider_unavailable', 'GoldPrice request failed');
  }

  if (response.status === 403) throw new MarketDataError('provider_forbidden', 'GoldPrice plan does not allow this data');
  if (response.status === 429) throw new MarketDataError('rate_limited', 'GoldPrice request limit reached');
  if (!response.ok) throw new MarketDataError('provider_error', `GoldPrice request failed with status ${response.status}`);

  try {
    return await response.json() as unknown;
  } catch {
    throw invalidPayload('GoldPrice returned invalid JSON');
  }
}

function parseSpot(payload: unknown): MarketSnapshot['spot'] {
  if (!isRecord(payload) || !Array.isArray(payload.symbols)) {
    throw invalidPayload('Invalid GoldPrice spot response');
  }
  const row = payload.symbols.find((symbol: unknown) =>
    isRecord(symbol) && symbol.symbol === 'XAU' && symbol.quote_currency === 'USD' && symbol.contract_type === 'spot');
  if (!isRecord(row) || !isDecimal(row.price) || Number(row.price) <= 0 ||
    typeof row.is_stale !== 'boolean' || !isIsoTimestamp(row.computed_at)) {
    throw invalidPayload('GoldPrice spot data is incomplete');
  }

  return {
    price: row.price,
    isStale: row.is_stale,
    computedAt: row.computed_at,
    source: 'GoldPrice.dev',
    sources: parseSources(row.sources),
  };
}

function parseSources(value: unknown): MarketSource[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw invalidPayload('Invalid GoldPrice source metadata');
  return value.map((source: unknown) => {
    if (!isRecord(source) || typeof source.source !== 'string' || !source.source.trim()) {
      throw invalidPayload('Invalid GoldPrice source metadata');
    }
    const parsed: MarketSource = { source: source.source };
    if (typeof source.display_name === 'string') parsed.displayName = source.display_name;
    if (typeof source.price === 'string' && isDecimal(source.price)) parsed.price = source.price;
    if (typeof source.unit === 'string') parsed.unit = source.unit;
    if (typeof source.is_stale === 'boolean') parsed.isStale = source.is_stale;
    if (typeof source.informational === 'boolean') parsed.informational = source.informational;
    return parsed;
  });
}

function parseBar(value: unknown): MarketBar | null {
  if (!isRecord(value) || !isIsoTimestamp(value.bar_start) || typeof value.is_closed !== 'boolean') {
    throw invalidPayload('Invalid GoldPrice bar');
  }
  if (!value.is_closed) return null;
  if (!isDecimal(value.open) || !isDecimal(value.high) || !isDecimal(value.low) ||
    !isDecimal(value.close) || !(value.volume === null || isDecimal(value.volume))) {
    throw invalidPayload('GoldPrice returned a closed bar with invalid OHLC values');
  }
  const open = Number(value.open);
  const high = Number(value.high);
  const low = Number(value.low);
  const close = Number(value.close);
  if (high < Math.max(open, close, low) || low > Math.min(open, close, high)) {
    throw invalidPayload('GoldPrice returned inconsistent OHLC values');
  }
  return {
    barStart: value.bar_start,
    open: value.open,
    high: value.high,
    low: value.low,
    close: value.close,
    volume: value.volume,
    isClosed: true,
  };
}

function isDecimal(value: unknown): value is string {
  return typeof value === 'string' && /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value));
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) && /(?:Z|\+00:00)$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidPayload(message: string): MarketDataError {
  return new MarketDataError('invalid_payload', message);
}
