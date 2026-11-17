import { calculateEma, calculateMomentum, calculateRsi } from './indicators.js';
import { GeminiAnalysisError } from './gemini.js';
import { MarketDataError } from './marketData.js';
import { ANALYSIS_PROMPT_VERSION } from './prompt.js';
import { calculateScenarioMetrics, validateScenario } from './scenarios.js';
import type {
  AnalysisInput,
  AnalysisRecord,
  AnalysisScenario,
  AnalysisSources,
  CalendarResult,
  GeneratedAnalysis,
  MarketBar,
  MarketInterval,
  MarketSnapshot,
  ScenarioPrices,
  TimeframeIndicatorSnapshot,
  TimeframeBars,
} from './types.js';

const REQUIRED_INTERVALS: Array<[MarketInterval, number]> = [
  ['5m', 5 * 60_000],
  ['15m', 15 * 60_000],
  ['1h', 60 * 60_000],
  ['4h', 4 * 60 * 60_000],
];
const REQUIRED_BARS = 200;
const RETRY_DELAYS = [60_000, 300_000, 900_000];
const TIME_ZONE = 'America/Santo_Domingo';
const UNAVAILABLE_CALENDAR: CalendarResult = {
  status: 'unavailable',
  summary: 'No se pudo verificar el calendario económico.',
  citations: [],
};

export interface DailyAnalysisRepository {
  withDateLock<T>(date: string, operation: () => Promise<T>): Promise<T>;
  findByDate(date: string): Promise<AnalysisRecord | undefined>;
  save(record: AnalysisRecord): Promise<void>;
}

interface DailyAnalysisDependencies {
  repository: DailyAnalysisRepository;
  marketData?: { fetchSnapshot(referenceTime: Date): Promise<MarketSnapshot> };
  generateReport?: (input: AnalysisInput) => Promise<GeneratedAnalysis>;
  model: string;
  clock?: () => Date;
  sleep?: (milliseconds: number) => Promise<void>;
}

export function santoDomingoDate(date: Date): string {
  if (!Number.isFinite(date.getTime())) throw new RangeError('clock must return a valid date');
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function runDailyAnalysis(date: string, dependencies: DailyAnalysisDependencies): Promise<AnalysisRecord> {
  assertDate(date);
  const clock = dependencies.clock ?? (() => new Date());
  const sleep = dependencies.sleep ?? (milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)));
  const { marketData, generateReport } = dependencies;
  return dependencies.repository.withDateLock(date, async () => {
    const existing = await dependencies.repository.findByDate(date);
    if (existing) return existing;

    const fetchStartTime = clock();
    if (!marketData || !generateReport) {
      const record = failedRecord({
        analysisDate: date,
        generatedAt: clock().toISOString(),
        errorCode: 'missing_api_key',
      });
      await dependencies.repository.save(record);
      return record;
    }

    let snapshot: MarketSnapshot | undefined;
    let input: AnalysisInput | undefined;
    let record: AnalysisRecord;
    try {
      snapshot = await retry(
        () => marketData.fetchSnapshot(fetchStartTime),
        sleep,
      );
      const preparedInput = prepareInput(snapshot, clock());
      input = preparedInput;
      if (!preparedInput) {
        record = createRecord(date, {
          status: 'insufficient_data',
          sources: makeSources(snapshot),
          marketSource: snapshot.spot.source,
          referencePrice: snapshot.spot.price,
          referenceAt: snapshot.spot.computedAt,
          generatedAt: clock().toISOString(),
        });
      } else {
        const generated = await retry(() => generateReport(preparedInput), sleep);
        const report = addScenarioMetrics(generated.report, preparedInput.actionableData);
        record = createRecord(date, {
          status: 'published',
          report,
          sources: makeSources(snapshot, generated, preparedInput.barsAreCurrent),
          marketSource: snapshot.spot.source,
          referencePrice: snapshot.spot.price,
          referenceAt: snapshot.spot.computedAt,
          generatedAt: clock().toISOString(),
          model: dependencies.model,
          promptVersion: ANALYSIS_PROMPT_VERSION,
        });
      }
    } catch (error) {
      record = failedRecord({
        analysisDate: date,
        generatedAt: clock().toISOString(),
        errorCode: errorCode(error),
        market: snapshot,
        barsAreCurrent: input?.barsAreCurrent,
        model: snapshot ? dependencies.model : undefined,
      });
    }
    await dependencies.repository.save(record);
    return record;
  });
}

