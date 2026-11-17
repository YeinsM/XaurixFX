import type { Pool } from 'pg';
import type {
  AnalysisRecord,
  AnalysisScenario,
  AnalysisSources,
  MarketSource,
  ScenarioMetrics,
} from './analysis/types.js';
import { validateScenario } from './analysis/scenarios.js';

interface AnalysisPageOptions {
  limit: number;
  before?: string;
}

interface AnalysisPage {
  analyses: AnalysisRecord[];
  nextBefore: string | null;
}

export function createAnalysisRepository(pool: Pool) {
  return {
    withDateLock: <T>(date: string, operation: () => Promise<T>) =>
      withAnalysisDateLock(pool, date, operation),
    findByDate: (date: string) => findAnalysisByDate(pool, date),
    save: (record: AnalysisRecord) => saveAnalysisRecord(pool, record),
  };
}

export async function withAnalysisDateLock<T>(
  pool: Pool,
  date: string,
  operation: () => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  const lockKey = `xauusd-daily-analysis:${date}`;
  try {
    await client.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [lockKey]);
  } catch (error) {
    client.release(error instanceof Error ? error : new Error('Could not acquire the analysis lock'));
    throw error;
  }

  const outcome = await Promise.resolve().then(operation).then(
    value => ({ ok: true as const, value }),
    error => ({ ok: false as const, error }),
  );
  let unlockError: unknown;
  try {
    const result = await client.query(
      'SELECT pg_advisory_unlock(hashtextextended($1, 0)) AS released',
      [lockKey],
    );
    if (result.rows[0]?.released !== true) throw new Error('Analysis lock was not held during release');
  } catch (error) {
    unlockError = error;
  }
  const releaseError = unlockError === undefined
    ? undefined
    : unlockError instanceof Error ? unlockError : new Error('Could not release the analysis lock');
  client.release(releaseError);

  if (!outcome.ok) {
    if (unlockError !== undefined) {
      throw new AggregateError([outcome.error, unlockError], 'Analysis operation and lock release both failed');
    }
    throw outcome.error;
  }
  if (unlockError !== undefined) throw unlockError;
  return outcome.value;
}

export async function saveAnalysisRecord(pool: Pool, record: AnalysisRecord): Promise<void> {
  await pool.query(
    `INSERT INTO market_analyses (
      analysis_date, status, report, sources, market_source, reference_price,
      reference_at, generated_at, model, prompt_version, error_code
    ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $8, $9, $10, $11)`,
    [
      record.analysisDate,
      record.status,
      record.report === null ? null : JSON.stringify(record.report),
      JSON.stringify(record.sources),
      record.marketSource,
      record.referencePrice,
      record.referenceAt,
      record.generatedAt,
      record.model,
      record.promptVersion,
      record.errorCode,
    ],
  );
}

export async function findAnalysisByDate(pool: Pool, analysisDate: string): Promise<AnalysisRecord | undefined> {
  const result = await pool.query(
    `SELECT analysis_date, status, report, sources, market_source, reference_price,
      reference_at, generated_at, model, prompt_version, error_code
    FROM market_analyses WHERE analysis_date = $1`,
    [analysisDate],
  );
  return result.rows[0] ? mapAnalysisRecord(result.rows[0]) : undefined;
}

export async function listAnalysisRecords(pool: Pool, options: AnalysisPageOptions): Promise<AnalysisPage> {
  if (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > 30) {
    throw new RangeError('limit must be an integer between 1 and 30');
  }
  const result = await pool.query(
    `SELECT analysis_date, status, report, sources, market_source, reference_price,
      reference_at, generated_at, model, prompt_version, error_code
    FROM market_analyses
    WHERE ($1::date IS NULL OR analysis_date <= $1::date)
    ORDER BY analysis_date DESC
    LIMIT $2`,
    [options.before ?? null, options.limit + 1],
  );
  const hasMore = result.rows.length > options.limit;
  const rows = result.rows.slice(0, options.limit).map(mapAnalysisRecord);
  const oldest = rows.at(-1)?.analysisDate;
  return {
    analyses: rows,
    nextBefore: hasMore && oldest ? previousDate(oldest) : null,
  };
}

