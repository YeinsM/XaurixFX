import { GoogleGenAI } from '@google/genai';
import { validateScenario } from './scenarios.js';
import { ANALYSIS_REPORT_SCHEMA, buildAnalysisPrompt, buildCalendarPrompt } from './prompt.js';
import type {
  AnalysisInput,
  AnalysisReport,
  AnalysisScenario,
  CalendarCitation,
  CalendarResult,
  GeneratedAnalysis,
} from './types.js';

type GeminiRequest = Parameters<GoogleGenAI['interactions']['create']>[0];

interface GeminiInteractionsClient {
  interactions: {
    create(request: GeminiRequest): Promise<unknown>;
  };
}

export type GeminiAnalysisErrorCode = 'missing_api_key' | 'provider_error' | 'invalid_report';

export class GeminiAnalysisError extends Error {
  constructor(readonly code: GeminiAnalysisErrorCode, message: string) {
    super(message);
    this.name = 'GeminiAnalysisError';
  }
}

interface GeminiAnalysisOptions {
  apiKey?: string;
  model: string;
  client?: GeminiInteractionsClient;
  timeoutMs?: number;
}

interface GeminiAnalysisClient {
  generateReport(input: AnalysisInput): Promise<GeneratedAnalysis>;
}

export function createGeminiAnalysisClient({
  apiKey,
  model,
  client: injectedClient,
  timeoutMs = 30_000,
}: GeminiAnalysisOptions): GeminiAnalysisClient {
  const client = injectedClient ?? (apiKey?.trim()
    ? new GoogleGenAI({ apiKey: apiKey.trim(), httpOptions: { timeout: timeoutMs } })
    : undefined);

  return {
    async generateReport(input) {
      if (!apiKey?.trim()) {
        throw new GeminiAnalysisError('missing_api_key', 'Gemini API key is not configured');
      }
      if (!client) {
        throw new GeminiAnalysisError('provider_error', 'Gemini client is unavailable');
      }

      const calendar = await requestCalendar(client, model, input);
      const response = await requestInteraction(client, {
        model,
        input: buildAnalysisPrompt(input, calendar),
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: ANALYSIS_REPORT_SCHEMA,
        },
        store: false,
      });
      return { report: parseAnalysisReport(response), calendar };
    },
  };
}

async function requestCalendar(
  client: GeminiInteractionsClient,
  model: string,
  input: AnalysisInput,
): Promise<CalendarResult> {
  try {
    const response = await requestInteraction(client, {
      model,
      input: buildCalendarPrompt(input.analysisTime),
      tools: [{ type: 'google_search' }],
      store: false,
    });
    const summary = readOutputText(response);
    const citations = readCitations(response);
    if (!summary || hasUnsafeMarkup(summary) || citations.length === 0) {
      return unavailableCalendar();
    }
    return { status: 'verified', summary, citations };
  } catch {
    return unavailableCalendar();
  }
}

async function requestInteraction(
  client: GeminiInteractionsClient,
  request: GeminiRequest,
): Promise<unknown> {
  try {
    return await client.interactions.create({ ...request, store: false });
  } catch {
    throw new GeminiAnalysisError('provider_error', 'Gemini request failed');
  }
}

function parseAnalysisReport(response: unknown): AnalysisReport {
  const output = readOutputText(response);
  if (!output) throw new GeminiAnalysisError('invalid_report', 'Gemini returned no structured report');

  let value: unknown;
  try {
    value = JSON.parse(output);
  } catch {
    throw new GeminiAnalysisError('invalid_report', 'Gemini returned invalid report JSON');
  }
  if (!isRecord(value) || !isPlainText(value.macro) || !isPlainText(value.confluence) ||
    !isPlainText(value.entryPlan) || !Array.isArray(value.scenarios) || value.scenarios.length !== 2) {
    throw new GeminiAnalysisError('invalid_report', 'Gemini report is missing required fields');
  }

  const scenarios = value.scenarios.map(parseScenario);
  if (scenarios[0]?.name !== 'A' || scenarios[1]?.name !== 'B') {
    throw new GeminiAnalysisError('invalid_report', 'Gemini report must contain scenarios A and B');
  }
  return {
    macro: value.macro,
    confluence: value.confluence,
    entryPlan: value.entryPlan,
    scenarios: [scenarios[0], scenarios[1]],
  };
}

