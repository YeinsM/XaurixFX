import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AnalysisRecord, AnalysisScenario } from '../types';

type Props =
  | { state: 'loading' }
  | { state: 'empty' }
  | { state: 'error'; onRetry?: () => void; message?: string }
  | { state: 'analysis'; analysis: AnalysisRecord };

const santoDomingo = 'America/Santo_Domingo';
const formatTimestamp = (value: string) => new Intl.DateTimeFormat('es-DO', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: santoDomingo,
}).format(new Date(value));

function formatAnalysisDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es-DO', { dateStyle: 'long', timeZone: santoDomingo }).format(date);
}

function price(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return 'No disponible';
  const number = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(number)
    ? `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)}`
    : 'No disponible';
}

function externalUrl(href?: string) {
  if (!href) return null;
  try {
    const url = new URL(href);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

function MarkdownBody({ children }: { children: string }) {
  return <div className="an-markdown">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children: linkChildren }) => {
          const hrefSafe = externalUrl(href);
          return hrefSafe
            ? <a href={hrefSafe} target="_blank" rel="noopener noreferrer">{linkChildren}</a>
            : <span>{linkChildren}</span>;
        },
        img: () => null,
        table: ({ children: tableChildren }) => <div className="an-table-scroll"><table>{tableChildren}</table></div>,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>;
}

function directionLabel(scenario: AnalysisScenario) {
  if (scenario.direction === 'buy') return 'Compra';
  if (scenario.direction === 'sell') return 'Venta';
  return 'Esperar';
}

function entryTypeLabel(value: string) {
  if (value === 'market_after_confirmation') return 'A mercado tras confirmación';
  if (value === 'pending_order') return 'Orden pendiente';
  if (value === 'wait') return 'Esperar señal';
  return value;
}

function entryRange(scenario: AnalysisScenario) {
  if (scenario.entryLow === null || scenario.entryHigh === null) return 'No propuesta';
  return `${price(scenario.entryLow)}–${price(scenario.entryHigh)}`;
}

function rewardRiskLabel(scenario: AnalysisScenario) {
  if (!scenario.metrics) return 'No calculable';
  return scenario.metrics.rewardRisk
    .map((ratio, index) => `TP${index + 1}: 1:${ratio.toFixed(2)}`)
    .join(' · ');
}

function minimumRewardRiskLabel(scenario: AnalysisScenario) {
  if (!scenario.metrics) return 'No calculable';
  const firstQualifyingTarget = scenario.metrics.belowMinimumRewardRisk.findIndex(belowMinimum => !belowMinimum);
  return firstQualifyingTarget === -1
    ? 'No cumple 1:2 hasta ningún objetivo'
    : `Cumple 1:2 desde TP${firstQualifyingTarget + 1}`;
}

function ScenarioCard({ scenario }: { scenario: AnalysisScenario }) {
  return <article className="an-scenario panel">
    <div className="an-scenario-title">
      <h3>Escenario {scenario.name}</h3>
      <span className={`an-direction ${scenario.direction}`}>{directionLabel(scenario)}</span>
    </div>
    <p className="an-scenario-rationale">{scenario.rationale}</p>
    <dl className="an-details">
      <div><dt>Contexto y condiciones</dt><dd>{scenario.context} {scenario.preconditions}</dd></div>
      <div><dt>Zona M15</dt><dd>{scenario.m15Zone}</dd></div>
      <div><dt>Confirmación M5</dt><dd>{scenario.m5Confirmation}</dd></div>
      <div><dt>Tipo de entrada</dt><dd>{entryTypeLabel(scenario.entryType)}</dd></div>
      <div><dt>Entrada</dt><dd>{entryRange(scenario)}</dd></div>
      <div><dt>Stop loss</dt><dd>{price(scenario.stopLoss)}</dd></div>
      <div><dt>TP1 / TP2 / TP3</dt><dd>{scenario.takeProfits.map(price).join(' / ')}</dd></div>
      <div><dt>Precio usado para R:B</dt><dd>{scenario.metrics ? price(scenario.metrics.entryReference) : 'No calculable'}</dd></div>
      <div><dt>Objetivo mínimo 1:2</dt><dd>{minimumRewardRiskLabel(scenario)}</dd></div>
      <div><dt>Riesgo desde entrada</dt><dd>{scenario.metrics ? price(scenario.metrics.risk) : 'No calculable'}</dd></div>
      <div><dt>Distancias a objetivos</dt><dd>{scenario.metrics ? scenario.metrics.rewardDistances.map(price).join(' / ') : 'No calculables'}</dd></div>
      <div><dt>Cancelación</dt><dd>{scenario.cancellation}</dd></div>
      <div><dt>Gestión</dt><dd>{scenario.management}</dd></div>
      <div><dt>Vigencia</dt><dd>{scenario.validity}</dd></div>
      <div><dt>Invalidación</dt><dd>{scenario.invalidation}</dd></div>
    </dl>
  </article>;
}

