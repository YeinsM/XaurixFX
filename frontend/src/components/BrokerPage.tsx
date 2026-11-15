import { ArrowRight, ArrowUpRight, Award, BadgeCheck, ChartCandlestick, ExternalLink, GraduationCap, ShieldCheck, Smartphone, Sparkles, Trophy, Users } from 'lucide-react';
import { referralUrl } from '../lib/broker';

const sources = {
  sponsorship: 'https://www.puprime.com/sponsorship/',
  awards: 'https://www.puprime.com/awards/',
  regulation: 'https://www.puprime.com/regulation/',
  promotions: 'https://www.puprime.com/promotions/',
};
const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

const benefits = [
  { icon: Smartphone, number: '01', title: 'Opera a tu manera', text: 'Explora la app de PU Prime, su plataforma web y MetaTrader 4 y 5. Escoge el entorno que mejor se adapte a ti.' },
  { icon: ChartCandlestick, number: '02', title: 'Explora distintos mercados', text: 'Divisas, metales, índices, materias primas, acciones y ETF, entre otros productos disponibles según tu región.' },
  { icon: Users, number: '03', title: 'Aprende también observando', text: 'PU Prime ofrece opciones de copy trading para descubrir cómo operan otros participantes. Sus decisiones no garantizan resultados.' },
  { icon: GraduationCap, number: '04', title: 'Empieza con una demo', text: 'Conoce las herramientas y practica tu proceso antes de decidir si quieres operar con fondos reales.' },
];

export function BrokerCta({ label = 'Conocer PU Prime' }: { label?: string }) {
  if (!referralUrl) return <span className="bk-cta-pending">Enlace de acceso en preparación</span>;
  return <a className="button primary bk-cta" href={referralUrl} target="_blank" rel="sponsored noopener noreferrer">{label}<ArrowUpRight size={18} /></a>;
}

