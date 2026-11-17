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
