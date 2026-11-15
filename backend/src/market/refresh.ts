import type { Pool } from 'pg';
import { fetchCoinGecko, fetchEodhd, fetchMassive, type FetchLike, type ProviderName, type Quote } from './providers.js';
import { dueSlot, spreadSlots } from './schedule.js';

export type ProviderPlan = {
  name: ProviderName;
  dailyCalls: number;
  slots: number[]; // minute-of-day, UTC
  callsPerRun: number; // cap per scheduled run (serverless time limits)
  costPerSymbol: boolean; // EODHD and Massive bill one call per symbol; CoinGecko one call per request
};

/** Free-tier plans. Spread providers cover 24h; Massive free data is end-of-day, so it runs after the US close. */
export const providerPlans: ProviderPlan[] = [
  { name: 'coingecko', dailyCalls: 24, slots: spreadSlots(24), callsPerRun: 1, costPerSymbol: false },
  // 3 index symbols per run x 6 runs = 18 of the 20 daily calls (billed per ticker).
  { name: 'eodhd', dailyCalls: 20, slots: spreadSlots(6, 5), callsPerRun: 3, costPerSymbol: true },
  { name: 'massive', dailyCalls: 20, slots: [22 * 60, 22 * 60 + 15, 22 * 60 + 30], callsPerRun: 5, costPerSymbol: true },
];

export type ProviderKeys = { coingecko?: string; eodhd?: string; massive?: string; massiveBaseUrl: string };
type Asset = { symbol: string; provider_symbol: string };
export type RefreshResult = { provider: ProviderName; status: 'skipped' | 'ok' | 'error'; reason?: string; updated?: number };

// CoinGecko works without a key at a lower rate; the others require one.
const needsKey: Record<ProviderName, boolean> = { coingecko: false, eodhd: true, massive: true };

async function usageFor(pool: Pool, provider: ProviderName, now: Date) {
  const { rows } = await pool.query<{ calls: number; last_run_at: Date | null }>(
    'SELECT calls, last_run_at FROM market_api_usage WHERE provider = $1 AND day = $2::date', [provider, now.toISOString()]);
  return rows[0] ?? { calls: 0, last_run_at: null };
}

/**
 * Atomically claims this slot and its calls before any request is sent. Two overlapping cron
 * ticks cannot both pass: the loser matches no row. last_run_at marks the slot as attempted.
 */
async function reserveRun(pool: Pool, plan: ProviderPlan, now: Date, slot: number, cost: number): Promise<boolean> {
  const slotStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + slot * 60_000);
  const { rowCount } = await pool.query(
    `INSERT INTO market_api_usage AS u (provider, day, calls, last_run_at) VALUES ($1, $2::date, $3, $4)
     ON CONFLICT (provider, day) DO UPDATE SET calls = u.calls + EXCLUDED.calls, last_run_at = EXCLUDED.last_run_at
     WHERE (u.last_run_at IS NULL OR u.last_run_at < $5) AND u.calls + EXCLUDED.calls <= $6`,
    [plan.name, now.toISOString(), cost, now, slotStart, plan.dailyCalls]);
  return rowCount === 1;
}

async function refundCalls(pool: Pool, provider: ProviderName, now: Date, calls: number) {
  await pool.query('UPDATE market_api_usage SET calls = GREATEST(calls - $3, 0) WHERE provider = $1 AND day = $2::date', [provider, now.toISOString(), calls]);
}

async function saveQuotes(pool: Pool, assets: Asset[], quotes: Quote[], now: Date) {
  const bySymbol = new Map(assets.map(asset => [asset.provider_symbol, asset.symbol]));
  let updated = 0;
  for (const quote of quotes) {
    const symbol = bySymbol.get(quote.providerSymbol);
    if (!symbol) continue;
    await pool.query(
      `INSERT INTO market_snapshots (symbol, price, change_percent, source_time, fetched_at) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (symbol) DO UPDATE SET price = EXCLUDED.price, change_percent = EXCLUDED.change_percent,
         source_time = EXCLUDED.source_time, fetched_at = EXCLUDED.fetched_at`,
      [symbol, quote.price, quote.changePercent, quote.sourceTime, now]);
    updated += 1;
  }
  return updated;
}

