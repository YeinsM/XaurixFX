export type MarketInterval = '5m' | '15m' | '1h' | '4h';
export type AnalysisStatus = 'published' | 'insufficient_data' | 'failed';
export type Direction = 'buy' | 'sell';

export interface MarketBar {
  barStart: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string | null;
  isClosed: boolean;
}

export interface TimeframeBars {
  interval: MarketInterval;
  bars: MarketBar[];
}

export interface MarketSource {
  source: string;
  displayName?: string;
  price?: string;
  unit?: string;
  isStale?: boolean;
  informational?: boolean;
}

export interface MarketSnapshot {
  symbol: 'XAU-USD-SPOT';
  spot: {
    price: string;
    isStale: boolean;
    computedAt: string;
    source: string;
    sources: MarketSource[];
  };
  bars: TimeframeBars[];
}

export interface ScenarioPrices {
  direction: Direction;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  takeProfits: [number, number, number];
}

export interface ScenarioMetrics {
  entryReference: number;
  risk: number;
  rewardDistances: [number, number, number];
  rewardRisk: [number, number, number];
  belowMinimumRewardRisk: [boolean, boolean, boolean];
}

export interface TimeframeIndicatorSnapshot {
  interval: MarketInterval;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  rsi14: number | null;
  momentum14: number | null;
}

export interface AnalysisInput {
  analysisTime: string;
  snapshot: MarketSnapshot;
  indicators: TimeframeIndicatorSnapshot[];
  actionableData: boolean;
  barsAreCurrent: boolean;
}

export interface CalendarCitation {
  url: string;
  title: string;
}

export interface CalendarResult {
  status: 'verified' | 'unavailable';
  summary: string;
  citations: CalendarCitation[];
}

export interface AnalysisScenario {
  name: 'A' | 'B';
  direction: Direction | 'wait';
  context: string;
  preconditions: string;
  m15Zone: string;
  m5Confirmation: string;
  entryType: string;
  entryLow: number | null;
  entryHigh: number | null;
  stopLoss: number | null;
  takeProfits: [number | null, number | null, number | null];
  cancellation: string;
  management: string;
  validity: string;
  invalidation: string;
  rationale: string;
  metrics?: ScenarioMetrics;
}

export interface AnalysisReport {
  macro: string;
  confluence: string;
  entryPlan: string;
  scenarios: [AnalysisScenario, AnalysisScenario];
}

export interface GeneratedAnalysis {
  report: AnalysisReport;
  calendar: CalendarResult;
}

export interface AnalysisSources {
  market: MarketSource[];
  calendar: CalendarResult;
}

export interface AnalysisRecord {
  analysisDate: string;
  status: AnalysisStatus;
  report: AnalysisReport | null;
  sources: AnalysisSources;
  marketSource: string | null;
  referencePrice: string | null;
  referenceAt: string | null;
  generatedAt: string | null;
  model: string | null;
  promptVersion: string | null;
  errorCode: string | null;
}