function parseScenario(value: unknown): AnalysisScenario {
  if (!isRecord(value) || (value.name !== 'A' && value.name !== 'B') ||
    (value.direction !== 'buy' && value.direction !== 'sell' && value.direction !== 'wait') ||
    !Array.isArray(value.takeProfits) || value.takeProfits.length !== 3) {
    throw new GeminiAnalysisError('invalid_report', 'Gemini scenario is missing required fields');
  }

  const entryLow = readNullablePrice(value.entryLow);
  const entryHigh = readNullablePrice(value.entryHigh);
  const stopLoss = readNullablePrice(value.stopLoss);
  const takeProfits: [number | null, number | null, number | null] = [
    readNullablePrice(value.takeProfits[0]),
    readNullablePrice(value.takeProfits[1]),
    readNullablePrice(value.takeProfits[2]),
  ];
  const prices = [entryLow, entryHigh, stopLoss, ...takeProfits];
  const hasAnyPrice = prices.some(price => price !== null);
  const hasAllPrices = prices.every(price => typeof price === 'number');
  if (hasAnyPrice !== hasAllPrices) {
    throw new GeminiAnalysisError('invalid_report', 'Gemini scenario must provide all prices or none');
  }

  const scenario: AnalysisScenario = {
    name: value.name,
    direction: value.direction,
    context: readText(value, 'context'),
    preconditions: readText(value, 'preconditions'),
    m15Zone: readText(value, 'm15Zone'),
    m5Confirmation: readText(value, 'm5Confirmation'),
    entryType: readText(value, 'entryType'),
    entryLow,
    entryHigh,
    stopLoss,
    takeProfits,
    cancellation: readText(value, 'cancellation'),
    management: readText(value, 'management'),
    validity: readText(value, 'validity'),
    invalidation: readText(value, 'invalidation'),
    rationale: readText(value, 'rationale'),
  };

  if (scenario.direction === 'wait' && hasAnyPrice) {
    throw new GeminiAnalysisError('invalid_report', 'Waiting scenarios cannot contain entry prices');
  }
  if (scenario.direction !== 'wait' && hasAllPrices) {
    const [target1, target2, target3] = takeProfits;
    const valid = validateScenario({
      direction: scenario.direction,
      entryLow: requirePrice(entryLow),
      entryHigh: requirePrice(entryHigh),
      stopLoss: requirePrice(stopLoss),
      takeProfits: [requirePrice(target1), requirePrice(target2), requirePrice(target3)],
    });
    if (!valid.valid) throw new GeminiAnalysisError('invalid_report', 'Gemini scenario levels are inconsistent');
  }
  return scenario;
}

function readText(value: Record<string, unknown>, key: string): string {
  const text = value[key];
  if (!isPlainText(text)) throw new GeminiAnalysisError('invalid_report', 'Gemini scenario contains invalid text');
  return text;
}

function readNullablePrice(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new GeminiAnalysisError('invalid_report', 'Gemini scenario contains invalid prices');
  }
  return value;
}

function requirePrice(value: number | null): number {
  if (value === null) throw new GeminiAnalysisError('invalid_report', 'Gemini scenario levels are incomplete');
  return value;
}

function readOutputText(response: unknown): string | undefined {
  if (!isRecord(response)) return undefined;
  if (typeof response.output_text === 'string') return response.output_text;
  if (!Array.isArray(response.steps)) return undefined;
  const parts: string[] = [];
  for (const step of response.steps) {
    if (!isRecord(step) || step.type !== 'model_output' || !Array.isArray(step.content)) continue;
    for (const content of step.content) {
      if (isRecord(content) && content.type === 'text' && typeof content.text === 'string') {
        parts.push(content.text);
      }
    }
  }
  return parts.length > 0 ? parts.join('\n') : undefined;
}

function readCitations(response: unknown): CalendarCitation[] {
  if (!isRecord(response) || !Array.isArray(response.steps)) return [];
  const citations = new Map<string, CalendarCitation>();
  for (const step of response.steps) {
    if (!isRecord(step) || step.type !== 'model_output' || !Array.isArray(step.content)) continue;
    for (const content of step.content) {
      if (!isRecord(content) || !Array.isArray(content.annotations)) continue;
      for (const annotation of content.annotations) {
        if (!isRecord(annotation) || annotation.type !== 'url_citation' ||
          typeof annotation.url !== 'string' || typeof annotation.title !== 'string') continue;
        try {
          const url = new URL(annotation.url);
          if (url.protocol !== 'https:' || url.username || url.password || !annotation.title.trim()) continue;
          citations.set(url.href, { url: url.href, title: annotation.title.trim() });
        } catch {
          continue;
        }
      }
    }
  }
  return [...citations.values()];
}

function isPlainText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !hasUnsafeMarkup(value);
}

function hasUnsafeMarkup(value: string): boolean {
  return /<\/?[a-z][^>]*>/i.test(value);
}

function unavailableCalendar(): CalendarResult {
  return {
    status: 'unavailable',
    summary: 'No se pudo verificar el calendario económico.',
    citations: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
