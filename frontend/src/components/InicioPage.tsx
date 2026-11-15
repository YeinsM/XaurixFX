import { ChartCandlestick, Download, Gift, Newspaper } from 'lucide-react';
import type { Page } from '../types';
import { BrokerCta } from './BrokerPage';
import { CandleBackground } from './CandleBackground';
import { EthLogo, TetherLogo } from './InicioArt';
import { ModuleWindows } from './ModuleWindows';
import { TerminalHero } from './TerminalHero';

const facts = [
  { icon: <ChartCandlestick size={48} strokeWidth={1.3} />, big: '4', label: 'Mercados: índices, materias primas, divisas y cripto' },
  { icon: <Newspaper size={48} strokeWidth={1.3} />, big: 'ES', label: 'Noticias oficiales resumidas en español' },
  { icon: <Gift size={48} strokeWidth={1.3} />, big: '$0', label: 'Costo de explorar los mercados' },
  { icon: <EthLogo size={50} />, big: 'ERC-20', label: 'Red Ethereum: pago de los cursos en USDT' },
];

const steps = [
  { n: '01', title: 'Crea tu cuenta', text: 'Regístrate gratis en XaurixFX para guardar tus cursos y tu perfil.' },
  { n: '02', title: 'Explora los mercados', text: 'Revisa cotizaciones, calendario económico, mapa de calor y gráficos.' },
  { n: '03', title: 'Aprende en la academia', text: 'Empieza por el contenido gratuito y suma cursos cuando quieras.' },
  { n: '04', title: 'Practica con una demo', text: 'Con un bróker aliado puedes abrir una cuenta demo antes de decidir.' },
];

const academyPoints = [
  { icon: <Gift size={26} strokeWidth={1.5} />, title: 'Contenido gratuito', text: 'Algunos cursos se marcan como gratis: entras y aprendes sin pagar.' },
  { icon: <span className="tm-pay-mini"><TetherLogo size={28} /><EthLogo size={28} /></span>, title: 'Pago en USDT', text: 'Los cursos de pago se abonan en USDT por la red Ethereum (ERC-20).' },
  { icon: <Download size={26} strokeWidth={1.5} />, title: 'Descarga permanente', text: 'Lo que compras queda en tu cuenta y puedes descargarlo cuando quieras.' },
];

/** Landing «Inicio»: información de XaurixFX. */
export function InicioPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const go = (page: Page) => (e: React.MouseEvent) => { e.preventDefault(); onNavigate(page); };
  return (
    <>
      <CandleBackground />
      <main id="main-content" tabIndex={-1} className="mk-main tm-above">
        <TerminalHero onNavigate={onNavigate} />

        <section aria-label="XaurixFX en cifras" className="mk-block tm-facts">
          {facts.map(f => <div key={f.big}><div className="tm-frow"><strong>{f.big}</strong><span className="tm-ficon">{f.icon}</span></div><span>{f.label}</span></div>)}
        </section>

        <ModuleWindows onNavigate={onNavigate} />

        <section aria-labelledby="tm-academy" className="mk-block tm-split">
          <div>
            <div className="tm-prompt">academia/</div>
            <h2 id="tm-academy">Cursos que puedes <span className="tm-accent">conservar</span>.</h2>
            <p className="tm-lead">Nuestra academia crece con el tiempo: los cursos se actualizan, se amplían y se vuelven a publicar. Tú decides cuáles comprar y cuáles seguir gratis.</p>
            <a className="tm-btn" href="#academy" onClick={go('academy')}>./ver_academia</a>
          </div>
          <ul className="tm-points">{academyPoints.map(p => <li key={p.title}><span className="tm-picon">{p.icon}</span><div><b>{p.title}</b><span>{p.text}</span></div></li>)}</ul>
        </section>

        <section aria-labelledby="tm-steps" className="mk-block">
          <div className="section-heading"><h2 id="tm-steps"><span className="tm-accent">&gt;</span> cómo_empezar</h2></div>
          <ol className="tm-steps">{steps.map(s => <li key={s.n}><span>{s.n}</span><h3>{s.title}</h3><p>{s.text}</p></li>)}</ol>
        </section>

        <section aria-labelledby="tm-broker" className="mk-block">
          <div className="panel bk-banner">
            <div><div className="eyebrow">BROKER ALIADO</div><h2 id="tm-broker">¿Listo para practicar lo que aprendes?</h2><p className="muted">Abre una cuenta demo o real con PU Prime desde nuestro enlace. Los CFD conllevan un alto riesgo de pérdida.</p></div>
            <BrokerCta />
          </div>
          <p className="tm-note">Enlace de afiliado: XaurixFX podría recibir una comisión si te registras. Los CFD son productos complejos con alto riesgo de pérdida. El contenido es informativo y no constituye asesoría de inversión. La disponibilidad depende de tu país.</p>
        </section>
      </main>
    </>
  );
}
