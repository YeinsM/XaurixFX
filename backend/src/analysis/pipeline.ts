import type { Pool } from 'pg';
import { withAnalysisDateLock, createAnalysisRepository } from '../analysisRepository.js';
import { createGeminiAnalysisClient } from './gemini.js';
import type { ImageStore } from './imageStore.js';
import { createGeminiImageClient, createScenarioImageRepository, generateScenarioImages } from './scenarioImages.js';
import { runDailyAnalysis } from './service.js';
import type { AnalysisRecord } from './types.js';

/** Informe (prompt 1) y, después, imagen del Escenario A (prompt 2) y del B (prompt 3). */
export function createAnalysisPipeline(options: {
  pool: Pool; apiKey?: string; model: string; imageModel: string; imageStore: ImageStore;
  onImageError?: (error: unknown) => void;
}) {
  const repository = createAnalysisRepository(options.pool);
  const imageRepository = createScenarioImageRepository(options.pool);
  const gemini = options.apiKey ? createGeminiAnalysisClient({ apiKey: options.apiKey, model: options.model }) : undefined;
  const images = createGeminiImageClient({ apiKey: options.apiKey, model: options.imageModel });
  return async (date: string): Promise<AnalysisRecord> => {
    const record = await runDailyAnalysis(date, {
      repository,
      generateReport: gemini ? input => gemini.generateReport(input) : undefined,
      model: options.model,
    });
    if (record.status === 'published' && options.apiKey) {
      // Bloqueo compartido por cron, API y CLI, también entre procesos.
      await withAnalysisDateLock(options.pool, `images:${date}`, () => generateScenarioImages(record, {
        generateImage: prompt => images.generateImage(prompt),
        store: options.imageStore, repository: imageRepository, model: options.imageModel,
      })).catch(error => options.onImageError?.(error));
    }
    return record;
  };
}
