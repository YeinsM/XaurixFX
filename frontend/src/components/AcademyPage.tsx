import { LearningPath } from './LearningPath';

export function AcademyPage({ userId }: { userId?: string } = {}) {
  return (
    <main id="main-content" tabIndex={-1} className="mk-main">
      <div className="page-heading"><div><div className="eyebrow">XAURIX ACADEMY</div><h1>Invierte en tu conocimiento</h1><p>Entiende los mercados. Construye tu propio criterio.</p></div></div>
      <LearningPath userId={userId} />
    </main>
  );
}
