import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock3, ExternalLink, Newspaper } from 'lucide-react';
import { api } from '../lib/api';
import { newsFeed, tickerTape } from '../lib/tvWidgets';
import { TradingViewWidget } from './TradingViewWidget';

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  titleEs?: string;
  excerptEs?: string;
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
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  useEffect(() => {
    let active = true;
    const load = () => api<NewsResponse>('/news').then(result => { if (active) { setData(result); setError(false); } }).catch(() => { if (active) setError(true); });
    void load();
    const timer = setInterval(() => { void load(); }, 15 * 60_000);
    return () => { active = false; clearInterval(timer); };
  }, [retryKey]);

  const filtered = (data?.items ?? []).filter(item => filter === 'Todas' || item.source === filter);
  const items = filtered;
  const titleFor = (item: NewsItem) => language === 'es' ? item.titleEs || item.title : item.title;
  const excerptFor = (item: NewsItem) => language === 'es' ? item.excerptEs || item.excerpt : item.excerpt;
  const showArticle = (item: NewsItem) => { setSelected(item); window.scrollTo({ top: 0, behavior: 'instant' }); };

  return <>
    <div className="mk-tape"><TradingViewWidget widget={tickerTape} title="Cinta de precios" eager /></div>
    <main id="main-content" tabIndex={-1} className="nw-page">
      {selected ? <article className="nw-article">
        <button className="nw-back" onClick={() => setSelected(null)}><ArrowLeft size={17} /> Volver a noticias</button>
        <div className="nw-eyebrow">{selected.category} <span>·</span> {selected.source}</div>
        <h1>{titleFor(selected)}</h1>
        <div className="nw-byline"><Newspaper size={15} /> Fuente: {selected.source} <span>·</span> {dateLabel(selected.publishedAt)}</div>
        {excerptFor(selected) && <div className="nw-article-lead">{excerptFor(selected)}</div>}
        <div className="nw-article-body">
          <h2>Consulta el comunicado original</h2>
          <p>Este extracto procede de {selected.source}. El texto completo, sus cifras y posibles actualizaciones están en la publicación original.</p>
          <a className="button primary" href={selected.url} target="_blank" rel="noopener noreferrer">Leer en la fuente <ExternalLink size={16} /></a>
          <p className="nw-footnote">Publicado por la fuente el {dateLabel(selected.publishedAt)}. {selected.titleEs ? 'Traducción automática; consulta el original para verificar términos y cifras.' : ''} No constituye asesoría de inversión.</p>
        </div>
      </article> : <>
        <header className="nw-hero">
          <div className="nw-eyebrow">XAURIX FX <span>·</span> ACTUALIDAD FINANCIERA</div>
          <h1>El mercado, <em>en contexto.</em></h1>
          <p>Noticias de fuentes oficiales y un flujo continuo de actualidad de los mercados. Mira qué pasó, cuándo se publicó y dónde comprobarlo.</p>
          <div className="nw-hero-meta"><Clock3 size={16} /> Fuentes oficiales actualizadas cada 15 minutos <span>·</span> Traducción automática al español</div>
        </header>
        <section className="nw-section" aria-labelledby="nw-official">
          <div className="nw-section-head"><div><span className="nw-eyebrow">01 / FUENTES PRIMARIAS</span><h2 id="nw-official">Comunicados que mueven la conversación</h2></div><span className="nw-count">Fed + BCE</span></div>
          <div className="nw-filters" aria-label="Filtrar noticias por fuente">{['Todas', 'Reserva Federal', 'Banco Central Europeo'].map(name => <button key={name} className={filter === name ? 'active' : ''} aria-pressed={filter === name} onClick={() => { setFilter(name); setVisibleCount(9); }}>{name}</button>)}</div>
          <div className="nw-filters" aria-label="Idioma de noticias"><button className={language === 'es' ? 'active' : ''} aria-pressed={language === 'es'} onClick={() => setLanguage('es')}>Español</button><button className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>Original</button></div>
          {!data && !error && <div className="nw-message" role="status">Cargando noticias oficiales…</div>}
          {error && !data && <div className="nw-message" role="status">No se pudieron actualizar los comunicados. El flujo de mercado más abajo sigue disponible. <button onClick={() => setRetryKey(key => key + 1)}>Reintentar</button></div>}
          {data && <>
            {error && <p className="nw-stale">Mostrando la última actualización disponible.</p>}
            <div className="nw-list">{items.slice(0, visibleCount).map((item, index) => <article className={index === 0 ? 'nw-card nw-card-lead' : 'nw-card'} key={item.id}>
              <div className="nw-card-meta"><span>{item.category}</span><span>{item.source} · {dateLabel(item.publishedAt)}</span></div>
              <h3><button onClick={() => showArticle(item)}>{titleFor(item)}</button></h3>
              {excerptFor(item) && excerptFor(item) !== titleFor(item) && <p>{excerptFor(item)}</p>}
              <button className="nw-read" onClick={() => showArticle(item)}>Ver noticia <ArrowRight size={17} /></button>
            </article>)}</div>
            {items.length > visibleCount && <button className="nw-more" onClick={() => setVisibleCount(count => count + 9)}>Ver más comunicados <ArrowRight size={16} /></button>}
            {!items.length && <div className="nw-message">No hay comunicados en esta selección por ahora.</div>}
            {language === 'es' && items.some(item => !item.titleEs) && <p className="nw-updated">Algunas traducciones no están disponibles todavía; esos titulares se muestran en su idioma original.</p>}
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
