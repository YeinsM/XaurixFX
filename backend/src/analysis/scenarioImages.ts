import { GoogleGenAI, type GenerateContentParameters, type GenerateContentResponse } from '@google/genai';
import type { Pool } from 'pg';
import type { ImageStore } from './imageStore.js';
import type { AnalysisRecord } from './types.js';

export type ScenarioName = 'A' | 'B';
export const SCENARIOS: ScenarioName[] = ['A', 'B'];

export interface AnalysisImage {
  scenario: ScenarioName;
  status: 'ready' | 'failed';
  url?: string;
  errorMessage?: string;
}

interface ImageClient {
  models: { generateContent(request: GenerateContentParameters): Promise<GenerateContentResponse> };
}

/** Extrae del informe el bloque del escenario indicado y la tabla resumen. */
export function extractScenarioText(fullText: string, scenario: ScenarioName): string | undefined {
  // Los escenarios viven en la parte 3; evita menciones previas en otras secciones.
  const planStart = fullText.search(/plan de entrada/i);
  const rawText = planStart === -1 ? fullText : fullText.slice(planStart);
  const heading = (name: ScenarioName) => new RegExp(`^[^\\n|]*escenario\\s+${name}\\b`, 'im');
  const start = rawText.search(heading(scenario));
  if (start === -1) return undefined;
  const rest = rawText.slice(start);
  const endPatterns = scenario === 'A'
    ? [heading('B')]
    : [/^\s*\|/m, /^#{1,6}\s/m, /preferencia actual/i];
  // Busca el final a partir de la línea siguiente al encabezado del escenario.
  const bodyStart = rest.indexOf('\n') === -1 ? rest.length : rest.indexOf('\n') + 1;
  let end = rest.length;
  for (const pattern of endPatterns) {
    const index = rest.slice(bodyStart).search(pattern);
    if (index !== -1) end = Math.min(end, bodyStart + index);
  }
  const block = rest.slice(0, end).trim();
  const tableRows = rawText.split('\n').filter(line => /^\s*\|/.test(line)
    && (/escenario/i.test(line) || new RegExp(`^\\s*\\|\\s*(\\*\\*)?(escenario\\s+)?${scenario}\\b`, 'i').test(line)));
  return [block, tableRows.length ? tableRows.join('\n') : ''].filter(Boolean).join('\n\n');
}

export function buildScenarioImagePrompt(scenarioText: string, scenario: ScenarioName): string {
  return `Genera una imagen ilustrativa de un gráfico de velas japonesas de XAUUSD (oro) en temporalidad M15 que represente el siguiente plan de entrada (Escenario ${scenario}).

Requisitos:
- Dibuja líneas horizontales con etiquetas claras y legibles para: precio o zona de entrada, Stop Loss (SL), TP1, TP2 y TP3, cada una con su valor exacto.
- Usa únicamente los niveles que aparecen en el texto; no inventes precios. Si un nivel no está en el texto, omítelo.
- Colores: SL en rojo, TP en verde, entrada en dorado; fondo oscuro, estilo de plataforma profesional.
- Indica la dirección (compra o venta) con una flecha y un título: "XAUUSD · Escenario ${scenario}".
- Representa la zona entre entrada y SL como riesgo (rojo translúcido) y entre entrada y TP como beneficio (verde translúcido).
- Texto de la imagen en español. Formato horizontal 16:9.

Escenario ${scenario}:
${scenarioText}`;
}

export function createGeminiImageClient({ apiKey, model, client: injected, timeoutMs = 180_000 }: {
  apiKey?: string; model: string; client?: ImageClient; timeoutMs?: number;
}) {
  const key = apiKey?.trim();
  const client = injected ?? (key ? new GoogleGenAI({ apiKey: key, httpOptions: { apiVersion: 'v1beta', timeout: timeoutMs } }) : undefined);
  return {
    model,
    async generateImage(prompt: string): Promise<{ data: Buffer; mimeType: string }> {
      if (!key || !client) throw new Error('Configura GEMINI_API_KEY en el backend.');
      let response: GenerateContentResponse;
      try {
        response = await client.models.generateContent({
          model, contents: prompt,
          config: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: '16:9', imageSize: '2K' } },
        });
      } catch (error) {
        const value = error as { status?: unknown; message?: unknown };
        const message = [typeof value?.status === 'number' ? `HTTP ${value.status}` : '', typeof value?.message === 'string' ? value.message : 'Error de conexión con Google']
          .filter(Boolean).join(': ');
        throw new Error(message.replaceAll(key, '[REDACTED]').replace(/AIza[\w-]+/g, '[REDACTED]').slice(0, 500));
      }
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const image = parts.find(part => part.inlineData?.data && part.inlineData.mimeType?.startsWith('image/'))?.inlineData;
      if (!image?.data || !image.mimeType) {
        const reason = response.promptFeedback?.blockReason ?? response.candidates?.[0]?.finishReason ?? 'SIN_IMAGEN';
        throw new Error(`Gemini no devolvió una imagen (${reason}).`);
      }
      return { data: Buffer.from(image.data, 'base64'), mimeType: image.mimeType };
    },
  };
}

