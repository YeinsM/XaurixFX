import { useEffect, useState } from 'react';
import type { Page } from '../types';

const HEADLINE = ['Entiende los mercados.', 'Aprende con criterio.'];
const BOOT = ['cargando mercados…', 'sincronizando noticias oficiales…', 'academia disponible', 'esperando tu decisión'];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function TerminalHero({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const full = HEADLINE.join('\n');
  const [typed, setTyped] = useState(() => (reduced() ? full.length : 0));
  const [boot, setBoot] = useState(() => (reduced() ? BOOT.length : 0));

  useEffect(() => {
    if (typed >= full.length) return;
    const t = setTimeout(() => setTyped(n => n + 1), 55);
    return () => clearTimeout(t);
  }, [typed, full.length]);
  useEffect(() => {
    if (boot >= BOOT.length) return;
    const t = setTimeout(() => setBoot(n => n + 1), boot === 0 ? 1400 : 500);
    return () => clearTimeout(t);
  }, [boot]);

  const [first, second] = full.slice(0, typed).split('\n');
  const go = (page: Page) => (e: React.MouseEvent) => { e.preventDefault(); onNavigate(page); };
  return (
    <section className="tm-hero" aria-labelledby="tm-title">
      <div className="tm-prompt">xaurixfx@inicio:~$</div>
      <h1 id="tm-title" aria-label={HEADLINE.join(' ')}>
        <span aria-hidden="true">{first}{second !== undefined && <><br />{second}</>}<span className="tm-cursor" /></span>
      </h1>
      <p>XaurixFX reúne mercados del mundo, noticias oficiales en español y una academia de trading en un solo lugar. Contenido para aprender con método, sin promesas de resultados.</p>
      <div className="tm-actions">
        <a className="tm-btn" href="#home" onClick={go('home')}>./explorar_mercados</a>
        <a className="tm-btn muted" href="#academy" onClick={go('academy')}>./ver_academia</a>
      </div>
      <ul className="tm-log" aria-hidden="true">
        {BOOT.slice(0, boot).map((l, i) => <li key={l}><span className={i < BOOT.length - 1 ? 'ok' : 'wait'}>{i < BOOT.length - 1 ? '[ok]' : '[..]'}</span> {l}</li>)}
      </ul>
    </section>
  );
}
