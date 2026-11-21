import React from 'react';
import {interpolate} from 'remotion';
import {
	C, Candle, Candles, Card, FONT, Grid, HLine, Pulse, SceneProps, Tag, Zone, ease, fmt, lerp, makeScale, pathFrom, rng, seg, toCandles,
} from './lib';

const W = 1920;
const H = 680;

const Svg: React.FC<{w: number; h: number; x?: number; y?: number; children: React.ReactNode}> = ({w, h, x = 0, y = 0, children}) => (
	<svg width={w} height={h} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>{children}</svg>
);

// =============================================================== 1.4-a Largo frente a corto
const LS = (() => {
	const cl = pathFrom([[0, 2377], [10, 2380], [35, 2400], [55, 2390]], 56, 0.9, 14);
	cl[10] = 2380; cl[35] = 2400; cl[55] = 2390;
	return toCandles(cl, 1.2, 4);
})();

export const LongShort: React.FC<SceneProps> = ({beat, p, t}) => {
	const upto = [11, lerp(11, 36, ease(p)), lerp(36, 56, ease(p)), 56, 56][beat];
	const last = LS[Math.max(0, Math.ceil(upto) - 1)];
	const px = beat >= 3 ? 2390 : lerp(last.o, last.c, upto - Math.floor(upto) || 1);
	const entry = 2380;
	const qty = 10;
	const panels = [
		{name: 'LARGO · compras', dir: 1, color: C.green, x: 70},
		{name: 'CORTO · vendes', dir: -1, color: C.red, x: 990},
	];
	return (
		<>
			{panels.map((pn) => {
				const s = makeScale(860, 600, 56, 2370, 2408);
				const pnl = (px - entry) * qty * pn.dir;
				const good = pnl >= 0;
				const closed = beat >= 3 && p > 0.45;
				const net = pnl - 6;
				return (
					<div key={pn.name} style={{position: 'absolute', left: pn.x, top: 40, width: 860, height: 600}}>
						<div style={{position: 'absolute', left: 20, top: -38, fontSize: 28, fontWeight: 800, color: pn.color}}>{pn.name} 10 onzas</div>
						<Svg w={860} h={600}>
							<rect x={0} y={0} width={860} height={600} fill="none" stroke={C.border} rx={10} />
							<Grid s={s} yMin={2370} yMax={2408} every={10} />
							{beat >= 1 && (
								<rect x={s.x(10)} width={s.x(Math.ceil(upto) - 1) - s.x(10)} y={Math.min(s.y(px), s.y(entry))}
									height={Math.abs(s.y(px) - s.y(entry))} fill={good ? C.green : C.red} opacity={0.16} />
							)}
							<Candles s={s} data={LS} upto={upto} />
							<HLine s={s} v={entry} label="entrada 2.380" color={C.text} dash="0" width={2} />
							{closed && <Pulse x={s.x(55)} y={s.y(2390)} color={C.gold} t={t} />}
						</Svg>
						<div style={{position: 'absolute', left: 36, top: 26, fontSize: 52, fontWeight: 800, color: good ? C.green : C.red}}>
							{fmt(pnl, 0, true)} USD
						</div>
						<div style={{position: 'absolute', left: 38, top: 92, fontSize: 22, color: C.muted, fontWeight: 700}}>
							{beat < 3 ? 'resultado bruto' : closed ? 'REALIZADO al cerrar' : 'FLOTANTE (posición abierta)'}
						</div>
						{beat === 4 && (
							<div style={{position: 'absolute', left: 36, top: 150, opacity: seg(p, 0, .35), background: C.panel, border: `2px solid ${C.gold}`,
								borderRadius: 14, padding: '16px 22px', fontSize: 25, lineHeight: 1.55}}>
								Bruto {fmt(pnl, 0, true)}<br />− spread 3 − comisión 3<br />
								<b style={{color: net >= 0 ? C.green : C.red, fontSize: 32}}>Neto {fmt(net, 0, true)} USD</b>
							</div>
						)}
					</div>
				);
			})}
		</>
	);
};

