import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Page } from '../types';
import { AcademyArt, ChartArt, CommunityArt, NewsArt } from './InicioArt';

const modules: { file: string; art: ReactNode; title: string; text: string; page: Page }[] = [
  { file: 'mercados.sh', art: <ChartArt />, title: 'Mercados en un panel', text: 'Índices, materias primas, divisas y cripto con gráfico interactivo, calendario y mapa de calor.', page: 'home' },
  { file: 'noticias.sh', art: <NewsArt />, title: 'Noticias en español', text: 'Fuentes oficiales resumidas y traducidas, siempre con enlace a la publicación original.', page: 'news' },
  { file: 'academia.sh', art: <AcademyArt />, title: 'Academia', text: 'Cursos con contenido gratuito y de pago por red Ethereum. Lo que compras queda en tu cuenta.', page: 'academy' },
  { file: 'comunidad.sh', art: <CommunityArt />, title: 'Comunidad', text: 'Un espacio para compartir lo aprendido con otras personas que estudian los mercados.', page: 'community' },
];

function Win({ file, art, title, text, page, onNavigate }: (typeof modules)[number] & { onNavigate: (p: Page) => void }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el); const t = setTimeout(() => setSeen(true), 2500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return (
    <article ref={ref} className={`tm-win${seen ? ' in' : ''}`}>
      <header><i /><i /><i /> {file}</header>
      <div className="tm-win-body">
        <div className="tm-art-wrap">{art}</div><h3>{title}</h3><p>{text}</p>
        <a className="tm-link" href={`#${page}`} onClick={e => { e.preventDefault(); onNavigate(page); }}>abrir →</a>
      </div>
    </article>
  );
}

export function ModuleWindows({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <section aria-labelledby="tm-modules" className="mk-block">
      <div className="section-heading"><h2 id="tm-modules"><span className="tm-accent">&gt;</span> qué_encontrarás_en_xaurixfx</h2></div>
      <div className="tm-grid">{modules.map(m => <Win key={m.file} {...m} onNavigate={onNavigate} />)}</div>
    </section>
  );
}
