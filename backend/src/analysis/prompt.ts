export const ANALYSIS_PROMPT_VERSION = 'xauusd-direct-2026-11-17-v2';

export function buildAnalysisPrompt(analysisTime: string): string {
  return `Actúa como analista técnico especializado en XAUUSD. Realiza un análisis técnico completo de H4, H1, M15 y M5, integrando estructura de precios, acción del precio, zonas institucionales y confluencias operativas.

Fecha y hora de referencia: ${analysisTime}. Expresa horarios en República Dominicana (UTC−4).
Consulta con Google Search la información actual disponible y cita las fuentes y fechas utilizadas. Distingue datos observados de interpretaciones; no inventes cotizaciones, velas o indicadores. Si alguna información no está disponible, explica esa limitación dentro del informe y desarrolla las partes que sí puedes analizar. No solicites capturas ni esperes una segunda interacción: entrega tu respuesta en esta misma llamada.

Organiza tu respuesta en Markdown en estas tres partes:

1. ANÁLISIS MACRO Y ESTRUCTURA (H4 Y H1)
Determina tendencia o rango, máximos y mínimos HH/HL/LH/LL, estructura principal e interna, BOS y CHoCH con sus confirmaciones. Identifica soportes, resistencias, oferta, demanda, liquidez, barridas, desplazamientos, rechazos y retrocesos. Explica la alineación de H4 y H1, el sesgo dominante, la zona decisiva y su invalidación. Las zonas institucionales son interpretaciones, no evidencia de órdenes reales.

2. CONFLUENCIA TÉCNICA (ORDER BLOCKS, FIBONACCI, EMA, RSI Y MOMENTUM)
Identifica Order Blocks, límites, mitigación e invalidación; FVG y desequilibrios. Explica los anclajes de Fibonacci, retrocesos 38.2%, 50%, 61.8%, 78.6% y extensiones relevantes. Analiza EMA 20/50/200, RSI 14 y Momentum 14 como indicadores distintos: dirección, pendiente, fuerza, divergencias y coincidencias con estructura. Incluye una tabla de temporalidad, zona/señal, evidencia, implicación y confirmación. Señala confluencias y contradicciones sin duplicar señales correlacionadas.

3. PLAN DE ENTRADA ÓPTIMA (M15 Y M5): DOS ESCENARIOS
Escenario A: continuación del sesgo dominante. Escenario B: alternativa si A se invalida; adapta ambos si hay rango.
Para cada uno describe dirección, contexto, condiciones previas, zona M15, confirmación concreta M5 (barrida, BOS/CHoCH, desplazamiento y retesteo cuando correspondan), tipo y zona de entrada, stop estructural, TP1/TP2/TP3, distancias y relación riesgo/beneficio, cancelación, gestión, invalidación y vigencia. No fuerces precios que no puedas respaldar. No calcules lotaje ni inventes probabilidades.
Incluye una tabla: Escenario | Dirección | Entrada | Confirmación M5 | Stop loss | TP1 | TP2 | TP3 | R:B | Invalidación.
Concluye: “Preferencia actual: [escenario o esperar], condicionada a [confirmación concreta]”.

Entrega directamente el informe completo en español, con sus fuentes y limitaciones cuando correspondan. No devuelvas JSON.`;
}
