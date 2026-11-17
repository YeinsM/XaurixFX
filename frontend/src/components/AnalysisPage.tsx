import { useEffect, useState } from 'react';
import { ArrowDown, Clock3 } from 'lucide-react';
import { api } from '../lib/api';
import type { AnalysisResponse } from '../types';
import { AnalysisContent } from './AnalysisContent';

const dateLabel = (value: string) => new Intl.DateTimeFormat('es-DO', {
  dateStyle: 'long',
  timeZone: 'America/Santo_Domingo',
}).format(new Date(`${value}T12:00:00Z`));

export function AnalysisPage() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    api<AnalysisResponse>('/analysis?limit=10')
      .then(result => { if (active) setData(result); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retryKey]);

  async function loadMore() {
    if (!data?.nextBefore || loadingMore) return;
    setLoadingMore(true);
    setMoreError(false);
    try {
      const page = await api<AnalysisResponse>(`/analysis?limit=10&before=${encodeURIComponent(data.nextBefore)}`);
      setData(current => {
        if (!current) return page;
        const byDate = new Map(current.analyses.map(analysis => [analysis.analysisDate, analysis]));
        page.analyses.forEach(analysis => byDate.set(analysis.analysisDate, analysis));
        return { analyses: [...byDate.values()].sort((a, b) => b.analysisDate.localeCompare(a.analysisDate)), nextBefore: page.nextBefore };
      });
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  return <main id="main-content" tabIndex={-1} className="mk-main an-page">
    <header className="an-hero">
      <span className="an-eyebrow">XAURIX FX · XAUUSD</span>
      <h1>Análisis técnico, <em>con contexto.</em></h1>
      <p>Informes multitemporales de H4, H1, M15 y M5, basados en datos verificables. El análisis diario se programa para las 08:00, hora de República Dominicana (UTC−4).</p>
      <div className="an-hero-meta"><Clock3 size={16} /> Se publican solo cuando los datos disponibles permiten una lectura verificable.</div>
    </header>
    {loading && !data && <AnalysisContent state="loading" />}
    {error && !data && <AnalysisContent state="error" onRetry={() => setRetryKey(key => key + 1)} />}
    {error && data && <div className="an-error-banner" role="alert">
      No se pudo actualizar el historial. <button onClick={() => setRetryKey(key => key + 1)}>Reintentar</button>
    </div>}
    {data && !data.analyses.length && <AnalysisContent state="empty" />}
    {data?.analyses.map(analysis => <section className="an-history" key={analysis.analysisDate}>
      <div className="an-history-heading">
        <h2>{dateLabel(analysis.analysisDate)}</h2>
        <span>{analysis.status === 'published' ? 'Informe publicado' : analysis.status === 'insufficient_data' ? 'Datos insuficientes' : 'No disponible'}</span>
      </div>
      <AnalysisContent state="analysis" analysis={analysis} />
    </section>)}
    {moreError && <div className="an-error-banner" role="alert">
      No se pudo cargar el resto del historial. <button onClick={() => void loadMore()}>Reintentar</button>
    </div>}
    {data?.nextBefore && <button className="an-more button secondary" disabled={loadingMore} onClick={() => void loadMore()}>
      {loadingMore ? 'Cargando…' : 'Ver análisis anteriores'} <ArrowDown size={16} />
    </button>}
  </main>;
}
