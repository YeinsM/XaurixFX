import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AnalysisContent } from './AnalysisContent';
import type { AnalysisRecord, AnalysisScenario } from '../types';

const activeScenario: AnalysisScenario = {
  name: 'A',
  direction: 'buy',
  context: 'Continuación condicionada.',
  preconditions: 'Cierre por encima del swing.',
  m15Zone: '1998–2000',
  m5Confirmation: 'BOS por cierre y retesteo.',
  entryType: 'market_after_confirmation',
  entryLow: 2000,
  entryHigh: 2002,
  stopLoss: 1996,
  takeProfits: [2010, 2014, 2018],
  cancellation: 'Cancelar si pierde el mínimo.',
  management: 'Parcial en TP1.',
  validity: 'Hasta el cierre H1 siguiente.',
  invalidation: 'Cierre H1 bajo 1996.',
  rationale: 'Estructura alcista confirmada.',
  metrics: {
    entryReference: 2001,
    risk: 5,
    rewardDistances: [9, 13, 17],
    rewardRisk: [1.8, 2.6, 3.4],
    belowMinimumRewardRisk: [true, false, false],
  },
};

const waitingScenario: AnalysisScenario = {
  name: 'B',
  direction: 'wait',
  context: 'Esperar confirmación.',
  preconditions: 'Sin señal contraria.',
  m15Zone: 'No disponible',
  m5Confirmation: 'Esperar CHoCH por cierre.',
  entryType: 'wait',
  entryLow: null,
  entryHigh: null,
  stopLoss: null,
  takeProfits: [null, null, null],
  cancellation: 'No aplica.',
  management: 'No aplica.',
  validity: 'Reanalizar tras nuevo cierre.',
  invalidation: 'Ninguna entrada propuesta.',
  rationale: 'No hay una señal contraria confirmada.',
};

function analysisRecord(overrides: Partial<AnalysisRecord> = {}): AnalysisRecord {
  return {
    analysisDate: '2026-11-17',
    status: 'published',
    report: {
      macro: 'H4 y H1 muestran una estructura mixta.',
      confluence: 'EMA 20: 2000; RSI 14: 52; Momentum 14: 101.',
      entryPlan: 'Esperar cierre M5 y retesteo.',
      scenarios: [activeScenario, waitingScenario],
    },
    sources: {
      market: [
        { source: 'GoldPrice.dev', price: '2000.00', isStale: false },
        { source: 'GoldPrice.dev', displayName: 'Velas cerradas', isStale: false, informational: true },
      ],
      calendar: {
        status: 'verified',
        summary: 'Próximo evento relevante.',
        citations: [{ url: 'https://www.federalreserve.gov/calendar.htm', title: 'Federal Reserve' }],
      },
    },
    marketSource: 'GoldPrice.dev',
    referencePrice: '2000.00',
    referenceAt: '2026-11-17T12:00:00Z',
    generatedAt: '2026-11-17T12:03:00Z',
    model: 'gemini-test',
    promptVersion: 'test-v1',
    errorCode: null,
    ...overrides,
  };
}

