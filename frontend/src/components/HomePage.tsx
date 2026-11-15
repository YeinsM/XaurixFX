import { economicCalendar, marketOverview, newsFeed, screenerGainers, stockHeatmap, tickerTape } from '../lib/tvWidgets';
import { TradingViewWidget } from './TradingViewWidget';

export function HomePage() {
  return (
    <>
      <div className="mk-tape"><TradingViewWidget widget={tickerTape} title="Cinta de precios" eager /></div>
      <main id="main-content" tabIndex={-1} className="mk-main">
        <section className="mk-hero">
          <div className="eyebrow">MERCADOS DEL MUNDO</div>
          <h1>Entiende los mercados. Aprende con criterio.</h1>
          <p>Cotizaciones, noticias y cursos de XaurixFX en un solo lugar.</p>
        </section>
        <section aria-labelledby="mk-global" className="mk-block">
          <div className="section-heading"><h2 id="mk-global">Mercados financieros del mundo</h2></div>
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
          <p className="muted mk-note">Las noticias y la selección editorial propias de Xaurix FX llegarán pronto.</p>
        </section>
        <section aria-labelledby="mk-heat" className="mk-block">
          <div className="section-heading"><h2 id="mk-heat">Mapa de calor del S&amp;P 500</h2></div>
          <TradingViewWidget widget={stockHeatmap} title="Mapa de calor de acciones" />
        </section>
      </main>
    </>
  );
}
