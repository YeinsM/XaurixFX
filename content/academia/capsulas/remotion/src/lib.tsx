import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const C = {
	bg: '#0d0f11', panel: '#141619', border: '#282b2f', gold: '#d9b46b', gold2: '#e4c17d',
	text: '#ececea', muted: '#95979f', green: '#3fb68b', red: '#e05d5d', blue: '#6aa3d9', purple: '#a98be0',
};
export const FONT = "'Manrope', 'Segoe UI', Arial, sans-serif";
export const INTRO = 3;
export const OUTRO = 4;
export const FPS = 30;

export type Beat = {secs: number; text: string};
export type Meta = {id: string; slug: string; level: number; topic: string; title: string; objective: string; beats: Beat[]};
export type SceneProps = {beat: number; p: number; t: number};

export const LEVEL_NAMES: Record<number, string> = {
	1: 'Trading desde cero', 2: 'Plataformas y ejecución', 3: 'Análisis técnico, fundamental y macroeconómico',
	4: 'Gestión de riesgo y psicología', 5: 'Diseño de estrategias y plan de trading', 6: 'Especializaciones por mercado',
	7: 'Backtesting avanzado y gestión de cartera', 8: 'Trading sistemático, automatización y proyecto final',
};

export const totalSecs = (m: Meta) => INTRO + m.beats.reduce((a, b) => a + b.secs, 0) + OUTRO;

export const ease = (p: number) => Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, p)));
export const seg = (p: number, a: number, b: number) => ease((p - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Formato numérico en español: 2.380,50 */
export const fmt = (v: number, d = 0, sign = false) => {
	const [int, dec] = Math.abs(v).toFixed(d).split('.');
	const s = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (dec ? ',' + dec : '');
	const pre = v < 0 ? '−' : sign && v > 0 ? '+' : '';
	return pre + s;
};

// ------------------------------------------------------------------ datos simulados
export const rng = (seed: number) => () => {
	seed = (seed * 1664525 + 1013904223) % 4294967296;
	return seed / 4294967296;
};
export type Candle = {o: number; h: number; l: number; c: number};

/** Cierres que siguen anclas [índice, precio] con ruido reproducible. */
export const pathFrom = (anchors: [number, number][], n: number, noise: number, seed: number) => {
	const r = rng(seed);
	const out: number[] = [];
	for (let i = 0; i < n; i++) {
		let k = 0;
		while (k < anchors.length - 2 && anchors[k + 1][0] < i) k++;
		const [x0, y0] = anchors[k];
		const [x1, y1] = anchors[k + 1];
		const base = y0 + ((y1 - y0) * (i - x0)) / Math.max(1, x1 - x0);
		out.push(base + (r() - 0.5) * 2 * noise);
	}
	return out;
};
export const toCandles = (closes: number[], wick: number, seed: number, firstOpen?: number): Candle[] => {
	const r = rng(seed);
	return closes.map((c, i) => {
		const o = i === 0 ? firstOpen ?? c : closes[i - 1];
		const span = Math.abs(c - o) + wick;
		return {o, c, h: Math.max(o, c) + (0.15 + r() * 0.85) * span * 0.55, l: Math.min(o, c) - (0.15 + r() * 0.85) * span * 0.55};
	});
};

// ------------------------------------------------------------------ marco común
export const Chrome: React.FC<{meta: Meta; text: string; textAge: number; children: React.ReactNode}> = ({meta, text, textAge, children}) => {
	const a = interpolate(textAge, [0, 0.35], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.text}}>
			<div style={{position: 'absolute', left: 125, top: 52, fontSize: 21, color: C.gold, fontWeight: 700, letterSpacing: 1.5}}>
				NIVEL {meta.level} · TEMA {meta.topic.toUpperCase()}
			</div>
			<div style={{position: 'absolute', left: 125, top: 88, fontSize: 44, fontWeight: 800}}>{meta.title}</div>
			<Img src={staticFile('xaurix-icon.png')} style={{position: 'absolute', right: 70, top: 40, height: 92}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 200, bottom: 200}}>{children}</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 62, display: 'flex', justifyContent: 'center'}}>
				<div style={{opacity: a, transform: `translateY(${(1 - a) * 12}px)`, background: C.panel, border: `1.5px solid ${C.border}`,
					borderRadius: 14, padding: '20px 34px', fontSize: 33, maxWidth: 1600, textAlign: 'center', lineHeight: 1.35}}>
					{text}
				</div>
			</div>
			<div style={{position: 'absolute', bottom: 16, width: '100%', textAlign: 'center', fontSize: 16, color: '#5d6068'}}>
				XaurixFX Academia · datos simulados · no es asesoría de inversión
			</div>
		</AbsoluteFill>
	);
};

