import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock3, ExternalLink, Newspaper } from 'lucide-react';
import { api } from '../lib/api';
import { newsFeed, tickerTape } from '../lib/tvWidgets';
import { TradingViewWidget } from './TradingViewWidget';

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  source: 'Reserva Federal' | 'Banco Central Europeo';
  category: string;
  publishedAt: string;
  url: string;
};
type NewsResponse = { items: NewsItem[]; updatedAt: string };
const dateLabel = (date: string) => new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Santo_Domingo' }).format(new Date(date));

export function NewsPage() {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [filter, setFilter] = useState('Todas');
  const [visibleCount, setVisibleCount] = useState(9);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () => api<NewsResponse>('/news').then(result => { if (active) { setData(result); setError(false); } }).catch(() => { if (active) setError(true); });
    void load();
    const timer = setInterval(() => { void load(); }, 15 * 60_000);
    return () => { active = false; clearInterval(timer); };
  }, [retryKey]);

  const items = (data?.items ?? []).filter(item => filter === 'Todas' || item.source === filter);
  const showArticle = (item: NewsItem) => { setSelected(item); window.scrollTo({ top: 0, behavior: 'instant' }); };

  return <>
    <div className="mk-tape"><TradingViewWidget widget={tickerTape} title="Cinta de precios" eager /></div>
    <main id="main-content" tabIndex={-1} className="nw-page">
      {selected ? <article className="nw-article">
        <button className="nw-back" onClick={() => setSelected(null)}><ArrowLeft size={17} /> Volver a noticias</button>
        <div className="nw-eyebrow">{selected.category} <span>·</span> {selected.source}</div>
        <h1>{selected.title}</h1>
        <div className="nw-byline"><Newspaper size={15} /> Fuente: {selected.source} <span>·</span> {dateLabel(selected.publishedAt)}</div>
        <div className="nw-article-lead">{selected.excerpt || 'La fuente publicó una actualización sobre este tema. Consulta el comunicado original para conocer todos los detalles.'}</div>
        <div className="nw-article-body">
          <h2>Consulta el comunicado original</h2>
          <p>Este titular y su breve descripción proceden del canal oficial de {selected.source}. El contenido completo, sus cifras y posibles actualizaciones están en la publicación original.</p>
          <a className="button primary" href={selected.url} target="_blank" rel="noopener noreferrer">Leer en la fuente <ExternalLink size={16} /></a>
          <p className="nw-footnote">Publicado por la fuente el {dateLabel(selected.publishedAt)}. Xaurix FX enlaza al contenido y no presenta este aviso como análisis propio ni como asesoría de inversión.</p>
        </div>
      </article> : <>
        <header className="nw-hero">
          <div className="nw-eyebrow">XAURIX FX <span>·</span> ACTUALIDAD FINANCIERA</div>
          <h1>El mercado, <em>en contexto.</em></h1>
          <p>Noticias de fuentes oficiales y un flujo continuo de actualidad de los mercados. Mira qué pasó, cuándo se publicó y dónde comprobarlo.</p>
          <div className="nw-hero-meta"><Clock3 size={16} /> Fuentes oficiales actualizadas cada 15 minutos <span>·</span> Titulares en el idioma de origen</div>
        </header>
        <section className="nw-section" aria-labelledby="nw-official">
          <div className="nw-section-head"><div><span className="nw-eyebrow">01 / FUENTES PRIMARIAS</span><h2 id="nw-official">Comunicados que mueven la conversación</h2></div><span className="nw-count">Fed + BCE</span></div>
          <div className="nw-filters" aria-label="Filtrar noticias por fuente">{['Todas', 'Reserva Federal', 'Banco Central Europeo'].map(name => <button key={name} className={filter === name ? 'active' : ''} aria-pressed={filter === name} onClick={() => { setFilter(name); setVisibleCount(9); }}>{name}</button>)}</div>
          {!data && !error && <div className="nw-message" role="status">Cargando noticias oficiales…</div>}
          {error && !data && <div className="nw-message" role="status">No se pudieron actualizar los comunicados. El flujo de mercado más abajo sigue disponible. <button onClick={() => setRetryKey(key => key + 1)}>Reintentar</button></div>}
          {data && <>
            {error && <p className="nw-stale">Mostrando la última actualización disponible.</p>}
            <div className="nw-list">{items.slice(0, visibleCount).map((item, index) => <article className={index === 0 ? 'nw-card nw-card-lead' : 'nw-card'} key={item.id}>
              <div className="nw-card-meta"><span>{item.category}</span><span>{item.source} · {dateLabel(item.publishedAt)}</span></div>
              <h3><button onClick={() => showArticle(item)}>{item.title}</button></h3>
              {item.excerpt && item.excerpt !== item.title && <p>{item.excerpt}</p>}
              <button className="nw-read" onClick={() => showArticle(item)}>Ver noticia <ArrowRight size={17} /></button>
            </article>)}</div>
            {items.length > visibleCount && <button className="nw-more" onClick={() => setVisibleCount(count => count + 9)}>Ver más comunicados <ArrowRight size={16} /></button>}
            {!items.length && <div className="nw-message">No hay comunicados en esta selección por ahora.</div>}
            <p className="nw-updated">Última consulta: {dateLabel(data.updatedAt)} · Los comunicados se abren en su fuente original.</p>
          </>}
        </section>
        <section className="nw-section nw-live" aria-labelledby="nw-live">
          <div className="nw-section-head"><div><span className="nw-eyebrow">02 / EN TIEMPO REAL</span><h2 id="nw-live">Más titulares del mercado</h2></div><span className="nw-count">TradingView</span></div>
          <p className="nw-live-intro">El siguiente flujo se actualiza directamente desde TradingView y puede incluir noticias de otros proveedores. Abre cada titular para leerlo en su publicación original.</p>
          <TradingViewWidget widget={newsFeed} title="Noticias de los mercados" eager />
        </section>
        <p className="nw-disclaimer">Xaurix FX no verifica de forma independiente los artículos de terceros. Las noticias son informativas y no constituyen recomendaciones de inversión.</p>
      </>}
    </main>
  </>;
}
