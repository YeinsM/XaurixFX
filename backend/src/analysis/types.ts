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

export interface MarketSnapshot {
  symbol: 'XAU-USD-SPOT';
  spot: { price: string; isStale: boolean; computedAt: string; source: string };
  bars: TimeframeBars[];
}

export interface ScenarioPrices {
  direction: Direction;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  takeProfits: [number, number, number];
}
