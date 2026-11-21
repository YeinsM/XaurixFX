import { useEffect, useRef, useState } from 'react';
import { BookOpen, Clock3, FileText, Lock, PlayCircle, Subtitles, Volume2 } from 'lucide-react';
import { api } from '../lib/api';
import type { AcademyCatalog, AcademyLevel } from '../types';

const minutes = (level: AcademyLevel) => Math.max(1, Math.round(level.capsules.reduce((s, c) => s + c.durationSec, 0) / 60));
export const priceLabel = (level: AcademyLevel) =>
  level.free ? 'Gratis' : level.priceUsdt != null ? `${level.priceUsdt} USDT` : 'Precio por definir';

/** Vista de un nivel: reproductor y guía PDF si es gratuito; temario bloqueado si es de pago. */
export function LevelPanel({ level, initial = 0 }: { level: AcademyLevel; initial?: number }) {
  const [index, setIndex] = useState(initial);
  const capsule = level.capsules[Math.min(index, level.capsules.length - 1)];
  return (
    <div className="level-panel" id="level-panel">
      <div className="level-panel-head">
        <div><span className="eyebrow">NIVEL {level.level}</span><h2>{level.name}</h2></div>
        <span className={`level-price ${level.free ? 'free' : ''}`}>{!level.unlocked && <Lock size={13} />}{priceLabel(level)}</span>
      </div>
      {!level.free && level.unlocked && <p className="admin-note">Vista de administrador: nivel de pago desbloqueado.</p>}
      {level.manual && (
        <div className="level-manual">
          <BookOpen size={20} />
          <p><strong>Manual completo del nivel.</strong> Todos los temas del plan con explicación, ejemplos resueltos, errores comunes, ejercicios con soluciones, caso integrador y glosario.</p>
          <a className="button primary" href={level.manual} target="_blank" rel="noopener"><FileText size={16} />Abrir manual PDF</a>
        </div>
      )}
      {!level.manual && level.hasManual && <p className="level-manual-locked"><Lock size={14} />Incluye un manual completo en PDF al adquirir el nivel.</p>}
      {level.unlocked && capsule.media ? (
        <div className="level-layout">
          <article className="capsule-player">
            <video key={capsule.id} controls preload="metadata" playsInline src={capsule.media.video} aria-label={`Video: ${capsule.title}`}>
              <track kind="subtitles" srcLang="es" label="Español" src={capsule.media.subtitles} default={!capsule.narrated} />
            </video>
            <span className="eyebrow">CÁPSULA {capsule.id} · TEMA {capsule.topic.toUpperCase()}</span>
            <h3>{capsule.title}</h3>
            <p>{capsule.objective}</p>
            <div className="capsule-actions">
              <a className="button secondary" href={capsule.media.pdf} target="_blank" rel="noopener"><FileText size={16} />Guía PDF</a>
              <span className="capsule-flag">{capsule.narrated ? <><Volume2 size={14} />Con locución</> : <><Subtitles size={14} />Con subtítulos</>}</span>
              <span className="capsule-flag"><Clock3 size={14} />{Math.round(capsule.durationSec)} s</span>
            </div>
          </article>
          <nav className="capsule-list" aria-label={`Cápsulas del nivel ${level.level}`}>
            {level.capsules.map((c, i) => (
              <button key={c.id} className={i === index ? 'selected' : ''} aria-current={i === index ? 'true' : undefined} onClick={() => setIndex(i)}>
                <PlayCircle size={16} /><span><strong>{c.title}</strong><small>{c.topic}</small></span>
              </button>
            ))}
          </nav>
        </div>
      ) : (
        <div className="level-locked">
          <div className="level-locked-note"><Lock size={18} /><p><strong>Nivel de pago · {priceLabel(level)}.</strong> Podrás ver los videos y descargar las guías cuando se habilite la compra de este nivel. Este es su temario:</p></div>
          <ul className="capsule-syllabus">
            {level.capsules.map(c => <li key={c.id}><Lock size={14} /><span><strong>{c.title}</strong><small>{c.topic} · {c.objective}</small></span></li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export function LearningPath({ userId }: { userId?: string }) {
  const [data, setData] = useState<AcademyCatalog | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  async function load() {
    setError('');
    try { setData(await api<AcademyCatalog>('/academy')); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar la ruta de aprendizaje.'); }
  }
  // El desbloqueo depende de la sesión: recarga al iniciar o cerrar sesión.
  useEffect(() => { void load(); }, [userId]);
  useEffect(() => { if (selected !== null) panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [selected]);

  const level = data?.levels.find(l => l.level === selected);
  return (
    <section className="academy-section path-section" aria-labelledby="path-title">
      <div className="section-heading"><div><span className="eyebrow">RUTA DE APRENDIZAJE</span><h2 id="path-title">Ocho niveles en cápsulas de video con guía PDF</h2></div></div>
      {error ? <div className="inline-error">{error}<button className="text-button" onClick={() => void load()}>Reintentar</button></div>
        : !data ? <p className="muted">Cargando la ruta…</p>
          : <div className="levels-grid">{data.levels.map(l => (
            <button key={l.level} className={`level-card ${selected === l.level ? 'selected' : ''}`} aria-pressed={selected === l.level} onClick={() => setSelected(l.level)}>
              <span className="level-number">{String(l.level).padStart(2, '0')}</span>
              <span className="eyebrow">NIVEL {l.level}</span>
              <h3>{l.name}</h3>
              <span className="level-meta">{l.capsules.length} cápsulas · {minutes(l)} min</span>
              <span className={`level-price ${l.free ? 'free' : ''}`}>{!l.unlocked && <Lock size={12} />}{priceLabel(l)}</span>
              {!l.free && l.unlocked && <span className="level-admin">Desbloqueado · admin</span>}
            </button>
          ))}</div>}
      <div ref={panel}>{level && <LevelPanel key={level.level} level={level} />}</div>
      <p className="path-note">Contenido educativo con datos simulados. No es asesoría de inversión: operar con apalancamiento puede causar pérdidas rápidas. Practica primero en cuenta demo.</p>
    </section>
  );
}
