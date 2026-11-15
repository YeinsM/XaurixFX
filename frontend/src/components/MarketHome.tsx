import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Star } from 'lucide-react';
import { api } from '../lib/api';
import {
  categoryLabels, categoryOrder, formatChange, formatPrice, groupByCategory, loadWatchlist, minutesAgo,
  newestFetch, saveWatchlist, toggleWatch, type MarketAsset, type MarketCategory,
} from '../lib/market';
import type { User } from '../types';
import { economicCalendar, marketOverview, newsFeed, screenerGainers, stockHeatmap, tickerTape } from '../lib/tvWidgets';
import { TradingViewWidget } from './TradingViewWidget';

const REFRESH_MS = 5 * 60_000; // reads our cached snapshots, so it costs no provider calls

type Props = { user: User | null; onLogin: () => void; onOpenSpace: () => void };

function Change({ value }: { value: number | null }) {
  const { text, tone } = formatChange(value);
  return <span className={`mk-change ${tone}`}>{text}</span>;
}

function WatchCard({ asset }: { asset: MarketAsset }) {
  return (
    <div className="mk-card">
      <span className="mk-card-name">{asset.name}</span>
      <strong>{formatPrice(asset.price, asset.category)}</strong>
      <Change value={asset.changePercent} />
    </div>
  );
}

function AssetTable({ assets, watch, onToggle }: { assets: MarketAsset[]; watch: string[]; onToggle: (symbol: string) => void }) {
  if (!assets.length) return <p className="muted">No hay activos en esta categoría.</p>;
  return (
    <table className="mk-table">
      <thead><tr><th scope="col"><span className="sr-only">Seguir</span></th><th scope="col">Activo</th><th scope="col" className="num">Último</th><th scope="col" className="num">Var. %</th></tr></thead>
      <tbody>
        {assets.map(asset => {
          const watched = watch.includes(asset.symbol);
          return (
            <tr key={asset.symbol}>
              <td><button className="icon-button mk-star" aria-pressed={watched} aria-label={`${watched ? 'Dejar de seguir' : 'Seguir'} ${asset.name}`} onClick={() => onToggle(asset.symbol)}><Star size={16} fill={watched ? 'currentColor' : 'none'} /></button></td>
              <td><strong>{asset.name}</strong> <small className="muted">{asset.symbol}</small></td>
              <td className="num">{formatPrice(asset.price, asset.category)}</td>
              <td className="num"><Change value={asset.changePercent} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function MarketHome({ user, onLogin, onOpenSpace }: Props) {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<MarketCategory>('index');
  const [watch, setWatch] = useState<string[] | null>(loadWatchlist);

  const load = useCallback(async () => {
    try {
      setAssets((await api<{ assets: MarketAsset[] }>('/market')).assets);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los mercados.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const groups = useMemo(() => groupByCategory(assets), [assets]);
  const tabs = categoryOrder.filter(category => groups[category].length);
  const activeTab = tabs.includes(tab) ? tab : tabs[0];
  // Until the visitor picks assets, the list shows everything that has data.
  const effectiveWatch = watch ?? assets.map(asset => asset.symbol);
  const watched = assets.filter(asset => effectiveWatch.includes(asset.symbol) && asset.price !== null);
  const newest = newestFetch(assets);

  function toggle(symbol: string) {
    const next = toggleWatch(effectiveWatch, symbol);
    setWatch(next);
    saveWatchlist(next);
  }

  return (
    <div className="mk-page">
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <header className="mk-header">
        <a className="brand" href="#home" aria-label="Xaurix FX, inicio"><span className="brand-mark">X</span><span>XAURIX <small>FX</small></span></a>
        <nav aria-label="Principal"><a href="#mercados">Mercados</a><a href="#noticias">Noticias</a></nav>
        <div className="mk-actions">
          {user && <button className="button secondary" onClick={onOpenSpace}>Mi espacio</button>}
          {!user && <button className="button primary" onClick={onLogin}>Iniciar sesión</button>}
        </div>
      </header>

      <div className="mk-tape"><TradingViewWidget widget={tickerTape(effectiveWatch)} title="Cinta de precios" eager /></div>

      <main id="main-content" tabIndex={-1} className="mk-main">
        <section className="mk-hero">
          <div className="eyebrow">MERCADOS DEL MUNDO</div>
          <h1>Entiende los mercados. Aprende con criterio.</h1>
          <p>Cotizaciones, noticias y cursos de XaurixFX en un solo lugar. Sigue los activos que te importan.</p>
        </section>

        <section id="mercados" aria-labelledby="mk-title">
          <div className="section-heading"><h2 id="mk-title">Mercados financieros del mundo</h2>
            <span className="muted mk-updated">{newest ? `Actualizado hace ${minutesAgo(newest)} min · datos con retraso` : ''}</span>
          </div>
          {loading ? <p className="muted" role="status">Cargando mercados…</p>
            : error && !assets.length ? <div className="inline-error" role="alert">{error}<button className="text-button" onClick={() => void load()}><RefreshCw size={14} /> Reintentar</button></div>
              : !newest ? <p className="muted">Los datos de mercado aún no se han cargado. Vuelve en unos minutos.</p> : <>
                {error && <p className="muted" role="status">No se pudo actualizar; mostrando los últimos datos guardados.</p>}
                <div className="mk-watch" aria-label="Mi lista">{watched.length ? watched.map(asset => <WatchCard key={asset.symbol} asset={asset} />) : <p className="muted">Marca activos con la estrella para verlos aquí.</p>}</div>
                <div className="mk-tabs" role="tablist" aria-label="Categorías">
                  {tabs.map(category => <button key={category} role="tab" aria-selected={category === activeTab} className={category === activeTab ? 'active' : ''} onClick={() => setTab(category)}>{categoryLabels[category]}</button>)}
                </div>
                <div className="panel mk-panel" role="tabpanel">{activeTab && <AssetTable assets={groups[activeTab]} watch={effectiveWatch} onToggle={toggle} />}</div>
              </>}
        </section>

        <section aria-labelledby="mk-global" className="mk-block">
          <div className="section-heading"><h2 id="mk-global">Panorama global</h2></div>
          <div className="mk-grid2">
            <TradingViewWidget widget={marketOverview} title="Panorama de mercados" />
            <TradingViewWidget widget={economicCalendar} title="Calendario económico" />
          </div>
        </section>

        <section id="noticias" aria-labelledby="mk-news" className="mk-block">
          <div className="section-heading"><h2 id="mk-news">Noticias y movimientos</h2></div>
          <div className="mk-grid2">
            <TradingViewWidget widget={newsFeed} title="Noticias de los mercados" />
            <TradingViewWidget widget={screenerGainers} title="Mayores ganadores" />
          </div>
          <p className="muted mk-note">Las noticias y la selección editorial propias de Xaurix FX llegarán pronto, con filtro por los activos que sigues.</p>
        </section>

        <section aria-labelledby="mk-heat" className="mk-block">
          <div className="section-heading"><h2 id="mk-heat">Mapa de calor del S&amp;P 500</h2></div>
          <TradingViewWidget widget={stockHeatmap} title="Mapa de calor de acciones" />
        </section>
      </main>

      <footer className="mk-footer">
        <span>© {new Date().getFullYear()} Xaurix FX</span>
        <span>Cotizaciones con retraso, solo informativas; no constituyen recomendación de inversión.</span>
        <span>Datos: <a href="https://www.coingecko.com/en/api" target="_blank" rel="noreferrer">CoinGecko</a>, EODHD y Massive. Widgets: <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">TradingView</a>.</span>
      </footer>
    </div>
  );
}