function mapAnalysisRecord(row: Record<string, unknown>): AnalysisRecord {
  const status = row.status;
  if (status !== 'published' && status !== 'insufficient_data' && status !== 'failed') {
    throw new Error('Stored analysis has an invalid status');
  }
  const report = status === 'published' ? parseReport(row.report) : null;
  const sources = parseSources(row.sources);
  return {
    analysisDate: toDateString(row.analysis_date),
    status,
    report,
    sources,
    marketSource: nullableString(row.market_source),
    referencePrice: nullableString(row.reference_price),
    referenceAt: nullableTimestamp(row.reference_at),
    generatedAt: nullableTimestamp(row.generated_at),
    model: nullableString(row.model),
    promptVersion: nullableString(row.prompt_version),
    errorCode: nullableString(row.error_code),
  };
}

function parseReport(value: unknown): NonNullable<AnalysisRecord['report']> {
  const parsed = parseJsonObject(value, 'report');
  if (typeof parsed.macro !== 'string' || typeof parsed.confluence !== 'string' ||
    typeof parsed.entryPlan !== 'string' || !Array.isArray(parsed.scenarios) || parsed.scenarios.length !== 2) {
    throw new Error('Stored analysis report is invalid');
  }
  const scenarios = parsed.scenarios.map(parseScenario);
  if (scenarios[0]?.name !== 'A' || scenarios[1]?.name !== 'B') {
    throw new Error('Stored analysis scenarios are invalid');
  }
  return {
    macro: parsed.macro,
    confluence: parsed.confluence,
    entryPlan: parsed.entryPlan,
    scenarios: [scenarios[0], scenarios[1]],
  };
}

function parseSources(value: unknown): AnalysisSources {
  const parsed = parseJsonObject(value, 'sources');
  if (!Array.isArray(parsed.market) ||
    !isRecord(parsed.calendar) ||
    (parsed.calendar.status !== 'verified' && parsed.calendar.status !== 'unavailable') ||
    typeof parsed.calendar.summary !== 'string' || !Array.isArray(parsed.calendar.citations)) {
    throw new Error('Stored analysis sources are invalid');
  }
  return {
    market: parsed.market.map(parseMarketSource),
    calendar: {
      status: parsed.calendar.status,
      summary: parsed.calendar.summary,
      citations: parsed.calendar.citations.map(parseCalendarCitation),
    },
  };
}

function parseJsonObject(value: unknown, name: string): Record<string, unknown> {
  let parsed = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value) as unknown; }
    catch { throw new Error(`Stored analysis ${name} is invalid JSON`); }
  }
  if (!isRecord(parsed)) throw new Error(`Stored analysis ${name} is invalid`);
  return parsed;
}

function parseMarketSource(value: unknown): MarketSource {
  if (!isRecord(value) || typeof value.source !== 'string') throw new Error('Stored market source is invalid');
  const source: MarketSource = { source: value.source };
  if (typeof value.displayName === 'string') source.displayName = value.displayName;
  if (typeof value.price === 'string') source.price = value.price;
  if (typeof value.unit === 'string') source.unit = value.unit;
  if (typeof value.isStale === 'boolean') source.isStale = value.isStale;
  if (typeof value.informational === 'boolean') source.informational = value.informational;
  return source;
}

function parseCalendarCitation(value: unknown): { url: string; title: string } {
  if (!isRecord(value) || typeof value.url !== 'string' || typeof value.title !== 'string') {
    throw new Error('Stored calendar citation is invalid');
  }
  try {
    const url = new URL(value.url);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid calendar URL');
    return { url: url.href, title: value.title };
  } catch {
    throw new Error('Stored calendar citation URL is invalid');
  }
}