function prepareInput(snapshot: MarketSnapshot, referenceTime: Date): AnalysisInput | undefined {
  if (snapshot.symbol !== 'XAU-USD-SPOT' || !isPositiveDecimal(snapshot.spot.price) ||
    !isTimestamp(snapshot.spot.computedAt) ||
    Date.parse(snapshot.spot.computedAt) > referenceTime.getTime()) return undefined;

  const timeframes: TimeframeBars[] = [];
  let barsAreCurrent = true;
  for (const [interval, duration] of REQUIRED_INTERVALS) {
    const matches = snapshot.bars.filter(item => item.interval === interval);
    const timeframe = matches[0];
    if (matches.length !== 1 || !timeframe) return undefined;
    const closedBars = timeframe.bars.filter(bar => bar.isClosed);
    const latestBar = closedBars.at(-1);
    if (closedBars.length < REQUIRED_BARS || !latestBar ||
      !validBars(closedBars, duration, referenceTime)) return undefined;
    if (referenceTime.getTime() - Date.parse(latestBar.barStart) - duration > duration * 2) {
      barsAreCurrent = false;
    }
    timeframes.push({ interval, bars: closedBars });
  }
  const indicators: TimeframeIndicatorSnapshot[] = timeframes.map(({ interval, bars: timeframeBars }) => {
    const closes = timeframeBars.map(bar => Number(bar.close));
    return {
      interval,
      ema20: calculateEma(closes, 20).at(-1) ?? null,
      ema50: calculateEma(closes, 50).at(-1) ?? null,
      ema200: calculateEma(closes, 200).at(-1) ?? null,
      rsi14: calculateRsi(closes, 14).at(-1) ?? null,
      momentum14: calculateMomentum(closes, 14),
    };
  });
  if (indicators.some(item => item.ema20 === null || item.ema50 === null ||
    item.ema200 === null || item.rsi14 === null || item.momentum14 === null)) return undefined;
  return {
    analysisTime: referenceTime.toISOString(),
    snapshot: { ...snapshot, bars: timeframes },
    indicators,
    actionableData: barsAreCurrent && !snapshot.spot.isStale,
    barsAreCurrent,
  };
}

function validBars(bars: MarketBar[], duration: number, referenceTime: Date): boolean {
  let previousStart: number | undefined;
  for (const bar of bars) {
    const start = Date.parse(bar.barStart);
    const open = Number(bar.open);
    const high = Number(bar.high);
    const low = Number(bar.low);
    const close = Number(bar.close);
    if (!bar.isClosed || !Number.isFinite(start) ||
      [open, high, low, close].some(value => !Number.isFinite(value) || value <= 0)) {
      return false;
    }
    if (high < Math.max(open, close, low) || low > Math.min(open, close, high) ||
      start + duration > referenceTime.getTime()) return false;
    if (previousStart !== undefined) {
      const gap = start - previousStart;
      if (gap <= 0 || (gap !== duration && !isWeekendMarketClosure(previousStart, start))) return false;
    }
    previousStart = start;
  }
  return true;
}

function isWeekendMarketClosure(previousStart: number, nextStart: number): boolean {
  const previous = new Date(previousStart);
  const next = new Date(nextStart);
  const previousDay = previous.getUTCDay();
  const nextDay = next.getUTCDay();
  const gap = nextStart - previousStart;
  return previousDay === 5 && (nextDay === 0 || nextDay === 1) && gap <= 72 * 60 * 60_000;
}

function addScenarioMetrics(
  report: GeneratedAnalysis['report'],
  actionableData: boolean,
): GeneratedAnalysis['report'] {
  if (!actionableData) {
    return {
      ...report,
      entryPlan: 'Datos no actuales; no se proponen entradas, stops ni objetivos numéricos vigentes. Esperar una actualización verificable de cotización y velas antes de evaluar escenarios.',
      scenarios: [
        nonActionableScenario(report.scenarios[0]),
        nonActionableScenario(report.scenarios[1]),
      ],
    };
  }
  return {
    ...report,
    scenarios: report.scenarios.map(scenario => {
      const prices = scenarioPrices(scenario);
      if (!prices) return scenario;
      const validation = validateScenario(prices);
      if (!validation.valid) throw new AnalysisServiceError('invalid_report');
      return { ...scenario, metrics: calculateScenarioMetrics(prices) };
    }) as GeneratedAnalysis['report']['scenarios'],
  };
}

