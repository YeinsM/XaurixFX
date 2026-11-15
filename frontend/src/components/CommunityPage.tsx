import { MessageCircle, Users } from 'lucide-react';

export function CommunityPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mk-main">
      <section className="panel community-panel">
        <div className="community-icon"><Users size={42} strokeWidth={1.3} /></div>
        <span className="eyebrow">CONECTADOS POR EL CONOCIMIENTO</span>
        <h2>El siguiente paso se construye juntos.</h2>
        <p>Muy pronto encontrarás aquí los canales oficiales de Xaurix FX y nuevas formas de compartir con la comunidad.</p>
        <div className="community-channels">{['Telegram', 'Instagram', 'X / Twitter'].map(name => <div key={name}><MessageCircle size={19} /><strong>{name}</strong><span>Próximamente</span></div>)}</div>
      </section>
    </main>
  );
}
