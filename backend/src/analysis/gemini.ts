import { GoogleGenAI, type GenerateContentParameters, type GenerateContentResponse, type HttpOptions } from '@google/genai';
import { buildAnalysisPrompt } from './prompt.js';
import type { GeneratedAnalysis } from './types.js';

interface GeminiClient {
  models: { generateContent(request: GenerateContentParameters): Promise<GenerateContentResponse> };
}

export class GeminiAnalysisError extends Error {
  constructor(readonly code: 'missing_api_key' | 'provider_error' | 'invalid_report', message: string) {
    super(message);
    this.name = 'GeminiAnalysisError';
  }
}

export function createGeminiAnalysisClient({ apiKey, model, client: injectedClient, timeoutMs = 120_000, fetch: transport }: {
  apiKey?: string; model: string; client?: GeminiClient; timeoutMs?: number; fetch?: HttpOptions['fetch'];
}) {
  const key = apiKey?.trim();
  const client = injectedClient ?? (key
    ? new GoogleGenAI({ apiKey: key, httpOptions: {
      apiVersion: 'v1beta', timeout: timeoutMs, fetch: transport,
      // Reintenta solo fallos transitorios, nunca permisos ni claves inválidas.
      retryOptions: { attempts: 2, initialDelay: 1, maxDelay: 2, httpStatusCodes: [408, 429, 500, 502, 503, 504] },
    } }) : undefined);
  return {
    async generateReport(input: { analysisTime: string }): Promise<GeneratedAnalysis> {
      if (!key || !client) throw new GeminiAnalysisError('missing_api_key', 'Configura GEMINI_API_KEY en el backend.');
      let response: GenerateContentResponse;
      try {
        // Una llamada: prompt completo, búsqueda habilitada y respuesta libre, sin esquema JSON.
        response = await client.models.generateContent({
          model,
          contents: buildAnalysisPrompt(input.analysisTime),
          config: { tools: [{ googleSearch: {} }] },
        });
      } catch (error) {
        // Conserva el motivo del proveedor sin filtrar credenciales al historial público.
        throw new GeminiAnalysisError('provider_error', providerErrorMessage(error, key));
      }
      const text = response.text;
      const candidate = response.candidates?.[0];
      if (!text?.trim()) {
        const reason = response.promptFeedback?.blockReason ?? candidate?.finishReason ?? 'EMPTY_RESPONSE';
        throw new GeminiAnalysisError('invalid_report', `Gemini devolvió una respuesta sin texto (${reason}).`);
      }
      const metadata = candidate?.groundingMetadata;
      const citations = (metadata?.groundingChunks ?? []).flatMap(chunk => {
        const web = chunk.web;
        if (!web?.uri) return [];
        try {
          const url = new URL(web.uri);
          return url.protocol === 'https:' && !url.username && !url.password
            ? [{ url: url.href, title: web.title || url.hostname }] : [];
        } catch { return []; }
      });
      // Guarda el texto íntegro, incluso si Gemini responde que faltan datos.
      return {
        report: {
          rawText: text, macro: '', confluence: '', entryPlan: '', scenarios: [],
          grounding: { citations, searchSuggestionsHtml: metadata?.searchEntryPoint?.renderedContent ?? '' },
          finishReason: candidate?.finishReason,
        },
        calendar: { status: 'unavailable', summary: '', citations: [] },
      };
    },
  };
}

/** Conserva el diagnóstico HTTP/DNS sin exponer la credencial en mensajes públicos. */
function providerErrorMessage(error: unknown, key: string): string {
  const value = error as { message?: unknown; status?: unknown; cause?: { code?: unknown; message?: unknown } } | null;
  const details = [
    typeof value?.status === 'number' ? `HTTP ${value.status}` : '',
    typeof value?.message === 'string' ? value.message : 'Error de conexión con Google',
    typeof value?.cause?.code === 'string' ? value.cause.code : '',
    typeof value?.cause?.message === 'string' ? value.cause.message : '',
  ].filter(Boolean).join(': ');
  return details.replaceAll(key, '[REDACTED]').replace(/AIza[\w-]+/g, '[REDACTED]').slice(0, 1500);
}
