import type { AnalysisInput, CalendarResult } from './types.js';

export const ANALYSIS_PROMPT_VERSION = 'xauusd-daily-2026-11-17-v1';

const nullablePrice = { type: ['number', 'null'] };
const textField = { type: 'string' };

export const ANALYSIS_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    macro: textField,
    confluence: textField,
    entryPlan: textField,
    scenarios: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', enum: ['A', 'B'] },
          direction: { type: 'string', enum: ['buy', 'sell', 'wait'] },
          context: textField,
          preconditions: textField,
          m15Zone: textField,
          m5Confirmation: textField,
          entryType: textField,
          entryLow: nullablePrice,
          entryHigh: nullablePrice,
          stopLoss: nullablePrice,
          takeProfits: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: nullablePrice,
          },
          cancellation: textField,
          management: textField,
          validity: textField,
          invalidation: textField,
          rationale: textField,
        },
        required: [
          'name', 'direction', 'context', 'preconditions', 'm15Zone',
          'm5Confirmation', 'entryType', 'entryLow', 'entryHigh',
          'stopLoss', 'takeProfits', 'cancellation', 'management',
          'validity', 'invalidation', 'rationale',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['macro', 'confluence', 'entryPlan', 'scenarios'],
  additionalProperties: false,
} as const;

export function buildCalendarPrompt(referenceTimestamp: string): string {
  const referenceDate = new Intl.DateTimeFormat('es-DO', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Santo_Domingo',
  }).format(new Date(referenceTimestamp));

  return [
    'Consulta con Google Search únicamente el calendario económico oficial de las próximas 24 horas relevante para el oro (XAU) y el dólar estadounidense.',
    `La hora de referencia es ${referenceDate} en República Dominicana (America/Santo_Domingo, UTC−4); el timestamp de referencia es ${referenceTimestamp}.`,
    'Incluye nombre del evento, horario local y fuente citada. Prioriza bancos centrales y publicaciones oficiales.',
    'No busques ni afirmes cotizaciones, precios, niveles técnicos o señales. No inventes eventos ni horarios.',
    'Si no encuentras eventos verificables con citas, indícalo expresamente.',
  ].join('\n');
}

export function buildAnalysisPrompt(input: AnalysisInput, calendar: CalendarResult): string {
  const market = {
    ...input.snapshot,
    bars: input.snapshot.bars.map(({ interval, bars }) => ({
      interval,
      bars: bars.filter(bar => bar.isClosed),
    })),
  };
  const calendarContext = calendar.status === 'verified'
    ? { summary: calendar.summary, citations: calendar.citations }
    : { summary: 'No se pudo verificar el calendario económico.', citations: [] };

  return [
    'Actúa como analista técnico especializado en XAUUSD. Analiza únicamente el paquete de datos proporcionado para precios, estructura e indicadores.',
    'Usa solo velas cerradas (isClosed=true). No busques, sustituyas ni inventes cotizaciones, indicadores, velas, niveles o noticias.',
    'Incluye la fuente, fecha, hora y precio de referencia. La fuente de precio es GoldPrice.dev; expresa las horas en República Dominicana (UTC−4).',
    'Si spot.isStale es true, no propongas niveles de entrada vigentes. El volumen spot null significa que no existe volumen consolidado; no lo conviertas en cero.',
    'Las zonas institucionales, Order Blocks, FVG y liquidez son interpretaciones técnicas; no afirme conocer órdenes o posiciones reales.',
    'Usa los indicadores adjuntos; no los recalcules. EMA usa alpha 2/(period+1) y semilla SMA; RSI 14 usa suavizado de Wilder; Momentum 14 = cierre actual / cierre de hace 14 velas × 100, con referencia 100.',
    'Las horas se expresan en República Dominicana (America/Santo_Domingo, UTC−4). Usa únicamente los eventos con cita adjuntos; si no se verificó el calendario, dilo claramente.',
    'Si falta temporalidad, hay datos insuficientes, huecos, valores inválidos o no se puede verificar la fuente/fecha, no propongas entrada, stop ni objetivos numéricos. Indica “datos insuficientes; esperar confirmación” y qué dato falta. En este informe automático, deja constancia de que el job no recibió capturas.',
    'Distingue observaciones confirmadas de hipótesis. Confirma BOS y CHoCH solo con cierres de velas. No presentes probabilidades ni lotaje.',
    '',
    'Devuelve exclusivamente el objeto JSON solicitado, en español, con tres partes:',
    '1. ANÁLISIS MACRO Y ESTRUCTURA — H4 Y H1: tendencia, swings HH/HL/LH/LL, estructura principal/interna, BOS/CHoCH con swing y cierre, soportes/resistencias, oferta/demanda, liquidez visible, barridas, desplazamientos, rechazos, retrocesos, consolidaciones, alineación y sesgo con zona decisiva e invalidación.',
    '2. CONFLUENCIA TÉCNICA — ORDER BLOCKS, FIBONACCI, EMA, RSI Y MOMENTUM: Order Blocks solo si preceden desplazamiento y ruptura; zonas, límites, mitigación e invalidación; FVG; anclajes Fibonacci y retrocesos 38.2%, 50%, 61.8%, 78.6%, extensiones 127.2%/161.8% solo si son razonables; EMA 20/50/200; RSI 14; Momentum 14. Incluye la tabla Temporalidad | Zona o señal | Evidencia | Implicación alcista/bajista | Estado de confirmación. Resume confluencias y contradicciones sin contar señales correlacionadas dos veces.',
    '3. PLAN DE ENTRADA ÓPTIMA — M15 Y M5: dos escenarios condicionales A (continuación) y B (alternativa si A se invalida); dirección, contexto, condiciones previas, zona M15, desencadenante M5, entrada, stop estructural considerando spread/volatilidad, TP1-TP3 técnicos, cancelación, gestión y vigencia. No propongas entrada por tocar una zona.',
    'Prioriza al menos 1:2 hasta un objetivo justificable; si no se cumple, indícalo. Si no existe configuración, usa dirección wait y null para todos los niveles. Las entradas con rango se calculan desde el punto medio, que el backend declara.',
    'Termina el texto de la tercera parte con “Preferencia actual: [escenario o esperar], condicionada a [confirmación concreta]”. El frontend genera la tabla comparativa desde los campos estructurados de los escenarios.',
    '',
    'Paquete de mercado e indicadores verificados:',
    JSON.stringify({ market, indicators: input.indicators, calendar: calendarContext }),
  ].join('\n');
}
