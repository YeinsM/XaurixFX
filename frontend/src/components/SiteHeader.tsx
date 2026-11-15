import { LogOut } from 'lucide-react';
import type { Page, User } from '../types';

const links: { page: Page; label: string }[] = [
  { page: 'home', label: 'Mercados' },
  { page: 'academy', label: 'Academia' },
  { page: 'community', label: 'Comunidad' },
];

type Props = { page: Page; user: User | null; onNavigate: (page: Page) => void; onLogin: () => void; onLogout: () => void };

export function SiteHeader({ page, user, onNavigate, onLogin, onLogout }: Props) {
  return (
    <header className="mk-header">
      <a className="brand" href="#home" onClick={e => { e.preventDefault(); onNavigate('home'); }} aria-label="Xaurix FX, inicio"><span className="brand-mark">X</span><span>XAURIX <small>FX</small></span></a>
      <nav aria-label="Principal">
        {links.map(link => <a key={link.page} href={`#${link.page}`} aria-current={page === link.page ? 'page' : undefined} className={page === link.page ? 'active' : ''} onClick={e => { e.preventDefault(); onNavigate(link.page); }}>{link.label}</a>)}
      </nav>
      <div className="mk-actions">
        {user ? <>
          <button className="button secondary" onClick={() => onNavigate('settings')}>{user.name.split(' ')[0]}</button>
          <button className="icon-button" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={onLogout}><LogOut size={18} /></button>
        </> : <button className="button primary" onClick={onLogin}>Iniciar sesión</button>}
      </div>
    </header>
  );
}