describe('AnalysisContent', () => {
  it('renders the complete free-form Gemini answer without legacy panels or replacements', () => {
    const record = analysisRecord({ report: { rawText: '## Respuesta Gemini\nContenido original con **énfasis** y dos escenarios.', macro: '', confluence: '', entryPlan: '', scenarios: [] } });
    const html = renderToStaticMarkup(<AnalysisContent state="analysis" analysis={record} />);
    expect(html).toContain('Respuesta Gemini');
    expect(html).toContain('Contenido original con <strong>énfasis</strong>');
    expect(html).not.toContain('No calculable');
    expect(html).not.toContain('GoldPrice.dev');
  });

  it('shows the provider failure reason', () => {
    const record = analysisRecord({ status: 'failed', report: null });
    record.sources.errorMessage = '429 quota exceeded';
    expect(renderToStaticMarkup(<AnalysisContent state="analysis" analysis={record} />)).toContain('429 quota exceeded');
  });

  it('safely renders raw Gemini output without executing HTML', () => {
    const record = analysisRecord({ report: { rawText: '<script>alert(1)</script>', macro: '', confluence: '', entryPlan: '', scenarios: [] } });
    const html = renderToStaticMarkup(<AnalysisContent state="analysis" analysis={record} />);
    expect(html).not.toMatch(/<script(?:\s|>)/i);
    expect(html).toContain('&lt;script&gt;');
  });

  it('hides Google sources and suggestions but keeps the partial-output reason', () => {
    const record = analysisRecord({ report: {
      rawText: 'Respuesta original', macro: '', confluence: '', entryPlan: '', scenarios: [], finishReason: 'MAX_TOKENS',
      grounding: { citations: [{ title: 'Fed', url: 'https://www.federalreserve.gov/' }], searchSuggestionsHtml: '<script>alert(1)</script><div>Search</div>' },
    } });
    const html = renderToStaticMarkup(<AnalysisContent state="analysis" analysis={record} />);
    expect(html).not.toContain('https://www.federalreserve.gov/');
    expect(html).not.toContain('<iframe');
    expect(html).toContain('Motivo de finalización de Google: MAX_TOKENS');
    expect(html).not.toMatch(/<script(?:\s|>)/i);
  });

  it('shows scenario A and B images, and the reason when one failed', () => {
    const record = analysisRecord({
      report: { rawText: 'Informe', macro: '', confluence: '', entryPlan: '', scenarios: [] },
      images: [
        { scenario: 'A', status: 'ready', url: '/api/analysis/2026-11-17/images/A?v=1' },
        { scenario: 'B', status: 'failed', errorMessage: 'Cuota agotada' },
      ],
    });
    const html = renderToStaticMarkup(<AnalysisContent state="analysis" analysis={record} />);
    expect(html).toContain('Escenarios en el gráfico');
    expect(html).toContain('src="/api/analysis/2026-11-17/images/A?v=1"');
    expect(html).toContain('Cuota agotada');
    expect(renderToStaticMarkup(<AnalysisContent state="analysis" analysis={analysisRecord({ report: { rawText: 'x', macro: '', confluence: '', entryPlan: '', scenarios: [] } })} />))
      .not.toContain('Escenarios en el gráfico');
  });

  it('shows the actionable API error instead of replacing it with a generic message', () => {
    const html = renderToStaticMarkup(<AnalysisContent state="error" message="Falta preparar el historial. Ejecuta npm run db:migrate." />);
    expect(html).toContain('npm run db:migrate');
  });

  it('renders the report, verified sources, citations and calculated scenario table', () => {
    const html = renderToStaticMarkup(<AnalysisContent state="analysis" analysis={analysisRecord()} />);
    expect(html).toContain('ANÁLISIS MACRO Y ESTRUCTURA');
    expect(html).toContain('CONFLUENCIA TÉCNICA');
    expect(html).toContain('PLAN DE ENTRADA ÓPTIMA');
    expect(html).toContain('GoldPrice.dev');
    expect(html).toContain('$2,000.00');
    expect(html).toContain('17 de noviembre de 2026');
    expect(html).toContain('Precio usado para R:B: $2,001.00');
    expect(html).toContain('Cumple 1:2 desde TP2');
    expect(html).toContain('1:1.80');
    expect(html).toContain('$2,010.00');
    expect(html).toContain('https://www.federalreserve.gov/calendar.htm');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('renders untrusted Markdown as text instead of raw HTML', () => {
    const report = analysisRecord({
      report: {
        ...analysisRecord().report!,
        macro: '<script>alert(1)</script>\n\n![tracker](https://example.com/pixel.png)',
      },
    });
    const html = renderToStaticMarkup(<AnalysisContent state="analysis" analysis={report} />);
    expect(html).not.toMatch(/<script(?:\s|>)/i);
    expect(html).not.toMatch(/<img(?:\s|>)/i);
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders loading, empty, API error and insufficient-data states', () => {
    expect(renderToStaticMarkup(<AnalysisContent state="loading" />)).toContain('Cargando análisis');
    expect(renderToStaticMarkup(<AnalysisContent state="empty" />)).toContain('Aún no hay análisis');
    expect(renderToStaticMarkup(<AnalysisContent state="error" />)).toContain('No se pudo cargar el análisis');
    const insufficient = analysisRecord({ status: 'insufficient_data', report: null });
    expect(renderToStaticMarkup(<AnalysisContent state="analysis" analysis={insufficient} />))
      .toContain('Datos insuficientes');
  });

  it('warns when quote or candle data is stale', () => {
    const stale = analysisRecord({
      sources: {
        ...analysisRecord().sources,
        market: [
          { source: 'GoldPrice.dev', price: '2000.00', isStale: true },
          { source: 'GoldPrice.dev', displayName: 'Velas cerradas', isStale: true, informational: true },
        ],
      },
    });
    const html = renderToStaticMarkup(<AnalysisContent state="analysis" analysis={stale} />);
    expect(html).toContain('No hay niveles operativos actuales');
  });
});