// =============================================================== 2.2-b SL y TP vinculados (OCO)
const OCO = (() => {
	const pre = pathFrom([[0, 2378], [12, 2380]], 13, 0.6, 22);
	pre[12] = 2380;
	const a = pathFrom([[0, 2380], [12, 2386], [17, 2383], [28, 2397.5]], 29, 0.8, 23).slice(1);
	const b = pathFrom([[0, 2380], [7, 2383], [20, 2371]], 21, 0.8, 24).slice(1);
	const A = toCandles([...pre, ...a], 1.0, 5);
	const B = toCandles([...pre, ...b], 1.0, 6);
	const hitA = A.findIndex((d, i) => i > 12 && d.h >= 2396);
	const hitB = B.findIndex((d, i) => i > 12 && d.l <= 2372);
	return {A: A.slice(0, hitA + 1), B: B.slice(0, hitB + 1), hitA, hitB};
})();

export const Oco: React.FC<SceneProps> = ({beat, p, t}) => {
	const s = makeScale(1250, 640, 44, 2364, 2404);
	const scen = beat === 3 ? 'B' : 'A';
	const data = scen === 'A' ? OCO.A : OCO.B;
	const hit = scen === 'A' ? OCO.hitA : OCO.hitB;
	const upto = beat <= 1 ? 13 : beat === 2 || beat === 3 ? lerp(13, hit + 1, seg(p, 0, .75)) : hit + 1;
	const filled = (beat === 2 || beat === 3) && upto >= hit + 1 - 0.01 ? scen : beat === 4 ? 'A' : null;
	const lines = seg(beat === 0 ? p : 1, 0.1, 0.5);
	const status = (k: 'SL' | 'TP') => {
		if (!filled) return {txt: 'pendiente', col: C.muted, strike: false};
		const exec = (filled === 'A' && k === 'TP') || (filled === 'B' && k === 'SL');
		return exec ? {txt: 'EJECUTADA', col: k === 'TP' ? C.green : C.red, strike: false} : {txt: 'CANCELADA', col: C.muted, strike: true};
	};
	return (
		<>
			<Svg w={1250} h={640} x={70} y={20}>
				<Grid s={s} yMin={2364} yMax={2404} every={8} />
				<Candles s={s} data={data} upto={upto} />
				<HLine s={s} v={2380} label="compra 2.380" color={C.text} dash="0" width={2} />
				<HLine s={s} v={2396} label="take-profit 2.396" color={C.green} opacity={lines} />
				<HLine s={s} v={2372} label="stop-loss 2.372" color={C.red} opacity={lines} />
				{beat >= 1 && (
					<g opacity={beat === 1 ? seg(p, 0, .4) : 1}>
						<path d={`M ${s.w - 80} ${s.y(2396)} h 40 V ${s.y(2372)} h -40`} fill="none" stroke={C.gold} strokeWidth={4} />
						<Tag x={s.w - 20} y={s.y(2388)} text="OCO" color={C.bg} bg={C.gold} size={24} />
					</g>
				)}
				{filled && beat < 4 && <Pulse x={s.x(hit)} y={s.y(filled === 'A' ? 2396 : 2372)} color={filled === 'A' ? C.green : C.red} t={t} />}
				{beat === 4 && (
					<g opacity={seg(p, 0, .4)}>
						<rect x={s.x(33)} width={70} y={s.y(2380)} height={s.y(2372) - s.y(2380)} fill={C.red} opacity={0.85} rx={6} />
						<rect x={s.x(33)} width={70} y={s.y(2396)} height={s.y(2380) - s.y(2396)} fill={C.green} opacity={0.85} rx={6} />
						<Tag x={s.x(33) + 100} y={s.y(2376)} text="riesgo 8" color={C.red} anchor="start" size={26} />
						<Tag x={s.x(33) + 100} y={s.y(2388)} text="objetivo 16" color={C.green} anchor="start" size={26} />
						<Tag x={s.x(30)} y={s.y(2401)} text="relación 1 : 2" color={C.gold} bg={C.panel} size={30} />
					</g>
				)}
			</Svg>
			<div style={{position: 'absolute', left: 1390, top: 40, width: 470}}>
				<div style={{fontSize: 22, color: C.muted, fontWeight: 700, marginBottom: 14}}>ÓRDENES · escenario {beat === 3 ? 'B' : 'A'}</div>
				<Card title="Compra 1 lote · 2.380" color={C.text} body="posición abierta" />
				{(['TP', 'SL'] as const).map((k) => {
					const st = status(k);
					return (
						<Card key={k} opacity={lines} color={k === 'TP' ? C.green : C.red} style={{marginTop: 18}}
							title={k === 'TP' ? 'Take-profit · 2.396' : 'Stop-loss · 2.372'}
							body={<span style={{color: st.col, fontWeight: 800, textDecoration: st.strike ? 'line-through' : 'none'}}>{st.txt}</span>} />
					);
				})}
			</div>
		</>
	);
};

