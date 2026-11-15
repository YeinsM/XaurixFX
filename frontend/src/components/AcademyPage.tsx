import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CirclePlay, Clock3 } from 'lucide-react';
import { api } from '../lib/api';
import type { Content, Course } from '../types';
import { CourseCard } from './CourseCard';
import { Modal } from './Modal';

function CourseReader({ course, onClose }: { course: Course; onClose: () => void }) {
  const [lesson, setLesson] = useState(0);
  const last = lesson === course.body.length - 1;
  return (
    <Modal title={course.title} onClose={onClose} wide>
      <div className="lesson-meta"><span className="status pending">{course.level}</span><span><Clock3 size={14} /> {course.duration}</span><span>Guía de lectura</span></div>
      <p className="lesson-intro">{course.description}</p>
      <div className="lesson-layout">
        <nav aria-label="Lecciones del curso">{course.body.map((_, i) => <button key={i} className={lesson === i ? 'selected' : ''} onClick={() => setLesson(i)} aria-current={lesson === i ? 'step' : undefined}><span>{String(i + 1).padStart(2, '0')}</span> Lección {i + 1}{lesson === i && <CirclePlay size={15} />}</button>)}</nav>
        <article className="lesson-body">
          <span className="eyebrow">LECCIÓN {lesson + 1} DE {course.body.length}</span>
          <h3>Aprende a tu ritmo</h3>
          <p>{course.body[lesson]}</p>
          <div className="lesson-controls">
            <button className="button secondary" disabled={lesson === 0} onClick={() => setLesson(lesson - 1)}>Anterior</button>
            <button className="button primary" onClick={() => (last ? onClose() : setLesson(lesson + 1))}>{last ? 'Finalizar lectura' : 'Siguiente'}<ArrowRight size={16} /></button>
          </div>
        </article>
      </div>
    </Modal>
  );
}

export function AcademyPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState('');
  const [course, setCourse] = useState<Course | null>(null);

  async function load() {
    setError('');
    try { setContent(await api<Content>('/content')); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar el contenido.'); }
  }
  useEffect(() => { void load(); }, []);

  return (
    <main id="main-content" tabIndex={-1} className="mk-main">
      <div className="page-heading"><div><div className="eyebrow">XAURIX ACADEMY</div><h1>Invierte en tu conocimiento</h1><p>Entiende los mercados. Construye tu propio criterio.</p></div></div>
      <section className="academy-section">
        {error ? <div className="inline-error">{error}<button className="text-button" onClick={() => void load()}>Reintentar</button></div>
          : !content ? <p className="muted">Cargando formación…</p>
            : <div className="courses-grid">{content.courses.map((c, i) => <CourseCard key={c.id} course={c} index={i} onOpen={() => setCourse(c)} />)}</div>}
        <div className="academy-note"><BookOpen size={21} /><p>Guías introductorias de lectura. El contenido es educativo y no representa una promesa de rendimiento.</p></div>
      </section>
      {course && <CourseReader course={course} onClose={() => setCourse(null)} />}
    </main>
  );
}