function ComparisonTable({ scenarios }: { scenarios: AnalysisScenario[] }) {
  return <div className="an-table-scroll">
    <table className="an-comparison">
      <thead><tr>
        <th>Escenario</th><th>Dirección</th><th>Zona de entrada</th><th>Confirmación M5</th>
        <th>Stop loss</th><th>TP1</th><th>TP2</th><th>TP3</th><th>R:B</th><th>Invalidación</th>
      </tr></thead>
      <tbody>{scenarios.map(scenario => <tr key={scenario.name}>
        <td>{scenario.name}</td>
        <td>{directionLabel(scenario)}</td>
        <td>{entryRange(scenario)}</td>
        <td>{scenario.m5Confirmation}</td>
        <td>{price(scenario.stopLoss)}</td>
        {scenario.takeProfits.map((target, index) => <td key={index}>{price(target)}</td>)}
        <td>{scenario.metrics
          ? <>Precio usado para R:B: {price(scenario.metrics.entryReference)}<br />{rewardRiskLabel(scenario)}</>
          : 'No calculable'}</td>
        <td>{scenario.invalidation}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}

function ScenarioImages({ analysis }: { analysis: AnalysisRecord }) {
  const images = analysis.images ?? [];
  if (!images.length) return null;
  return <section className="an-section panel an-visuals" aria-labelledby={`an-visuals-${analysis.analysisDate}`}>
    <span className="an-eyebrow">M15 · ENTRADA, SL Y TP</span>
    <h2 id={`an-visuals-${analysis.analysisDate}`}>Escenarios en el gráfico</h2>
    <div className="an-visual-grid">
      {(['A', 'B'] as const).map(name => {
        const image = images.find(item => item.scenario === name);
        if (!image) return null;
        return <figure key={name} className="an-visual">
          <figcaption><span className="an-visual-badge">{name}</span> Escenario {name}</figcaption>
          {image.status === 'ready' && image.url
            ? <a href={image.url} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar imagen del escenario ${name}`}>
              <img src={image.url} alt={`Gráfico ilustrativo del escenario ${name} con entrada, stop loss y objetivos`} loading="lazy" />
            </a>
            : <p className="an-visual-error" role="status">{image.errorMessage ?? 'Imagen no disponible.'}</p>}
        </figure>;
      })}
    </div>
    <p className="an-disclaimer">Imágenes generadas por IA a partir del texto del escenario; son ilustrativas. Los niveles válidos son los del informe.</p>
  </section>;
}

function AnalysisReport({ analysis }: { analysis: AnalysisRecord }) {
  if (analysis.status !== 'published' || !analysis.report) {
    return <section className="an-status panel" role="status">
      <h2>{analysis.status === 'insufficient_data' ? 'Datos insuficientes' : 'Análisis no disponible'}</h2>
      <p>{analysis.status === 'insufficient_data'
        ? 'No se publican niveles operativos porque las cotizaciones o velas verificables no permiten un análisis completo.'
        : (analysis.sources.errorMessage ?? 'No se pudo completar este análisis. Revisa la configuración de Gemini.')}</p>
    </section>;
  }

  // Muestra el texto recibido sin reinterpretar, dividir ni reemplazar el informe.
  if (analysis.report.rawText !== undefined) {
    return <article className="an-report">
      <section className="an-section panel">
        <span className="an-eyebrow">XAUUSD / {formatAnalysisDate(analysis.analysisDate)}</span>
        <h2>Análisis técnico</h2>
        <MarkdownBody>{analysis.report.rawText}</MarkdownBody>
        {analysis.report.finishReason && analysis.report.finishReason !== 'STOP' &&
          <p role="status">Motivo de finalización de Google: {analysis.report.finishReason}</p>}
        {/* Fuentes y sugerencias de Google Search se conservan en la base, pero no se muestran por decisión del usuario. */}
      </section>
      <ScenarioImages analysis={analysis} />
    </article>;
  }

  const marketStale = analysis.sources.market.some(source => source.isStale === true);
  return <article className="an-report">
    <section className="an-section panel" aria-labelledby={`an-macro-${analysis.analysisDate}`}>
      <span className="an-eyebrow">01 / H4 Y H1</span>
      <h2 id={`an-macro-${analysis.analysisDate}`}>ANÁLISIS MACRO Y ESTRUCTURA</h2>
      <div className="an-source-panel" aria-labelledby={`an-sources-${analysis.analysisDate}`}>
        <div className="an-source-heading">
          <div><span className="an-eyebrow">FUENTE Y REFERENCIA</span><h3 id={`an-sources-${analysis.analysisDate}`}>Datos del análisis</h3></div>
          <time dateTime={analysis.analysisDate}>{formatAnalysisDate(analysis.analysisDate)}</time>
        </div>
        <dl className="an-source-details">
          <div><dt>Precio de referencia</dt><dd>{price(analysis.referencePrice)}</dd></div>
          <div><dt>Hora de referencia</dt><dd>{analysis.referenceAt ? `${formatTimestamp(analysis.referenceAt)} (UTC−4)` : 'No verificada'}</dd></div>
          <div><dt>Fuente de mercado</dt><dd>{analysis.marketSource ?? 'No verificada'}</dd></div>
          <div><dt>Generado</dt><dd>{analysis.generatedAt ? `${formatTimestamp(analysis.generatedAt)} (UTC−4)` : 'No disponible'}</dd></div>
        </dl>
        <ul className="an-market-sources">
          {analysis.sources.market.map((source, index) => <li key={`${source.source}-${source.displayName ?? ''}-${index}`}>
            <strong>{source.displayName ?? source.source}</strong>
            {source.price && <span>{price(source.price)}{source.unit ? ` ${source.unit}` : ''}</span>}
            {source.isStale && <span className="an-stale-label">Dato histórico</span>}
          </li>)}
        </ul>
        <div className="an-calendar">
          <strong>Calendario económico · {analysis.sources.calendar.status === 'verified' ? 'consultado' : 'no disponible'}</strong>
          <p>{analysis.sources.calendar.summary}</p>
          {analysis.sources.calendar.citations.length > 0 && <ul>
            {analysis.sources.calendar.citations.map(citation => {
              const href = externalUrl(citation.url);
              return <li key={citation.url}>{href
                ? <a href={href} target="_blank" rel="noopener noreferrer">{citation.title}</a>
                : citation.title}</li>;
            })}
          </ul>}
        </div>
        {marketStale && <div className="an-warning" role="status">
          Los datos de mercado disponibles son históricos. No hay niveles operativos actuales; se requiere una nueva cotización y velas recientes.
        </div>}
      </div>
      <MarkdownBody>{analysis.report.macro}</MarkdownBody>
    </section>
    <section className="an-section panel" aria-labelledby={`an-confluence-${analysis.analysisDate}`}>
      <span className="an-eyebrow">02 / CONFLUENCIAS</span>
      <h2 id={`an-confluence-${analysis.analysisDate}`}>CONFLUENCIA TÉCNICA</h2>
      <MarkdownBody>{analysis.report.confluence}</MarkdownBody>
    </section>
    <section className="an-section panel" aria-labelledby={`an-entry-${analysis.analysisDate}`}>
      <span className="an-eyebrow">03 / M15 Y M5</span>
      <h2 id={`an-entry-${analysis.analysisDate}`}>PLAN DE ENTRADA ÓPTIMA</h2>
      <MarkdownBody>{analysis.report.entryPlan}</MarkdownBody>
      <div className="an-scenarios">{analysis.report.scenarios.map(scenario =>
        <ScenarioCard key={scenario.name} scenario={scenario} />)}</div>
      <h3 className="an-comparison-heading">Comparación de escenarios</h3>
      <ComparisonTable scenarios={analysis.report.scenarios} />
      <p className="an-disclaimer">Análisis informativo y condicional; no constituye una recomendación ni garantiza resultados. Verifica los datos y las condiciones del bróker antes de operar.</p>
    </section>
  </article>;
}

export function AnalysisContent(props: Props) {
  if (props.state === 'loading') return <div className="an-status panel" role="status">Cargando análisis…</div>;
  if (props.state === 'empty') return <div className="an-status panel"><h2>Aún no hay análisis</h2><p>El informe diario aparecerá aquí cuando esté disponible.</p></div>;
  if (props.state === 'error') return <div className="an-status panel" role="alert">
    <h2>No se pudo cargar el análisis</h2>
    <p>{props.message ?? 'Inténtalo de nuevo más tarde.'}</p>
    {props.onRetry && <button className="button secondary" onClick={props.onRetry}>Reintentar</button>}
  </div>;
  return <AnalysisReport analysis={props.analysis} />;
}