// =============================================================== 3.1-a Soporte y resistencia
const SR = (() => {
	const cl = pathFrom([[0, 2380], [8, 2367], [18, 2393], [30, 2367], [41, 2393], [52, 2368], [60, 2405], [67, 2398], [79, 2414]], 80, 1.1, 31);
	const d = toCandles(cl, 1.5, 7);
	d[30] = {...d[30], l: 2361.8};
	return d;
})();
const SUP = [8, 30, 52];
const RES = [18, 41];

export const SupRes: React.FC<SceneProps> = ({beat, p, t}) => {
	const s = makeScale(1780, 640, 80, 2355, 2420);
	const upto = [lerp(4, 56, ease(p)), 56, 56, 56, lerp(56, 80, seg(p, 0, .8))][beat];
	const sup = beat >= 1 ? (beat === 1 ? seg(p, 0, .4) : 1) : 0;
	const res = beat >= 2 ? (beat === 2 ? seg(p, 0, .4) : 1) : 0;
	const flip = beat === 4 ? seg(p, 0.55, 0.8) : 0;
	return (
		<Svg w={1780} h={640} x={70} y={20}>
			<Grid s={s} yMin={2355} yMax={2420} every={10} />
			<Zone s={s} a={2363} b={2369} color={C.green} label="SOPORTE" opacity={sup} />
			<Zone s={s} a={2391} b={2397} color={flip > 0.5 ? C.green : C.red}
				label={flip > 0.5 ? 'RESISTENCIA → SOPORTE' : 'RESISTENCIA'} opacity={res} />
			<Candles s={s} data={SR} upto={upto} dim={(i) => (beat === 3 && i !== 30 ? 0.35 : 1)} />
			{beat === 1 && SUP.map((i, k) => p > 0.3 + k * 0.15 && <Pulse key={i} x={s.x(i)} y={s.y(SR[i].l)} color={C.green} t={t - k * 0.2} />)}
			{beat === 2 && RES.map((i, k) => p > 0.3 + k * 0.15 && <Pulse key={i} x={s.x(i)} y={s.y(SR[i].h)} color={C.red} t={t - k * 0.2} />)}
			{beat === 3 && (
				<g opacity={seg(p, 0.1, 0.4)}>
					<circle cx={s.x(30)} cy={s.y(2363)} r={46} fill="none" stroke={C.gold} strokeWidth={4} />
					<Tag x={s.x(30) + 70} y={s.y(2360)} text={'la mecha perfora la zona,\nel cierre queda dentro'} color={C.gold} bg={C.panel} anchor="start" />
				</g>
			)}
			{beat === 4 && flip > 0 && (
				<g opacity={flip}>
					<Pulse x={s.x(67)} y={s.y(SR[67].l)} color={C.green} t={t} />
					<Tag x={s.x(67)} y={s.y(2380)} text={'vuelve a probar el nivel\ndesde arriba'} color={C.green} bg={C.panel} />
				</g>
			)}
		</Svg>
	);
};