const Intro: React.FC<{meta: Meta; t: number}> = ({meta, t}) => {
	const a = ease(t / 0.8);
	return (
		<AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.text, padding: '0 125px', justifyContent: 'center'}}>
			<div style={{opacity: a, fontSize: 27, color: C.gold, fontWeight: 700, letterSpacing: 2}}>
				NIVEL {meta.level} · {LEVEL_NAMES[meta.level].toUpperCase()}
			</div>
			<div style={{opacity: a, fontSize: 76, fontWeight: 800, margin: '22px 0', transform: `translateY(${(1 - a) * 20}px)`}}>{meta.title}</div>
			<div style={{width: 230 * a, height: 8, background: C.gold, borderRadius: 4, margin: '8px 0 28px'}} />
			<div style={{opacity: a, fontSize: 30, color: C.muted}}>Tema {meta.topic}</div>
			<div style={{opacity: a, fontSize: 24, color: C.muted, marginTop: 10}}>Cápsula {meta.id}</div>
		</AbsoluteFill>
	);
};

const Outro: React.FC<{t: number}> = ({t}) => {
	const a = ease(t / 0.6);
	return (
		<AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.text, justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: a}}>
			<Img src={staticFile('xaurix-icon.png')} style={{height: 120, marginBottom: 30}} />
			<div style={{fontSize: 46, color: C.gold, fontWeight: 800, marginBottom: 26}}>Recuerda</div>
			<div style={{fontSize: 33, lineHeight: 1.6}}>
				Contenido educativo con datos simulados. No es asesoría de inversión.<br />
				Operar con apalancamiento puede causar pérdidas rápidas. Practica en cuenta demo.
			</div>
			<div style={{fontSize: 25, color: C.muted, marginTop: 34}}>XaurixFX · Academia de Trading</div>
		</AbsoluteFill>
	);
};

/** Reparte el tiempo entre portada, tramos y cierre, y entrega (tramo, progreso) a la escena. */
export const Capsule: React.FC<{meta: Meta; Scene: React.FC<SceneProps>}> = ({meta, Scene}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const body = meta.beats.reduce((a, b) => a + b.secs, 0);
	if (t < INTRO) return <Intro meta={meta} t={t} />;
	if (t >= INTRO + body) return <Outro t={t - INTRO - body} />;
	let start = INTRO;
	let k = 0;
	while (k < meta.beats.length - 1 && t >= start + meta.beats[k].secs) {
		start += meta.beats[k].secs;
		k++;
	}
	const p = Math.min(1, (t - start) / meta.beats[k].secs);
	return (
		<Chrome meta={meta} text={meta.beats[k].text} textAge={t - start}>
			<Scene beat={k} p={p} t={t - INTRO} />
		</Chrome>
	);
};

// ------------------------------------------------------------------ gráfico de velas en SVG
export type Scale = {x: (i: number) => number; y: (v: number) => number; w: number; h: number; step: number};

export const makeScale = (w: number, h: number, n: number, yMin: number, yMax: number, padR = 110): Scale => {
	const iw = w - padR - 20;
	const step = iw / n;
	return {
		x: (i) => 20 + step * (i + 0.5),
		y: (v) => h - 20 - ((v - yMin) / (yMax - yMin)) * (h - 40),
		w, h, step,
	};
};

export const Grid: React.FC<{s: Scale; yMin: number; yMax: number; every: number; dec?: number}> = ({s, yMin, yMax, every, dec = 0}) => {
	const lines = [];
	for (let v = Math.ceil(yMin / every) * every; v <= yMax; v += every) {
		lines.push(
			<g key={v}>
				<line x1={20} x2={s.w - 100} y1={s.y(v)} y2={s.y(v)} stroke={C.border} strokeWidth={1} />
				<text x={s.w - 90} y={s.y(v) + 6} fill={C.muted} fontSize={17} fontFamily={FONT}>{fmt(v, dec)}</text>
			</g>,
		);
	}
	return <g>{lines}</g>;
};

