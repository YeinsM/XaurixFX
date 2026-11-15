import { useState, type FormEvent } from 'react';
import { Check, LogOut, Settings2, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import type { User } from '../types';

type Props = { user: User; onSaved: (user: User) => void; onLogout: () => void };

export function ProfileSettings({ user, onSaved, onLogout }: Props) {
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try { onSaved((await api<{ user: User }>('/profile', { method: 'PATCH', body: JSON.stringify({ name }) })).user); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar.'); }
    finally { setBusy(false); }
  }

  return (
    <main id="main-content" tabIndex={-1} className="mk-main">
      <div className="page-heading"><div><div className="eyebrow">TU ESPACIO XAURIX</div><h1>Tu cuenta, a tu manera</h1><p>Gestiona tu información personal y tu sesión.</p></div></div>
      <div className="settings-grid">
        <section className="panel">
          <div className="panel-title"><h2>Información personal</h2><Settings2 size={19} /></div>
          <form className="form-stack" onSubmit={save}>
            <label>Nombre completo<input value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={80} required autoComplete="name" /></label>
            <label>Correo electrónico<input value={user.email} readOnly type="email" /></label>
            <p className="muted">El correo identifica tu cuenta. Su cambio no está disponible en esta versión.</p>
            {error && <p role="alert" className="form-error">{error}</p>}
            <button className="button primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}<Check size={16} /></button>
          </form>
        </section>
        <section className="panel session-panel">
          <ShieldCheck size={28} /><h2>Tu sesión</h2><p>Cierra la sesión al terminar si compartes este equipo.</p>
          <button className="button secondary" onClick={onLogout}><LogOut size={17} /> Cerrar sesión</button>
        </section>
      </div>
    </main>
  );
}