// =============================================================== 3.1-b Rompimiento y falso rompimiento
const BR = (() => {
	const pre = pathFrom([[0, 2384], [5, 2393], [11, 2377], [17, 2393], [24, 2378], [31, 2391]], 32, 0.9, 41);
	const base = toCandles(pre, 1.2, 8).map((d) => ({...d, h: Math.min(d.h, 2394.6)}));
	const real: Candle[] = [{o: pre[31], h: 2401, l: pre[31] - 1, c: 2399.5}];
	const r1 = pathFrom([[0, 2399.5], [4, 2397], [6, 2397.5], [18, 2410]], 19, 0.6, 42).slice(1);
	const realRest = toCandles([2399.5, ...r1], 1, 9).slice(1);
	realRest[3] = {...realRest[3], l: 2395.6};
	const fake: Candle[] = [{o: pre[31], h: 2400, l: pre[31] - 1, c: 2392}];
	const f1 = pathFrom([[0, 2392], [6, 2386], [18, 2377]], 19, 0.6, 43).slice(1);
	const fakeRest = toCandles([2392, ...f1], 1, 10).slice(1);
	return {real: [...base, ...real, ...realRest], fake: [...base, ...fake, ...fakeRest]};
})();

export const Breakout: React.FC<SceneProps> = ({beat, p}) => {
	const panels = [
		{key: 'real', title: 'Rompimiento', color: C.green, x: 60, data: BR.real, upto: beat === 0 ? lerp(5, 32, ease(p)) : beat === 1 ? lerp(32, 51, seg(p, 0, .8)) : 51},
		{key: 'fake', title: 'Falso rompimiento', color: C.red, x: 990, data: BR.fake, upto: beat === 0 ? lerp(5, 32, ease(p)) : beat === 1 ? 32 : beat === 2 ? lerp(32, 51, seg(p, 0, .8)) : 51},
	];
	return (
		<>
			{panels.map((pn) => {
				const s = makeScale(870, 600, 51, 2370, 2414);
				const showNote = beat >= 3 || (beat === 1 && pn.key === 'real' && p > 0.3) || (beat === 2 && pn.key === 'fake' && p > 0.3);
				return (
					<div key={pn.key} style={{position: 'absolute', left: pn.x, top: 40, width: 870, height: 600}}>
						<div style={{position: 'absolute', left: 20, top: -40, fontSize: 30, fontWeight: 800, color: beat === 0 ? C.text : pn.color}}>{pn.title}</div>
						<Svg w={870} h={600}>
							<rect x={0} y={0} width={870} height={600} fill="none" stroke={beat === 0 ? C.border : pn.color} rx={10} />
							<Grid s={s} yMin={2370} yMax={2414} every={10} />
							<Zone s={s} a={2393} b={2397} color={C.gold} label="resistencia 2.395" />
							<Candles s={s} data={pn.data} upto={pn.upto} />
							{showNote && pn.key === 'real' && (
								<g>
									<circle cx={s.x(32)} cy={s.y(2399.5)} r={30} fill="none" stroke={C.green} strokeWidth={4} />
									<Tag x={s.x(32)} y={s.y(2407)} text="cierra fuera ✓" color={C.green} bg={C.panel} />
									{pn.upto > 36 && <Tag x={s.x(44)} y={s.y(2382.5)} text="la retesta y sostiene" color={C.green} bg={C.panel} />}
								</g>
							)}
							{showNote && pn.key === 'fake' && (
								<g>
									<circle cx={s.x(32)} cy={s.y(2397)} r={34} fill="none" stroke={C.red} strokeWidth={4} />
									<Tag x={s.x(32)} y={s.y(2407)} text="mecha fuera, cierra dentro ✗" color={C.red} bg={C.panel} />
								</g>
							)}
							{beat === 3 && (
								<g opacity={seg(p, 0.2, 0.5)}>
									{pn.key === 'real'
										? <HLine s={s} v={2390} label="invalidación: cierre bajo 2.390" color={C.red} x0={s.x(32)} />
										: <Tag x={s.x(14)} y={s.y(2374)} text="sin cierre fuera → no hay entrada" color={C.gold} bg={C.panel} />}
								</g>
							)}
						</Svg>
					</div>
				);
			})}
		</>
	);
};