const asError = (error: unknown) => (error instanceof Error ? error : new Error('error desconocido'));
type Fetched = { quotes: Quote[]; sent: number; error?: Error };

/** Never throws: reports how many calls were really sent and keeps partial quotes. */
async function fetchQuotes(name: ProviderName, assets: Asset[], keys: ProviderKeys, fetchFn: FetchLike): Promise<Fetched> {
  const ids = assets.map(asset => asset.provider_symbol);
  if (name === 'massive') {
    const quotes: Quote[] = [];
    let sent = 0;
    for (const id of ids) {
      sent += 1;
      try { quotes.push(...await fetchMassive(fetchFn, keys.massiveBaseUrl, keys.massive as string, id)); }
      catch (error) { return { quotes, sent, error: asError(error) }; }
    }
    return { quotes, sent };
  }
  const sent = name === 'eodhd' ? ids.length : 1;
  try {
    const quotes = name === 'coingecko' ? await fetchCoinGecko(fetchFn, keys.coingecko, ids) : await fetchEodhd(fetchFn, keys.eodhd as string, ids);
    return { quotes, sent };
  } catch (error) { return { quotes: [], sent, error: asError(error) }; }
}

async function refreshProvider(pool: Pool, plan: ProviderPlan, keys: ProviderKeys, fetchFn: FetchLike, now: Date): Promise<RefreshResult> {
  const skip = (reason: string): RefreshResult => ({ provider: plan.name, status: 'skipped', reason });
  if (needsKey[plan.name] && !keys[plan.name]) return skip('sin clave de API');
  const usage = await usageFor(pool, plan.name, now);
  const slot = dueSlot(plan.slots, now, usage.last_run_at);
  if (slot === null) return skip('sin turno pendiente');
  const room = Math.min(plan.callsPerRun, plan.dailyCalls - usage.calls);
  if (room <= 0) return skip('presupuesto diario agotado');
  // Stalest first, so per-symbol providers rotate through every asset.
  const { rows: assets } = await pool.query<Asset>(
    `SELECT a.symbol, a.provider_symbol FROM market_assets a LEFT JOIN market_snapshots s USING (symbol)
     WHERE a.provider = $1 AND a.enabled ORDER BY s.fetched_at NULLS FIRST, a.sort_order`, [plan.name]);
  const batch = plan.costPerSymbol ? assets.slice(0, room) : assets;
  if (!batch.length) return skip('sin activos');
  const cost = plan.costPerSymbol ? batch.length : 1;
  if (!await reserveRun(pool, plan, now, slot, cost)) return skip('turno ya tomado o presupuesto agotado');
  const { quotes, sent, error } = await fetchQuotes(plan.name, batch, keys, fetchFn);
  if (sent < cost) await refundCalls(pool, plan.name, now, cost - sent);
  const updated = await saveQuotes(pool, batch, quotes, now);
  if (error) return { provider: plan.name, status: 'error', reason: error.message, updated };
  if (updated === 0) return { provider: plan.name, status: 'error', reason: 'respuesta sin cotizaciones utilizables', updated };
  return { provider: plan.name, status: 'ok', updated };
}

export async function runMarketRefresh(pool: Pool, keys: ProviderKeys, fetchFn: FetchLike, now = new Date(), plans = providerPlans): Promise<RefreshResult[]> {
  const results: RefreshResult[] = [];
  for (const plan of plans) {
    try { results.push(await refreshProvider(pool, plan, keys, fetchFn, now)); }
    catch { results.push({ provider: plan.name, status: 'error', reason: 'error interno al actualizar' }); } // one provider failing must not stop the others
  }
  return results;
}

export async function readMarket(pool: Pool) {
  const { rows } = await pool.query(
    `SELECT a.symbol, a.name, a.category, s.price::float8 AS price, s.change_percent::float8 AS "changePercent",
            s.fetched_at AS "fetchedAt", s.source_time AS "sourceTime"
     FROM market_assets a LEFT JOIN market_snapshots s USING (symbol) WHERE a.enabled ORDER BY a.sort_order`);
  return rows;
}
