export type User = { id: string; name: string; email: string };
export type Course = { id: string; title: string; category: string; level: string; duration: string; lessons: number; description: string; body: string[]; accent: string };
export type Content = { courses: Course[] };
/** 'inicio' = landing de XaurixFX; 'home' = Inicio. */
export type Page = 'inicio' | 'home' | 'news' | 'analysis' | 'academy' | 'broker' | 'community' | 'settings';

export type AnalysisSource = {
  source: string;
  displayName?: string;
  price?: string;
  unit?: string;
  isStale?: boolean;
  informational?: boolean;
};

export type AnalysisScenarioMetrics = {
  entryReference: number;
  risk: number;
  rewardDistances: [number, number, number];
  rewardRisk: [number, number, number];
  belowMinimumRewardRisk: [boolean, boolean, boolean];
};

export type AnalysisScenario = {
  name: 'A' | 'B';
  direction: 'buy' | 'sell' | 'wait';
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
  metrics?: AnalysisScenarioMetrics;
};

export type AnalysisRecord = {
  analysisDate: string;
  status: 'published' | 'insufficient_data' | 'failed';
  report: {
    macro: string;
    confluence: string;
    entryPlan: string;
    scenarios: [AnalysisScenario, AnalysisScenario];
  } | null;
  sources: {
    market: AnalysisSource[];
    calendar: {
      status: 'verified' | 'unavailable';
      summary: string;
      citations: { url: string; title: string }[];
    };
  };
  marketSource: string | null;
  referencePrice: string | null;
  referenceAt: string | null;
  generatedAt: string | null;
  model: string | null;
  promptVersion: string | null;
  errorCode: string | null;
};

export type AnalysisResponse = {
  analyses: AnalysisRecord[];
  nextBefore: string | null;
};
