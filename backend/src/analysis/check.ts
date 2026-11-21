import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createGeminiAnalysisClient } from './gemini.js';
import { santoDomingoDate } from './service.js';
import { createLocalImageStore } from './imageStore.js';
import { createAnalysisPipeline } from './pipeline.js';
import { createPool } from '../db.js';
import { migrate } from '../migrate.js';

const model = process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen';
const client = createGeminiAnalysisClient({ apiKey: process.env.GEMINI_API_KEY, model });
let pool: ReturnType<typeof createPool> | undefined;
try {
  if (process.argv.includes('--publish')) {
    // Verifica el destino antes de consumir Gemini; publica el mismo texto que se imprime.
    if (!process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL en el backend para publicar el análisis.');
    pool = createPool(process.env.DATABASE_URL);
    await migrate(pool);
    const date = santoDomingoDate(new Date());
    const imageDir = process.env.ANALYSIS_IMAGE_DIR?.trim() || 'storage/analysis-images';
    if (process.argv.includes('--force')) {
      // Rehace todo el día: borra informe e imágenes de hoy (la FK elimina sus filas de imagen).
      if (!process.env.GEMINI_API_KEY?.trim()) throw new Error('Configura GEMINI_API_KEY antes de borrar el análisis de hoy.');
      await pool.query('DELETE FROM market_analyses WHERE analysis_date = $1', [date]);
      await rm(join(imageDir, 'analysis', date), { recursive: true, force: true });
      console.error(`Análisis e imágenes del ${date} eliminados; generando de nuevo…`);
    }
    const record = await createAnalysisPipeline({
      pool, apiKey: process.env.GEMINI_API_KEY, model,
      imageModel: process.env.GEMINI_IMAGE_MODEL?.trim() || 'gemini-3-pro-image',
      imageStore: createLocalImageStore(imageDir),
      onImageError: error => console.error(error instanceof Error ? error.message : 'No se pudieron generar las imágenes.'),
    })(date);
    if (record.status !== 'published') throw new Error(record.sources.errorMessage ?? 'No se pudo publicar el análisis.');
    process.stdout.write(`${record.report?.rawText ?? ''}\n`);
    console.error(`Análisis del ${record.analysisDate} publicado. Recarga la página Análisis.`);
  } else {
    // Diagnóstico sin base de datos; para publicar utiliza analysis:publish.
    const generated = await client.generateReport({ analysisTime: new Date().toISOString() });
    process.stdout.write(`${generated.report.rawText}\n`);
    for (const citation of generated.report.grounding?.citations ?? []) {
      process.stdout.write(`${citation.title}: ${citation.url}\n`);
    }
  }
} catch (error) {
  const code = (error as { code?: string })?.code;
  console.error(code ? `${code}: ${error instanceof Error ? error.message : 'Error'}`
    : error instanceof Error ? error.message : 'No se pudo completar la solicitud.');
  process.exitCode = 1;
} finally {
  await pool?.end();
}