const EXTENSIONS: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

export interface ScenarioImageRepository {
  list(date: string): Promise<{ scenario: ScenarioName; status: 'ready' | 'failed' }[]>;
  save(row: { date: string; scenario: ScenarioName; status: 'ready' | 'failed'; storageKey?: string; mimeType?: string; errorMessage?: string; model: string }): Promise<void>;
}

/** Genera primero la imagen del escenario A y, al terminar, la del B. */
export async function generateScenarioImages(record: AnalysisRecord, dependencies: {
  generateImage: (prompt: string) => Promise<{ data: Buffer; mimeType: string }>;
  store: ImageStore;
  repository: ScenarioImageRepository;
  model: string;
}): Promise<void> {
  const rawText = record.report?.rawText;
  if (record.status !== 'published' || !rawText) return;
  const existing = await dependencies.repository.list(record.analysisDate);
  for (const scenario of SCENARIOS) {
    // No vuelve a gastar por imágenes ya intentadas, aunque Google haya fallado.
    if (existing.some(image => image.scenario === scenario)) continue;
    const base = { date: record.analysisDate, scenario, model: dependencies.model };
    const text = extractScenarioText(rawText, scenario);
    if (!text) {
      await dependencies.repository.save({ ...base, status: 'failed', errorMessage: `El informe no contiene el Escenario ${scenario}.` });
      continue;
    }
    try {
      const image = await dependencies.generateImage(buildScenarioImagePrompt(text, scenario));
      const extension = EXTENSIONS[image.mimeType];
      if (!extension) throw new Error(`Formato de imagen no admitido (${image.mimeType}).`);
      const storageKey = `analysis/${record.analysisDate}/scenario-${scenario}.${extension}`;
      await dependencies.store.put(storageKey, image.data, image.mimeType);
      await dependencies.repository.save({ ...base, status: 'ready', storageKey, mimeType: image.mimeType });
    } catch (error) {
      await dependencies.repository.save({ ...base, status: 'failed', errorMessage: error instanceof Error ? error.message : 'No se pudo generar la imagen.' });
    }
  }
}

export function createScenarioImageRepository(pool: Pool): ScenarioImageRepository & {
  find(date: string, scenario: ScenarioName): Promise<{ storageKey: string; mimeType: string } | undefined>;
  listForDates(dates: string[]): Promise<Map<string, AnalysisImage[]>>;
} {
  return {
    async list(date) {
      const result = await pool.query('SELECT scenario, status FROM analysis_images WHERE analysis_date = $1', [date]);
      return result.rows as { scenario: ScenarioName; status: 'ready' | 'failed' }[];
    },
    async save(row) {
      await pool.query(
        `INSERT INTO analysis_images (analysis_date, scenario, status, storage_key, mime_type, error_message, model)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (analysis_date, scenario) DO UPDATE SET status = EXCLUDED.status, storage_key = EXCLUDED.storage_key,
          mime_type = EXCLUDED.mime_type, error_message = EXCLUDED.error_message, model = EXCLUDED.model, updated_at = now()`,
        [row.date, row.scenario, row.status, row.storageKey ?? null, row.mimeType ?? null, row.errorMessage ?? null, row.model],
      );
    },
    async find(date, scenario) {
      const result = await pool.query(
        "SELECT storage_key, mime_type FROM analysis_images WHERE analysis_date = $1 AND scenario = $2 AND status = 'ready'",
        [date, scenario],
      );
      const row = result.rows[0] as { storage_key: string; mime_type: string } | undefined;
      return row ? { storageKey: row.storage_key, mimeType: row.mime_type } : undefined;
    },
    async listForDates(dates) {
      const map = new Map<string, AnalysisImage[]>();
      if (!dates.length) return map;
      const result = await pool.query(
        `SELECT to_char(analysis_date, 'YYYY-MM-DD') AS date, scenario, status, error_message, extract(epoch FROM updated_at)::bigint AS version
        FROM analysis_images WHERE analysis_date = ANY($1::date[]) ORDER BY scenario`,
        [dates],
      );
      for (const row of result.rows as { date: string; scenario: ScenarioName; status: 'ready' | 'failed'; error_message: string | null; version: string }[]) {
        const image: AnalysisImage = row.status === 'ready'
          ? { scenario: row.scenario, status: 'ready', url: `/api/analysis/${row.date}/images/${row.scenario}?v=${row.version}` }
          : { scenario: row.scenario, status: 'failed', errorMessage: row.error_message ?? 'No se pudo generar la imagen.' };
        map.set(row.date, [...(map.get(row.date) ?? []), image]);
      }
      return map;
    },
  };
}
