import { useEffect, useState } from 'react';
import { ArrowDown, Clock3, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import type { AnalysisRecord, AnalysisResponse } from '../types';
import { AnalysisContent } from './AnalysisContent';

const dateLabel = (value: string) => new Intl.DateTimeFormat('es-DO', {
  dateStyle: 'long',
  timeZone: 'America/Santo_Domingo',
}).format(new Date(`${value}T12:00:00Z`));

export function AnalysisPage({ canGenerate = false }: { canGenerate?: boolean }) {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moreError, setMoreError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api<AnalysisResponse>('/analysis?limit=10')
      .then(result => { if (active) setData(result); })
      .catch(error => { if (active) setError(error instanceof Error ? error.message : 'No se pudo cargar el historial.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retryKey]);

  // Ejecuta en el backend lo mismo que `npm run analysis:publish` (consume Gemini).
  async function generate() {
    if (!canGenerate || generating) return;
    setGenerating(true);
    setGenerateMessage(null);
    try {
      const { analysis } = await api<{ analysis: AnalysisRecord }>('/analysis/generate', { method: 'POST' });
      setGenerateMessage({ ok: true, text: `Análisis del ${dateLabel(analysis.analysisDate)} publicado.` });
      setRetryKey(key => key + 1);
    } catch (error) {
      setGenerateMessage({ ok: false, text: error instanceof Error ? error.message : 'No se pudo generar el análisis.' });
    } finally {
      setGenerating(false);
    }
  }

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
      <div className="an-hero-meta"><Clock3 size={16} /> Informe diario generado con Gemini.</div>
    </header>
    <div className="an-actions">
      <button className="button secondary" disabled={loading} onClick={() => setRetryKey(key => key + 1)}>Actualizar análisis</button>
      {canGenerate && <button className="button primary" disabled={generating} aria-busy={generating} onClick={() => void generate()}>
        <Sparkles size={16} /> {generating ? 'Generando análisis e imágenes…' : 'Generar análisis de hoy'}
      </button>}
    </div>
    {generateMessage && <div className={generateMessage.ok ? 'an-generate-ok' : 'an-error-banner'} role={generateMessage.ok ? 'status' : 'alert'}>{generateMessage.text}</div>}
    {loading && !data && <AnalysisContent state="loading" />}
    {error && !data && <AnalysisContent state="error" message={error} onRetry={() => setRetryKey(key => key + 1)} />}
    {error && data && <div className="an-error-banner" role="alert">
      {error} <button onClick={() => setRetryKey(key => key + 1)}>Reintentar</button>
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