/** Dibuja velas hasta `upto` (puede ser fraccionario: la última vela crece). */
export const Candles: React.FC<{s: Scale; data: Candle[]; upto: number; from?: number; opacity?: number; dim?: (i: number) => number}> = ({s, data, upto, from = 0, opacity = 1, dim}) => {
	const out = [];
	const last = Math.min(data.length, Math.ceil(upto));
	for (let i = from; i < last; i++) {
		const d = data[i];
		const g = i === last - 1 ? Math.max(0.05, upto - (last - 1)) : 1;
		const c = lerp(d.o, d.c, g);
		const h = lerp(Math.max(d.o, c), d.h, g);
		const l = lerp(Math.min(d.o, c), d.l, g);
		const col = c >= d.o ? C.green : C.red;
		const bw = Math.max(3, s.step * 0.62);
		const top = s.y(Math.max(d.o, c));
		const bh = Math.max(2, Math.abs(s.y(d.o) - s.y(c)));
		out.push(
			<g key={i} opacity={opacity * (dim ? dim(i) : 1)}>
				<line x1={s.x(i)} x2={s.x(i)} y1={s.y(h)} y2={s.y(l)} stroke={col} strokeWidth={2} />
				<rect x={s.x(i) - bw / 2} y={top} width={bw} height={bh} fill={col} rx={1.5} />
			</g>,
		);
	}
	return <g>{out}</g>;
};

export const HLine: React.FC<{s: Scale; v: number; label?: string; color?: string; dash?: string; opacity?: number; x0?: number; x1?: number; width?: number}> = ({s, v, label, color = C.gold, dash = '10 8', opacity = 1, x0 = 20, x1, width = 2.5}) => (
	<g opacity={opacity}>
		<line x1={x0} x2={x1 ?? s.w - 100} y1={s.y(v)} y2={s.y(v)} stroke={color} strokeWidth={width} strokeDasharray={dash} />
		{label && (
			<g>
				<rect x={(x1 ?? s.w - 100) - label.length * 11 - 24} y={s.y(v) - 19} width={label.length * 11 + 20} height={38} rx={7} fill={color} />
				<text x={(x1 ?? s.w - 100) - 14} y={s.y(v) + 7} fill={C.bg} fontSize={20} fontWeight={800} textAnchor="end" fontFamily={FONT}>{label}</text>
			</g>
		)}
	</g>
);

export const Zone: React.FC<{s: Scale; a: number; b: number; color: string; label?: string; opacity?: number; x0?: number; x1?: number}> = ({s, a, b, color, label, opacity = 1, x0 = 20, x1}) => (
	<g opacity={opacity}>
		<rect x={x0} width={(x1 ?? s.w - 100) - x0} y={s.y(Math.max(a, b))} height={Math.abs(s.y(a) - s.y(b))} fill={color} opacity={0.2} />
		{label && <text x={x0 + 14} y={s.y((a + b) / 2) + 7} fill={color} fontSize={21} fontWeight={800} fontFamily={FONT}>{label}</text>}
	</g>
);

export const Tag: React.FC<{x: number; y: number; text: string; color?: string; bg?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, text, color = C.text, bg, size = 22, opacity = 1, anchor = 'middle'}) => {
	const lines = text.split('\n');
	const w = Math.max(...lines.map((l) => l.length)) * size * 0.56 + 28;
	const h = lines.length * size * 1.3 + 16;
	const bx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w + 14 : x - 14;
	return (
		<g opacity={opacity}>
			{bg && <rect x={bx} y={y - h / 2} width={w} height={h} rx={10} fill={bg} stroke={C.border} />}
			{lines.map((l, i) => (
				<text key={i} x={x} y={y - ((lines.length - 1) * size * 1.3) / 2 + i * size * 1.3 + size * 0.35} fill={color} fontSize={size}
					fontWeight={700} textAnchor={anchor} fontFamily={FONT}>{l}</text>
			))}
		</g>
	);
};

export const Card: React.FC<{title: string; body?: React.ReactNode; color: string; style?: React.CSSProperties; opacity?: number}> = ({title, body, color, style, opacity = 1}) => (
	<div style={{background: C.panel, border: `2px solid ${color}`, borderRadius: 16, padding: '20px 26px', opacity, transform: `translateY(${(1 - opacity) * 16}px)`, ...style}}>
		<div style={{color, fontSize: 26, fontWeight: 800}}>{title}</div>
		{body && <div style={{color: C.text, fontSize: 23, marginTop: 10, lineHeight: 1.4}}>{body}</div>}
	</div>
);

export const Pulse: React.FC<{x: number; y: number; color: string; t: number; r?: number}> = ({x, y, color, t, r = 11}) => {
	const k = (t * 1.6) % 1;
	return (
		<g>
			<circle cx={x} cy={y} r={r + k * 26} fill="none" stroke={color} strokeWidth={3} opacity={1 - k} />
			<circle cx={x} cy={y} r={r} fill={color} stroke={C.text} strokeWidth={2.5} />
		</g>
	);
};
