// Renderiza las cápsulas Remotion a ../nivel-N/<id>-<slug>.mp4 y genera su .srt.
// Uso: node render.mjs [id ...]
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const timings = JSON.parse(readFileSync(path.join(here, 'src/timings.json'), 'utf8'));
const caps = JSON.parse(readFileSync(path.join(here, 'src/capsules.json'), 'utf8')).map((c) => {
	const t = timings[c.id];
	return t && t.length === c.beats.length ? {...c, beats: c.beats.map((b, i) => ({...b, secs: t[i]}))} : c;
});
const LEVELS = {1: 'nivel-1-trading-desde-cero', 2: 'nivel-2-plataformas-y-ejecucion', 3: 'nivel-3-analisis-tecnico-fundamental-macro',
	4: 'nivel-4-riesgo-y-psicologia'};
const INTRO = 3;
const args = process.argv.slice(2);
const stills = args.includes('--stills');
const ids = args.filter((a) => !a.startsWith('--'));
const todo = caps.filter((c) => !ids.length || ids.includes(c.id));

const ts = (s) => {
	const ms = Math.round(s * 1000);
	const p = (n, l = 2) => String(n).padStart(l, '0');
	return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

// El logo se toma directamente de los recursos del frontend.
const serveUrl = await bundle({entryPoint: path.join(here, 'src/index.ts'), publicDir: path.join(here, '../../../../frontend/public/images')});
for (const c of todo) {
	const id = `c${c.id.replace(/[.]/g, '-')}`;
	const composition = await selectComposition({serveUrl, id});
	const dir = path.join(here, '..', LEVELS[c.level]);
	mkdirSync(dir, {recursive: true});
	const base = path.join(dir, `${c.id}-${c.slug}`);
	if (stills) {
		// Un fotograma al final de cada tramo, para revisión.
		const out = path.join(here, 'out');
		mkdirSync(out, {recursive: true});
		let t = INTRO;
		for (const [k, b] of c.beats.entries()) {
			t += b.secs;
			await renderStill({serveUrl, composition, frame: Math.round((t - 0.1) * 30), output: path.join(out, `${c.id}_${k}.png`), scale: 0.5});
		}
		console.log('stills', c.id);
		continue;
	}
	await renderMedia({serveUrl, composition, codec: 'h264', outputLocation: `${base}.mp4`, crf: 20});
	let t = INTRO;
	const srt = c.beats.map((b, i) => {
		const line = `${i + 1}\n${ts(t)} --> ${ts(t + b.secs)}\n${b.text}\n`;
		t += b.secs;
		return line;
	}).join('\n');
	writeFileSync(`${base}.srt`, srt + '\n', 'utf8');
	console.log('ok', c.id);
}