// =============================================================== 3.4-a Tres escenarios para XAUUSD
const SC = (() => {
	const hist = pathFrom([[0, 2350], [14, 2372], [22, 2366], [36, 2392], [44, 2386]], 45, 1, 51);
	hist[44] = 2386;
	const fut = pathFrom([[0, 2386], [8, 2391], [14, 2381], [22, 2398], [30, 2406]], 31, 1, 52).slice(1);
	return toCandles([...hist, ...fut], 1.2, 11);
})();

export const Scenarios: React.FC<SceneProps> = ({beat, p}) => {
	const s = makeScale(1180, 640, 76, 2340, 2420);
	const now = 44;
	const x0 = s.x(now);
	const xEnd = s.x(74);
	const draw = (b: number) => (beat === b ? seg(p, 0, .6) : beat > b ? 1 : 0);
	const focus = (b: number) => (beat === b || beat >= 4 ? 1 : 0.28);
	const arrowPath = (y1: number, y2: number) => `M ${x0} ${s.y(2386)} C ${x0 + 120} ${s.y(2386)}, ${xEnd - 160} ${s.y(y1)}, ${xEnd} ${s.y(y2)}`;
	const arrows = [
		{b: 1, d: arrowPath(2398, 2412), col: C.green},
		{b: 2, d: arrowPath(2372, 2356), col: C.red},
		{b: 3, d: `M ${x0} ${s.y(2386)} C ${x0 + 120} ${s.y(2396)}, ${xEnd - 200} ${s.y(2376)}, ${xEnd} ${s.y(2388)}`, col: C.gold},
	];
	const reveal = beat === 5 ? seg(p, 0.15, 0.85) : 0;
	const cards = [
		{b: 1, t: 'Alcista', col: C.green, body: 'confirma: cierre > 2.400\ninvalida: cierre < 2.380'},
		{b: 2, t: 'Bajista', col: C.red, body: 'confirma: cierre < 2.370\ninvalida: cierre > 2.390'},
		{b: 3, t: 'Lateral', col: C.gold, body: 'entre 2.370 y 2.400\nsin cierres fuera'},
		{b: 4, t: 'Abstenerse si…', col: C.muted, body: 'dato de alto impacto en minutos\nspread anormal o sin liquidez'},
	];
	return (
		<>
			<Svg w={1180} h={640} x={60} y={20}>
				<Grid s={s} yMin={2340} yMax={2420} every={20} />
				<rect x={x0} y={0} width={s.w - 100 - x0} height={640} fill={C.panel} opacity={0.6} />
				<line x1={x0} x2={x0} y1={0} y2={640} stroke={C.gold} strokeWidth={2} strokeDasharray="6 6" />
				<Tag x={x0 + 10} y={24} text="FECHA DEL CASO" color={C.gold} size={19} anchor="start" />
				<Tag x={x0 - 10} y={24} text="información disponible" color={C.muted} size={17} anchor="end" />
				<Candles s={s} data={SC} upto={beat === 0 ? lerp(3, 45, ease(p)) : 45} />
				{reveal > 0 && <Candles s={s} data={SC} from={45} upto={lerp(45, 75, reveal)} opacity={0.8} />}
				{beat === 3 && <Zone s={s} a={2370} b={2400} color={C.gold} x0={x0} opacity={seg(p, 0, .4)} />}
				{beat === 1 && (<><HLine s={s} v={2400} color={C.green} x0={x0} /><HLine s={s} v={2380} color={C.red} x0={x0} dash="4 6" /></>)}
				{beat === 2 && (<><HLine s={s} v={2370} color={C.red} x0={x0} /><HLine s={s} v={2390} color={C.green} x0={x0} dash="4 6" /></>)}
				{arrows.map((a) => (
					<path key={a.b} d={a.d} fill="none" stroke={a.col} strokeWidth={6} strokeLinecap="round"
						pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw(a.b)} opacity={(beat === 5 ? 0.35 : focus(a.b))} />
				))}
				{beat === 5 && <Tag x={s.x(60)} y={s.y(2350)} text="desenlace: se revisa después" color={C.text} bg={C.panel} opacity={seg(p, .5, .8)} />}
			</Svg>
			<div style={{position: 'absolute', left: 1290, top: 20, width: 570, display: 'flex', flexDirection: 'column', gap: 14}}>
				{cards.map((c) => (
					<Card key={c.b} title={c.t} color={c.col} opacity={draw(c.b) * (beat === c.b || beat >= 4 ? 1 : 0.55) + 0}
						body={<span style={{whiteSpace: 'pre-line', fontSize: 22}}>{c.body}</span>} style={{padding: '14px 22px'}} />
				))}
			</div>
		</>
	);
};

