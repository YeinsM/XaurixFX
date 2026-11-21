import { GeminiAnalysisError } from './gemini.js';
import { ANALYSIS_PROMPT_VERSION } from './prompt.js';
import type { AnalysisRecord, GeneratedAnalysis } from './types.js';

export interface DailyAnalysisRepository {
  withDateLock<T>(date: string, operation: () => Promise<T>): Promise<T>;
  findByDate(date: string): Promise<AnalysisRecord | undefined>;
  save(record: AnalysisRecord): Promise<void>;
}

export function santoDomingoDate(date: Date): string {
  if (!Number.isFinite(date.getTime())) throw new RangeError('clock must return a valid date');
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santo_Domingo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function runDailyAnalysis(date: string, dependencies: {
  repository: DailyAnalysisRepository;
  generateReport?: (input: { analysisTime: string }) => Promise<GeneratedAnalysis>;
  model: string;
  clock?: () => Date;
}): Promise<AnalysisRecord> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new RangeError('analysis date must be a valid ISO calendar date');
  }
  const clock = dependencies.clock ?? (() => new Date());
  return dependencies.repository.withDateLock(date, async () => {
    const existing = await dependencies.repository.findByDate(date);
    // Reutiliza cualquier informe publicado hoy, incluso tras cambiar el prompt.
    if (existing?.status === 'published') return existing;
    const record: AnalysisRecord = {
      analysisDate: date, status: 'failed', report: null,
      sources: { market: [], calendar: { status: 'unavailable', summary: '', citations: [] } },
      marketSource: null, referencePrice: null, referenceAt: null,
      generatedAt: clock().toISOString(), model: dependencies.model,
      promptVersion: ANALYSIS_PROMPT_VERSION, errorCode: null,
    };
    try {
      if (!dependencies.generateReport) throw new GeminiAnalysisError('missing_api_key', 'Configura GEMINI_API_KEY en el backend.');
      const generated = await dependencies.generateReport({ analysisTime: clock().toISOString() });
      record.status = 'published';
      record.report = generated.report;
      record.sources.calendar = generated.calendar;
    } catch (error) {
      record.errorCode = error instanceof GeminiAnalysisError ? error.code : 'analysis_failed';
      record.sources.errorMessage = error instanceof GeminiAnalysisError ? error.message : 'No se pudo completar la solicitud a Gemini.';
    }
    record.generatedAt = clock().toISOString();
    await dependencies.repository.save(record);
    return record;
  });
}
