import { buildApp } from './app.js';
import { createGeminiAnalysisClient } from './analysis/gemini.js';
import { createMarketDataClient } from './analysis/marketData.js';
import { runDailyAnalysis } from './analysis/service.js';
import { registerAnalysisScheduler, startDailyAnalysisScheduler } from './analysis/scheduler.js';
import { createAnalysisRepository } from './analysisRepository.js';
import { readConfig } from './config.js';
import { createPool } from './db.js';

const config = readConfig();
const pool = createPool(config.databaseUrl);
const app = buildApp({ pool, origin: config.origin, secureCookies: config.secureCookies, logger: true });
const analysisRepository = createAnalysisRepository(pool);
const marketData = config.goldPriceApiKey
  ? createMarketDataClient({ apiKey: config.goldPriceApiKey })
  : undefined;
const gemini = config.geminiApiKey
  ? createGeminiAnalysisClient({ apiKey: config.geminiApiKey, model: config.geminiModel })
  : undefined;
const analysisScheduler = startDailyAnalysisScheduler({
  run: date => runDailyAnalysis(date, {
    repository: analysisRepository,
    marketData,
    generateReport: gemini ? input => gemini.generateReport(input) : undefined,
    model: config.geminiModel,
  }),
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
