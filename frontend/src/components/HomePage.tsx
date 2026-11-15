import { advancedChart, economicCalendar, marketOverview, newsFeed, screenerGainers, stockHeatmap, tickerTape } from '../lib/tvWidgets';
import { BrokerCta } from './BrokerPage';
import { TradingViewWidget } from './TradingViewWidget';

/** Página «Mercados». */
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
        <section aria-labelledby="mk-heat" className="mk-block">
          <div className="section-heading"><h2 id="mk-heat">Mapa de calor del S&amp;P 500</h2></div>
          <TradingViewWidget widget={stockHeatmap} title="Mapa de calor de acciones" />
        </section>
        <section id="noticias" aria-labelledby="mk-news" className="mk-block">
          <div className="section-heading"><h2 id="mk-news">Noticias y movimientos</h2></div>
          <div className="mk-grid2">
            <TradingViewWidget widget={newsFeed} title="Noticias de los mercados" />
            <TradingViewWidget widget={screenerGainers} title="Mayores ganadores" />
          </div>
        </section>
          <br />
        <section aria-labelledby="mk-chart" className="mk-block mk-first">
          <div className="section-heading"><h2 id="mk-chart">Gráfico interactivo</h2><span className="muted mk-updated">Cambia el activo, el intervalo y los indicadores desde el propio gráfico</span></div>
          <TradingViewWidget widget={advancedChart} title="Gráfico interactivo" />
        </section>
        <section aria-labelledby="mk-broker" className="mk-block">
          <div className="panel bk-banner">
            <div><div className="eyebrow">BROKER</div><h2 id="mk-broker">¿Listo para practicar lo que aprendes?</h2><p className="muted">Abre una cuenta demo o real con PU Prime desde nuestro enlace. Los CFD conllevan un alto riesgo de pérdida.</p></div>
            <BrokerCta />
          </div>
        </section>
      </main>
    </>
  );
}