// =============================================================== 4.2-a Drawdown
const EQ = (() => {
	const r = rng(61);
	const anchors: [number, number][] = [[0, 100], [40, 130], [70, 97.5], [119, 140]];
	const out = pathFrom(anchors, 120, 0, 1).map((v, i) => v + (r() - 0.5) * 2.2 * Math.min(1, i / 5));
	out[0] = 100; out[40] = 131; out[70] = 97.5;
	return out;
})();

export const Drawdown: React.FC<SceneProps> = ({beat, p}) => {
	if (beat <= 1) {
		const n = beat === 0 ? Math.round(lerp(2, 60, ease(p))) : Math.round(lerp(60, 120, seg(p, 0, .8)));
		const top = makeScale(1780, 430, 120, 90, 145);
		const bot = makeScale(1780, 190, 120, -30, 2);
		const peaks: number[] = [];
		EQ.forEach((v, i) => peaks.push(Math.max(v, i ? peaks[i - 1] : v)));
		const dd = EQ.map((v, i) => (v / peaks[i] - 1) * 100);
		const line = (arr: number[], sc: typeof top) => arr.slice(0, n).map((v, i) => `${i ? 'L' : 'M'} ${sc.x(i)} ${sc.y(v)}`).join(' ');
		const under = `${line(EQ, top)} ${peaks.slice(0, n).map((v, i) => `L ${top.x(n - 1 - i)} ${top.y(peaks[n - 1 - i])}`).join(' ')} Z`;
		const imin = dd.slice(0, n).reduce((a, v, i) => (v < dd[a] ? i : a), 0);
		return (
			<>
				<Svg w={1780} h={430} x={70} y={0}>
					<Grid s={top} yMin={90} yMax={145} every={10} />
					<path d={under} fill={C.red} opacity={0.22} />
					<path d={line(peaks, top)} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="10 8" />
					<path d={line(EQ, top)} fill="none" stroke={C.blue} strokeWidth={4} />
					<Tag x={40} y={30} text="capital" color={C.blue} anchor="start" />
					<Tag x={190} y={30} text="último máximo" color={C.gold} anchor="start" />
				</Svg>
				{beat === 1 && (
					<Svg w={1780} h={190} x={70} y={460}>
						<Grid s={bot} yMin={-30} yMax={0} every={10} />
						<path d={`${line(dd, bot)} L ${bot.x(n - 1)} ${bot.y(0)} L ${bot.x(0)} ${bot.y(0)} Z`} fill={C.red} opacity={0.5} />
						<Tag x={40} y={24} text="drawdown %" color={C.red} anchor="start" size={20} />
						{n > 70 && <Tag x={bot.x(imin)} y={bot.y(dd[imin]) - 30} text={`máximo ${fmt(dd[imin], 0)} %`} color={C.text} bg={C.panel} size={21} />}
					</Svg>
				)}
			</>
		);
	}
	const pairs = [0.1, 0.25, 0.5];
	const shown = beat === 2 ? 1 : 3;
	const scale = 4.0;
	return (
		<>
			{pairs.slice(0, shown).map((L, i) => {
				const g = beat === 2 || (beat === 3 && i > 0) ? seg(p, i === 0 ? 0 : (i - 1) * 0.3, (i === 0 ? 0 : (i - 1) * 0.3) + 0.4) : 1;
				const gain = L / (1 - L);
				const x = 230 + i * 520;
				return (
					<div key={L} style={{position: 'absolute', left: x, top: 0, width: 420, height: 600}}>
						<div style={{position: 'absolute', left: 30, bottom: 70, width: 140, height: L * 100 * scale * g, background: C.red, borderRadius: 8}} />
						<div style={{position: 'absolute', left: 210, bottom: 70, width: 140, height: gain * 100 * scale * g, background: C.green, borderRadius: 8}} />
						<div style={{position: 'absolute', left: 30, width: 140, bottom: 80 + L * 100 * scale * g, textAlign: 'center', fontSize: 34, fontWeight: 800, color: C.red}}>−{fmt(L * 100, 0)} %</div>
						<div style={{position: 'absolute', left: 210, width: 140, bottom: 80 + gain * 100 * scale * g, textAlign: 'center', fontSize: 34, fontWeight: 800, color: C.green, opacity: g}}>+{fmt(gain * 100, gain < 0.2 ? 1 : 0)} %</div>
						<div style={{position: 'absolute', left: 0, right: 40, bottom: 20, textAlign: 'center', fontSize: 22, color: C.muted}}>pérdida → ganancia necesaria</div>
					</div>
				);
			})}
			{beat === 4 && (
				<div style={{position: 'absolute', left: 80, top: 10, width: 420, opacity: seg(p, 0, .4)}}>
					<Card title="Límites que protegen" color={C.gold} body={<>Riesgo por operación<br />Pérdida máxima por sesión<br />Pausa tras una racha</>} />
				</div>
			)}
		</>
	);
};