function parseScenario(value: unknown): AnalysisScenario {
  const textFields = [
    'context', 'preconditions', 'm15Zone', 'm5Confirmation', 'entryType',
    'cancellation', 'management', 'validity', 'invalidation', 'rationale',
  ] as const;
  if (!isRecord(value) || (value.name !== 'A' && value.name !== 'B') ||
    (value.direction !== 'buy' && value.direction !== 'sell' && value.direction !== 'wait') ||
    textFields.some(field => typeof value[field] !== 'string') ||
    !Array.isArray(value.takeProfits) || value.takeProfits.length !== 3) {
    throw new Error('Stored analysis scenario is invalid');
  }
  const entryLow = nullableNumber(value.entryLow);
  const entryHigh = nullableNumber(value.entryHigh);
  const stopLoss = nullableNumber(value.stopLoss);
  const takeProfits: [number | null, number | null, number | null] = [
    nullableNumber(value.takeProfits[0]),
    nullableNumber(value.takeProfits[1]),
    nullableNumber(value.takeProfits[2]),
  ];
  const prices = [entryLow, entryHigh, stopLoss, ...takeProfits];
  const hasAnyPrice = prices.some(price => price !== null);
  const hasAllPrices = prices.every(price => price !== null);
  if (hasAnyPrice !== hasAllPrices || (value.direction === 'wait' && hasAnyPrice)) {
    throw new Error('Stored analysis scenario levels are invalid');
  }
  if (value.direction !== 'wait' && hasAllPrices) {
    const [target1, target2, target3] = takeProfits;
    const validation = validateScenario({
      direction: value.direction,
      entryLow: requireNumber(entryLow),
      entryHigh: requireNumber(entryHigh),
      stopLoss: requireNumber(stopLoss),
      takeProfits: [requireNumber(target1), requireNumber(target2), requireNumber(target3)],
    });
    if (!validation.valid) throw new Error('Stored analysis scenario levels are inconsistent');
  }
  const scenario: AnalysisScenario = {
    name: value.name,
    direction: value.direction,
    context: requiredText(value.context),
    preconditions: requiredText(value.preconditions),
    m15Zone: requiredText(value.m15Zone),
    m5Confirmation: requiredText(value.m5Confirmation),
    entryType: requiredText(value.entryType),
    entryLow,
    entryHigh,
    stopLoss,
    takeProfits,
    cancellation: requiredText(value.cancellation),
    management: requiredText(value.management),
    validity: requiredText(value.validity),
    invalidation: requiredText(value.invalidation),
    rationale: requiredText(value.rationale),
  };
  if (value.metrics !== undefined) scenario.metrics = parseMetrics(value.metrics);
  return scenario;
}

function parseMetrics(value: unknown): ScenarioMetrics {
  if (!isRecord(value) || typeof value.entryReference !== 'number' || typeof value.risk !== 'number' ||
    !Array.isArray(value.rewardDistances) || value.rewardDistances.length !== 3 ||
    !Array.isArray(value.rewardRisk) || value.rewardRisk.length !== 3 ||
    !Array.isArray(value.belowMinimumRewardRisk) || value.belowMinimumRewardRisk.length !== 3) {
    throw new Error('Stored analysis metrics are invalid');
  }
  const rewardDistances = value.rewardDistances.map(finiteNumber);
  const rewardRisk = value.rewardRisk.map(finiteNumber);
  const belowMinimumRewardRisk = value.belowMinimumRewardRisk.map(item => {
    if (typeof item !== 'boolean') throw new Error('Stored analysis metrics are invalid');
    return item;
  });
  return {
    entryReference: finiteNumber(value.entryReference),
    risk: finiteNumber(value.risk),
    rewardDistances: [rewardDistances[0]!, rewardDistances[1]!, rewardDistances[2]!],
    rewardRisk: [rewardRisk[0]!, rewardRisk[1]!, rewardRisk[2]!],
    belowMinimumRewardRisk: [belowMinimumRewardRisk[0]!, belowMinimumRewardRisk[1]!, belowMinimumRewardRisk[2]!],
  };
}

function nullableNumber(value: unknown): number | null {
  if (value === null) return null;
  return finiteNumber(value);
}

function finiteNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Stored analysis number is invalid');
  return value;
}

function requireNumber(value: number | null): number {
  if (value === null) throw new Error('Stored analysis level is missing');
  return value;
}

function requiredText(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Stored analysis text is invalid');
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw new Error('Stored analysis metadata is invalid');
  return value;
}

function nullableTimestamp(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const timestamp = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(timestamp.getTime())) throw new Error('Stored analysis timestamp is invalid');
  return timestamp.toISOString();
}

function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value !== 'string' || !isValidDate(value)) throw new Error('Stored analysis date is invalid');
  return value;
}

function previousDate(date: string): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function isValidDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
