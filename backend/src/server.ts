import { buildApp } from './app.js';
import { createLocalImageStore } from './analysis/imageStore.js';
import { createAnalysisPipeline } from './analysis/pipeline.js';
import { santoDomingoDate } from './analysis/service.js';
import { registerAnalysisScheduler, startDailyAnalysisScheduler } from './analysis/scheduler.js';
import { readConfig } from './config.js';
import { createPool } from './db.js';
import { migrate } from './migrate.js';

const config = readConfig();
const pool = createPool(config.databaseUrl);
const imageStore = createLocalImageStore(config.analysisImageDir);
let logImageError: (error: unknown) => void = () => {};
const runAnalysis = createAnalysisPipeline({
  pool, apiKey: config.geminiApiKey, model: config.geminiModel,
  imageModel: config.geminiImageModel, imageStore, onImageError: error => logImageError(error),
});
const app = buildApp({
  pool, origin: config.origin, secureCookies: config.secureCookies, logger: true, imageStore,
  analysis: { adminUserIds: config.analysisAdminUserIds, generate: () => runAnalysis(santoDomingoDate(new Date())) },
});
logImageError = error => app.log.error({ errorName: error instanceof Error ? error.name : 'unknown' }, 'Scenario image generation failed');
// Prepara el historial antes de que el scheduler intente publicar el informe.
try {
  await migrate(pool);
} catch (error) {
  const code = (error as { code?: string })?.code;
  app.log.error({ code: code ?? 'MIGRATION_FAILED' }, 'No se pudieron aplicar las migraciones; revisa PostgreSQL y ejecuta npm run db:migrate.');
}
const analysisScheduler = startDailyAnalysisScheduler({
  run: runAnalysis,
  onError: error => app.log.error(
    { errorName: error instanceof Error ? error.name : 'unknown' },
    'Daily XAUUSD analysis execution failed',
  ),
});
registerAnalysisScheduler(app, analysisScheduler, () => pool.end());
pool.on('error', () => app.log.error('Database pool connection failed'));
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { void app.close(); });
}
try {
  await app.listen({ host: config.host, port: config.port });
} catch {
  app.log.error('Server could not start; check the host, port, and database configuration.');
  await app.close();
  process.exitCode = 1;
}