// =============================================================== 4.3-a Tasa de acierto y esperanza
const SIM = (() => {
	const r = rng(77);
	const a: number[] = [0];
	const b: number[] = [0];
	for (let i = 0; i < 100; i++) {
		a.push(a[i] + (r() < 0.4 ? 3 : -1) - 0.1);
		b.push(b[i] + (r() < 0.7 ? 0.5 : -1) - 0.1);
	}
	return {a, b};
})();

const Tokens: React.FC<{wins: number; win: string; loss: string; g: number; y: number; label: string; color: string}> = ({wins, win, loss, g, y, label, color}) => (
	<div style={{position: 'absolute', left: 80, top: y, display: 'flex', alignItems: 'center', gap: 16}}>
		<div style={{width: 230, fontSize: 30, fontWeight: 800, color}}>{label}</div>
		{Array.from({length: 10}).map((_, i) => {
			const k = interpolate(g * 10 - i, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
			const w = i < wins;
			return (
				<div key={i} style={{width: 108, height: 108, borderRadius: 54, background: w ? C.green : C.red, opacity: k, transform: `scale(${0.6 + 0.4 * k})`,
					display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 27, fontWeight: 800, color: C.bg}}>{w ? win : loss}</div>
			);
		})}
	</div>
);

export const Expectancy: React.FC<SceneProps> = ({beat, p}) => {
	if (beat <= 3) {
		const fA = beat === 1 ? seg(p, 0, .4) : beat > 1 ? 1 : 0;
		const fB = beat === 3 ? seg(p, 0, .4) : 0;
		return (
			<>
				<Tokens wins={4} win="+3R" loss="−1R" g={beat === 0 ? seg(p, 0, .8) : 1} y={30} label="Estrategia A" color={C.blue} />
				<div style={{position: 'absolute', left: 330, top: 160, fontSize: 34, opacity: fA}}>
					0,4 × 3 − 0,6 × 1 = <b style={{color: C.green}}>+0,6R</b> por operación
				</div>
				{beat >= 2 && <Tokens wins={7} win="+0,5R" loss="−1R" g={beat === 2 ? seg(p, 0, .8) : 1} y={300} label="Estrategia B" color={C.purple} />}
				<div style={{position: 'absolute', left: 330, top: 430, fontSize: 34, opacity: fB}}>
					0,7 × 0,5 − 0,3 × 1 = <b style={{color: C.gold}}>+0,05R</b> por operación
				</div>
			</>
		);
	}
	if (beat === 4) {
		const rows = [
			{n: 'A', col: C.blue, gross: 0.6, net: 0.5},
			{n: 'B', col: C.purple, gross: 0.05, net: -0.05},
		];
		const g = seg(p, 0.2, 0.7);
		const zero = 960;
		const k = 900;
		return (
			<>
				<div style={{position: 'absolute', left: zero, top: 20, bottom: 40, width: 3, background: C.muted}} />
				{rows.map((r, i) => {
					const v = lerp(r.gross, r.net, g);
					return (
						<div key={r.n}>
							<div style={{position: 'absolute', left: 260, top: 110 + i * 240, fontSize: 32, fontWeight: 800, color: r.col}}>Estrategia {r.n}</div>
							<div style={{position: 'absolute', top: 90 + i * 240, height: 90, borderRadius: 8, background: v >= 0 ? C.green : C.red,
								left: v >= 0 ? zero : zero + v * k, width: Math.abs(v) * k + 2}} />
							<div style={{position: 'absolute', top: 110 + i * 240, left: v >= 0 ? zero + v * k + 20 : zero + 20, fontSize: 34, fontWeight: 800, color: v >= 0 ? C.green : C.red}}>
								{fmt(v, 2, true)}R
							</div>
						</div>
					);
				})}
				<div style={{position: 'absolute', left: 260, top: 560, fontSize: 26, color: C.muted, opacity: g}}>después de descontar 0,1R de costo por operación</div>
			</>
		);
	}
	const s = makeScale(1780, 620, 101, -20, 40);
	const n = Math.round(lerp(2, 101, seg(p, 0, .85)));
	const line = (arr: number[]) => arr.slice(0, n).map((v, i) => `${i ? 'L' : 'M'} ${s.x(i)} ${s.y(v)}`).join(' ');
	return (
		<Svg w={1780} h={620} x={70} y={20}>
			<Grid s={s} yMin={-20} yMax={40} every={20} />
			<line x1={20} x2={s.w - 100} y1={s.y(0)} y2={s.y(0)} stroke={C.muted} strokeWidth={2} />
			<path d={line(SIM.a)} fill="none" stroke={C.blue} strokeWidth={4} />
			<path d={line(SIM.b)} fill="none" stroke={C.purple} strokeWidth={4} />
			<Tag x={40} y={30} text="A · 40 % de acierto" color={C.blue} anchor="start" />
			<Tag x={40} y={66} text="B · 70 % de acierto" color={C.purple} anchor="start" />
			<Tag x={s.x(100) - 10} y={s.y(-17)} text="100 operaciones simuladas, resultado en R tras costos" color={C.muted} anchor="end" size={19} />
		</Svg>
	);
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
	'1.4-a': LongShort, '2.2-b': Oco, '3.1-a': SupRes, '3.1-b': Breakout, '3.4-a': Scenarios, '4.2-a': Drawdown, '4.3-a': Expectancy,
};
export {FONT};