function Source({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="bk-source" href={href} {...external}>{children}<ExternalLink size={14} /></a>;
}

export function BrokerPage() {
  return <main id="main-content" tabIndex={-1} className="bk-page">
    <section className="bk-hero" aria-labelledby="bk-title">
      <img className="bk-hero-image" src="/images/broker-stadium.png" alt="Estadio de fútbol iluminado al atardecer, imagen conceptual creada para Xaurix FX" fetchPriority="high" />
      <div className="bk-hero-shade" />
      <div className="bk-hero-content"><span className="bk-kicker"><span /> XAURIX FX × PU PRIME</span><h1 id="bk-title">Tu siguiente paso<br /><em>empieza aquí.</em></h1><p>Descubre un bróker con diversas plataformas, mercados y recursos para aprender. Explora PU Prime desde Xaurix FX y decide con información.</p><div className="bk-hero-actions"><BrokerCta label="Explorar el bróker" /><a className="bk-textlink" href="#bk-discover">Descubrir más <ArrowRight size={17} /></a></div><small>Acceso externo a PU Prime · Los CFD implican riesgo de pérdida.</small></div>
      <div className="bk-hero-index">01 <span>/</span> 04</div>
    </section>

    <div className="bk-proofbar" aria-label="Aspectos destacados"><div><span>01</span> Varias plataformas</div><div><span>02</span> Acceso a múltiples mercados</div><div><span>03</span> Formación y cuenta demo</div><div><span>04</span> Alianza con AFA</div></div>

    <section id="bk-discover" className="bk-section bk-intro" aria-labelledby="bk-discover-title"><div className="bk-section-heading"><span className="bk-eyebrow">UN MUNDO POR EXPLORAR</span><h2 id="bk-discover-title">Herramientas para encontrar <em>tu propio camino.</em></h2><p>PU Prime reúne distintas formas de acceder a los mercados. Conoce sus opciones, compara condiciones y empieza por lo que se ajuste a tu experiencia.</p></div><div className="bk-benefits">{benefits.map(({icon:Icon,number,title,text})=><article className="bk-benefit" key={number}><span className="bk-benefit-number">{number}</span><Icon size={31} strokeWidth={1.5}/><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="bk-feature bk-afa" aria-labelledby="bk-afa-title"><div className="bk-feature-art"><span className="bk-art-overline">EN LA CANCHA · EN LOS MERCADOS</span><div className="bk-art-ball"><Trophy size={74} strokeWidth={1}/></div><span className="bk-art-caption">El valor de la preparación</span></div><div className="bk-feature-copy"><span className="bk-eyebrow">PATROCINIO OFICIAL</span><h2 id="bk-afa-title">Una alianza que habla de <em>ambición y disciplina.</em></h2><p>PU Prime presenta su patrocinio oficial de la Asociación del Fútbol Argentino (AFA) como una historia de preparación, constancia y trabajo en equipo.</p><p className="bk-caption">El patrocinio pertenece a PU Prime. Xaurix FX no afirma ser patrocinador de AFA.</p><Source href={sources.sponsorship}>Conoce la historia en PU Prime</Source></div></section>

    <section className="bk-section bk-recognition" aria-labelledby="bk-awards-title"><div className="bk-section-heading"><span className="bk-eyebrow">RECONOCIMIENTOS</span><h2 id="bk-awards-title">Una trayectoria que <em>se hace visible.</em></h2><p>PU Prime publica una lista de premios de la industria. Estos son algunos reconocimientos de 2026, tal como aparecen en su sitio oficial.</p></div><div className="bk-award-grid"><article><Award size={31}/><span>GLOBAL FOREX AWARDS · 2026</span><h3>App de trading para principiantes</h3><p>Reconocimiento global publicado por PU Prime.</p></article><article><Award size={31}/><span>GLOBAL BUSINESS & FINANCE · 2026</span><h3>Bróker multiactivo</h3><p>Reconocimiento global publicado por PU Prime.</p></article><article><Award size={31}/><span>INTERNATIONAL BUSINESS MAGAZINE · 2026</span><h3>Experiencia educativa</h3><p>Reconocimiento global publicado por PU Prime.</p></article></div><Source href={sources.awards}>Ver la lista y los organizadores</Source></section>

    <section className="bk-feature bk-trust" aria-labelledby="bk-trust-title"><div className="bk-feature-copy"><span className="bk-eyebrow">ANTES DE ABRIR UNA CUENTA</span><h2 id="bk-trust-title">La confianza empieza <em>por verificar.</em></h2><p>En su página de regulación, PU Prime identifica las entidades que operan bajo su marca y publica números de licencia en Seychelles, Mauricio, Sudáfrica y Emiratos Árabes Unidos.</p><p>La entidad, las condiciones y las protecciones aplicables dependen de dónde resides y con cuál contratas. Revisa siempre el documento legal correspondiente.</p><Source href={sources.regulation}>Consultar entidades y licencias</Source></div><div className="bk-trust-art"><ShieldCheck size={64} strokeWidth={1}/><div><span>Información verificable</span><strong>Entidades · licencias · restricciones</strong></div><small>Fuente: página de regulación de PU Prime</small></div></section>

    <section className="bk-section bk-offers" aria-labelledby="bk-offers-title"><div className="bk-section-heading"><span className="bk-eyebrow">OPORTUNIDADES PARA EXPLORAR</span><h2 id="bk-offers-title">Promociones con <em>letra clara.</em></h2><p>PU Prime publica campañas que pueden variar por país, tipo de cuenta y fecha. Comprueba las condiciones vigentes antes de participar.</p></div><div className="bk-offer-grid"><div><Sparkles size={27}/><h3>Bonos de depósito</h3><p>El sitio del bróker presenta créditos promocionales sujetos a condiciones. Un bono no equivale a dinero retirable.</p></div><div><BadgeCheck size={27}/><h3>Beneficios por actividad</h3><p>Hay campañas de cashback y otros beneficios ligados a requisitos de operación y elegibilidad.</p></div><div><Smartphone size={27}/><h3>Herramientas adicionales</h3><p>PU Prime anuncia acceso a VPS bajo condiciones específicas para algunos operadores.</p></div></div><Source href={sources.promotions}>Revisar promociones actuales</Source></section>

    <section className="bk-bottom" aria-labelledby="bk-bottom-title"><div><span className="bk-eyebrow">EL SIGUIENTE PASO ES TUYO</span><h2 id="bk-bottom-title">Conoce la plataforma. <em>Decide con criterio.</em></h2><p>Explora PU Prime y sus condiciones directamente en el sitio del bróker.</p></div><BrokerCta label="Ir a PU Prime" /></section>

    <section className="bk-legal" aria-labelledby="bk-legal-title"><h2 id="bk-legal-title">Información importante</h2><p><strong>Vínculo de afiliación.</strong> El acceso principal utiliza un enlace de referido y Xaurix FX podría recibir una comisión si te registras. El registro y la operación se realizan con PU Prime, bajo las condiciones de la entidad que te corresponda.</p><p><strong>Riesgo.</strong> Los CFD son productos complejos y el apalancamiento puede ampliar pérdidas y ganancias. Puedes perder más que el depósito inicial. Los resultados pasados no predicen los futuros. Este contenido no constituye asesoría de inversión.</p><p><strong>Disponibilidad.</strong> Los productos, promociones y servicios pueden no estar disponibles en tu jurisdicción. Comprueba elegibilidad, términos y documentación vigente antes de abrir una cuenta o depositar fondos.</p><p><strong>Fuentes.</strong> Información consultada en las páginas públicas de <a href={sources.sponsorship} {...external}>patrocinio</a>, <a href={sources.awards} {...external}>premios</a>, <a href={sources.regulation} {...external}>regulación</a> y <a href={sources.promotions} {...external}>promociones</a> de PU Prime, el 15 de noviembre de 2026.</p></section>
  </main>;
}