function nonActionableScenario(scenario: AnalysisScenario): AnalysisScenario {
  return {
    ...scenario,
    direction: 'wait',
    context: 'Los datos disponibles se conservan únicamente para contexto histórico.',
    preconditions: 'Esperar cotización y velas cerradas actuales.',
    m15Zone: 'No se propone una zona operativa con datos no actuales.',
    m5Confirmation: 'Esperar actualización verificable y cierre confirmado.',
    entryType: 'wait',
    entryLow: null,
    entryHigh: null,
    stopLoss: null,
    takeProfits: [null, null, null],
    cancellation: 'No entrar hasta recibir datos actuales.',
    management: 'No aplica sin entrada.',
    validity: 'Rehacer el análisis cuando se actualicen cotización y velas.',
    invalidation: 'No aplica mientras los datos no sean actuales.',
    rationale: 'No se proponen niveles operativos basados en datos no actuales.',
    metrics: undefined,
  };
}

function scenarioPrices(scenario: AnalysisScenario): ScenarioPrices | undefined {
  const [target1, target2, target3] = scenario.takeProfits;
  if (scenario.direction === 'wait' || scenario.entryLow === null || scenario.entryHigh === null ||
    scenario.stopLoss === null || target1 === null || target2 === null || target3 === null) return undefined;
  return {
    direction: scenario.direction,
    entryLow: scenario.entryLow,
    entryHigh: scenario.entryHigh,
    stopLoss: scenario.stopLoss,
    takeProfits: [target1, target2, target3],
  };
}

function makeSources(
  snapshot: MarketSnapshot,
  generated?: GeneratedAnalysis,
  barsAreCurrent?: boolean,
): AnalysisSources {
  const barSource = {
    source: snapshot.spot.source,
    displayName: 'Velas cerradas',
    informational: true,
    ...(barsAreCurrent === undefined ? {} : { isStale: !barsAreCurrent }),
  };
  return {
    market: [
      { source: snapshot.spot.source, price: snapshot.spot.price, isStale: snapshot.spot.isStale },
      barSource,
      ...snapshot.spot.sources,
    ],
    calendar: generated?.calendar ?? UNAVAILABLE_CALENDAR,
  };
}

function createRecord(
  date: string,
  values: Partial<AnalysisRecord> & Pick<AnalysisRecord, 'status'>,
): AnalysisRecord {
  return {
    analysisDate: date,
    status: values.status,
    report: values.report ?? null,
    sources: values.sources ?? { market: [], calendar: UNAVAILABLE_CALENDAR },
    marketSource: values.marketSource ?? null,
    referencePrice: values.referencePrice ?? null,
    referenceAt: values.referenceAt ?? null,
    generatedAt: values.generatedAt ?? null,
    model: values.model ?? null,
    promptVersion: values.promptVersion ?? null,
    errorCode: values.errorCode ?? null,
  };
}

function failedRecord(options: {
  analysisDate: string;
  generatedAt: string;
  errorCode: string;
  market?: MarketSnapshot;
  barsAreCurrent?: boolean;
  model?: string;
}): AnalysisRecord {
  return createRecord(options.analysisDate, {
    status: 'failed',
    sources: options.market ? makeSources(options.market, undefined, options.barsAreCurrent) : undefined,
    marketSource: options.market?.spot.source ?? null,
    referencePrice: options.market?.spot.price ?? null,
    referenceAt: options.market?.spot.computedAt ?? null,
    generatedAt: options.generatedAt,
    model: options.model ?? null,
    promptVersion: options.model ? ANALYSIS_PROMPT_VERSION : null,
    errorCode: options.errorCode,
  });
}

async function retry<T>(operation: () => Promise<T>, sleep: (milliseconds: number) => Promise<void>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const delay = RETRY_DELAYS[attempt];
      if (!isTransientError(error) || delay === undefined) throw error;
      await sleep(delay);
    }
  }
}

function isTransientError(error: unknown): boolean {
  if (error instanceof MarketDataError) {
    return ['rate_limited', 'timeout', 'provider_unavailable'].includes(error.code);
  }
  return error instanceof GeminiAnalysisError && error.code === 'provider_error';
}

function errorCode(error: unknown): string {
  if (error instanceof MarketDataError || error instanceof GeminiAnalysisError ||
    error instanceof AnalysisServiceError) return error.code;
  return 'analysis_failed';
}

function assertDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
    throw new RangeError('analysis date must be a valid ISO calendar date');
  }
}

function isPositiveDecimal(value: string): boolean {
  return /^\d+(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value)) && Number(value) > 0;
}

function isTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value)) && /(?:Z|\+00:00)$/.test(value);
}

class AnalysisServiceError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}
