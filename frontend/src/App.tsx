import { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { Page, User } from './types';
import { api, ApiError } from './lib/api';
import { AcademyPage } from './components/AcademyPage';
import { BrokerPage } from './components/BrokerPage';
import { AuthForm } from './components/AuthForm';
import { CommunityPage } from './components/CommunityPage';
import { HomePage } from './components/HomePage';
import { InicioPage } from './components/InicioPage';
import { NewsPage } from './components/NewsPage';
import { AnalysisPage } from './components/AnalysisPage';
import { Modal } from './components/Modal';
import { ProfileSettings } from './components/ProfileSettings';
import { SiteHeader } from './components/SiteHeader';

const pages: Page[] = ['inicio', 'home', 'news', 'analysis', 'academy', 'broker', 'community', 'settings'];
const titles: Record<Page, string> = { inicio: 'Inicio', home: 'Mercados', news: 'Noticias', analysis: 'Análisis', academy: 'Academia', broker: 'Broker', community: 'Comunidad', settings: 'Configuración' };
const currentPage = (): Page => { const hash = location.hash.slice(1) as Page; return pages.includes(hash) ? hash : 'inicio'; };

export default function App() {
  const [page, setPage] = useState<Page>(currentPage);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState('');

  const navigate = useCallback((next: Page) => { location.hash = next; setPage(next); window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  useEffect(() => {
    api<{ user: User }>('/auth/me').then(res => setUser(res.user)).catch(e => { if (!(e instanceof ApiError) || e.status !== 401) setToast('No se pudo comprobar la sesión.'); });
    const onHash = () => setPage(currentPage());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => { document.title = `${titles[page]} — Xaurix FX`; }, [page]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer); }, [toast]);

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); setUser(null); navigate('inicio'); setToast('Sesión cerrada.'); }
    catch (e) { setToast(e instanceof Error ? e.message : 'No se pudo cerrar sesión.'); }
  }

  return (
    <div className="mk-page">
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <SiteHeader page={page} user={user} onNavigate={navigate} onLogin={() => setAuthOpen(true)} onLogout={() => void logout()} />
      {page === 'inicio' && <InicioPage onNavigate={navigate} />}
      {page === 'home' && <HomePage />}
      {page === 'news' && <NewsPage />}
      {page === 'analysis' && <AnalysisPage />}
      {page === 'academy' && <AcademyPage />}
      {page === 'broker' && <BrokerPage />}
      {page === 'community' && <CommunityPage />}
      {page === 'settings' && (user
        ? <ProfileSettings user={user} onSaved={saved => { setUser(saved); setToast('Tu perfil se actualizó.'); }} onLogout={() => void logout()} />
        : <main id="main-content" tabIndex={-1} className="mk-main"><section className="panel settings-empty"><h2>Un espacio que es tuyo</h2><p>Inicia sesión para ver tu perfil.</p><button className="button primary" onClick={() => setAuthOpen(true)}>Acceder a mi cuenta</button></section></main>)}
      <footer className="mk-footer">
        <span>© {new Date().getFullYear()} Xaurix FX</span>
        <span>Información de mercados con fines informativos; no constituye recomendación de inversión.</span>
        <span>Widgets: <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">TradingView</a>.</span>
      </footer>
      {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
      {authOpen && <Modal title="Bienvenido a Xaurix" onClose={() => setAuthOpen(false)}><AuthForm onSuccess={res => { setAuthOpen(false); setUser(res); }} /></Modal>}
    </div>
  );
}
