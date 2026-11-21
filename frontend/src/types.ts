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
    rawText?: string;
    finishReason?: string;
    grounding?: { citations: { url: string; title: string }[]; searchSuggestionsHtml: string };
    macro: string;
    confluence: string;
    entryPlan: string;
    scenarios: [AnalysisScenario, AnalysisScenario] | [];
  } | null;
  sources: {
    errorMessage?: string;
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
  images?: AnalysisImage[];
};

export type AnalysisImage = { scenario: 'A' | 'B'; status: 'ready' | 'failed'; url?: string; errorMessage?: string };

export type AnalysisResponse = {
  analyses: AnalysisRecord[];
  nextBefore: string | null;
};

/** Ruta de la Academia: niveles con cápsulas en video y guía PDF (GET /api/academy). */
export type AcademyCapsule = {
  id: string; title: string; topic: string; objective: string; durationSec: number; narrated: boolean;
  /** null en niveles de pago: el backend no expone sus medios. */
  media: { video: string; subtitles: string; pdf: string } | null;
};
/** unlocked: nivel gratuito o sesión de administrador (lo decide el backend). */
/** manual: URL del manual completo del nivel si está desbloqueado; hasManual indica que existe. */
export type AcademyLevel = { level: number; name: string; free: boolean; priceUsdt: number | null; unlocked: boolean; hasManual?: boolean; manual?: string | null; capsules: AcademyCapsule[] };
export type AcademyCatalog = { admin: boolean; levels: AcademyLevel[] };
