import { GraduationCap, MessageCircle, Newspaper } from 'lucide-react';

/** Ilustraciones decorativas de la página Inicio (SVG propio, sin recursos externos). */

/** Rombo de Ethereum (logo de la red). */
export function EthLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size * 0.62} height={size} viewBox="0 0 256 417" role="img" aria-label="Ethereum" className="tm-eth">
      <path fill="#ececea" fillOpacity=".6" d="M127.96 0 125.17 9.5v275.67l2.79 2.79 127.96-75.64z" />
      <path fill="#ececea" d="M127.96 0 0 212.32l127.96 75.64V154.16z" />
      <path fill="#ececea" fillOpacity=".6" d="m127.96 312.19-1.57 1.92v98.2l1.57 4.6L256 236.59z" />
      <path fill="#ececea" d="M127.96 416.9v-104.7L0 236.59z" />
      <path fill="#ececea" fillOpacity=".2" d="m127.96 287.96 127.96-75.64-127.96-58.16z" />
      <path fill="#ececea" fillOpacity=".4" d="M0 212.32l127.96 75.64v-133.8z" />
    </svg>
  );
}

/** Insignia de Tether (USDT). */
export function TetherLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Tether USDT" className="tm-usdt">
      <circle cx="16" cy="16" r="16" fill="#26a17b" />
      <path fill="#fff" d="M17.9 17.9v-.01c-.11.01-.68.04-1.94.04-1 0-1.72-.03-1.97-.04v.01c-3.88-.17-6.78-.85-6.78-1.66s2.9-1.49 6.78-1.66v2.64c.25.02.99.06 1.99.06 1.2 0 1.81-.05 1.92-.06v-2.64c3.87.17 6.76.85 6.76 1.66s-2.89 1.49-6.76 1.66m0-3.59v-2.36h5.41V8.34H8.7v3.61h5.41v2.36c-4.4.2-7.7 1.07-7.7 2.12s3.3 1.92 7.7 2.12v7.59h3.8v-7.59c4.39-.2 7.68-1.07 7.68-2.12s-3.29-1.92-7.68-2.12" />
    </svg>
  );
}

export function ChartArt() {
  const candles = [[20, 70, 52, 88, 1], [44, 60, 40, 78, 0], [68, 48, 28, 62, 1], [92, 54, 36, 70, 0], [116, 38, 20, 52, 1], [140, 26, 10, 42, 1], [164, 34, 16, 48, 0], [188, 18, 4, 30, 1]];
  return (
    <svg viewBox="0 0 220 100" className="tm-art" aria-hidden="true">
      {[25, 50, 75].map(y => <line key={y} x1="0" x2="220" y1={y} y2={y} stroke="currentColor" strokeOpacity=".12" />)}
      {candles.map(([x, top, hi, lo, up]) => (
        <g key={x} stroke={up ? '#35e0a1' : '#ff5d6c'} fill={up ? '#35e0a1' : '#ff5d6c'}>
          <line x1={x + 5} x2={x + 5} y1={hi} y2={lo} strokeWidth="2" />
          <rect x={x} y={top - 10} width="10" height="22" />
        </g>
      ))}
    </svg>
  );
}

export function NewsArt() {
  return (
    <div className="tm-art tm-art-box" aria-hidden="true">
      <Newspaper size={64} strokeWidth={1.2} />
      <div className="tm-lines"><i /><i /><i /><i /></div>
      <span className="tm-tag">ES</span>
    </div>
  );
}

export function AcademyArt() {
  return (
    <div className="tm-art tm-art-box" aria-hidden="true">
      <GraduationCap size={64} strokeWidth={1.2} />
      <div className="tm-pay"><TetherLogo size={34} /><span className="tm-pay-eth"><EthLogo size={34} /></span></div>
    </div>
  );
}

export function CommunityArt() {
  return (
    <div className="tm-art tm-art-box" aria-hidden="true">
      <div className="tm-avatars"><i /><i /><i /></div>
      <MessageCircle size={46} strokeWidth={1.3} />
    </div>
  );
}
