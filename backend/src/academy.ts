import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance, FastifyRequest } from 'fastify';

/** Cápsulas de la Academia: catálogo y medios generados en content/academia/capsulas (ver INDICE.md). */
type Capsule = {
  id: string; title: string; topic: string; objective: string; durationSec: number; narrated: boolean;
  video: string; subtitles: string; pdf: string;
};
/** manual: PDF completo del nivel (todos los temas del plan), si existe. */
type Level = { level: number; name: string; folder: string; free: boolean; priceUsdt: number | null; manual?: string | null; capsules: Capsule[] };
type Manifest = { levels: Level[] };

const KINDS = { video: 'video', subtitles: 'subtitles', pdf: 'pdf' } as const;
type Kind = keyof typeof KINDS;

export const defaultAcademyRoot = fileURLToPath(new URL('../../content/academia/capsulas/', import.meta.url));

/** SRT -> WebVTT: los navegadores solo aceptan VTT en <track>. */
export function srtToVtt(srt: string): string {
  return 'WEBVTT\n\n' + srt.replace(/\r/g, '').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2').trim() + '\n';
}

/** isAdmin decide en el servidor (por sesión e ID de usuario) si se desbloquean los niveles de pago. */
export function registerAcademy(app: FastifyInstance, options: { root?: string; isAdmin?: (request: FastifyRequest) => Promise<boolean> } = {}) {
  const isAdmin = async (request: FastifyRequest) => (options.isAdmin ? options.isAdmin(request).catch(() => false) : false);
  const root = path.resolve(options.root ?? process.env.ACADEMY_CONTENT_DIR ?? defaultAcademyRoot);
  let cached: Manifest | undefined;
  const manifest = async () => (cached ??= JSON.parse(await readFile(path.join(root, 'catalogo.json'), 'utf8')) as Manifest);

  const mediaUrl = (id: string, kind: Kind) => `/api/academy/media/${encodeURIComponent(id)}/${kind}`;

  app.get('/api/academy', async (request, reply) => {
    let data: Manifest;
    try { data = await manifest(); } catch { return reply.code(503).send({ message: 'El contenido de la Academia no está disponible.' }); }
    const admin = await isAdmin(request);
    // La respuesta depende de la sesión: no debe compartirse en cachés.
    reply.header('Cache-Control', 'private, no-store');
    return {
      admin,
      levels: data.levels.map(level => {
        // Solo niveles gratuitos (o un administrador) exponen sus medios: aún no existe compra ni matrícula.
        const unlocked = level.free || admin;
        return {
          level: level.level, name: level.name, free: level.free, priceUsdt: level.priceUsdt, unlocked,
          hasManual: Boolean(level.manual),
          manual: unlocked && level.manual ? `/api/academy/manual/${level.level}` : null,
          capsules: level.capsules.map(c => ({
            id: c.id, title: c.title, topic: c.topic, objective: c.objective, durationSec: c.durationSec, narrated: c.narrated,
            media: unlocked ? { video: mediaUrl(c.id, 'video'), subtitles: mediaUrl(c.id, 'subtitles'), pdf: mediaUrl(c.id, 'pdf') } : null,
          })),
        };
      }),
    };
  });

  app.get<{ Params: { level: string } }>('/api/academy/manual/:level', async (request, reply) => {
    let data: Manifest;
    try { data = await manifest(); } catch { return reply.code(503).send({ message: 'El contenido de la Academia no está disponible.' }); }
    const level = data.levels.find(l => String(l.level) === request.params.level);
    if (!level?.manual) return reply.code(404).send({ message: 'Recurso no encontrado.' });
    if (!level.free && !(await isAdmin(request))) return reply.code(403).send({ message: 'Este nivel estará disponible al adquirirlo.' });
    const file = path.resolve(root, level.folder, level.manual);
    if (!file.startsWith(root + path.sep)) return reply.code(404).send({ message: 'Recurso no encontrado.' });
    let size: number;
    try { size = (await stat(file)).size; } catch { return reply.code(404).send({ message: 'Recurso no encontrado.' }); }
    return reply.header('Cache-Control', 'private, max-age=3600').type('application/pdf')
      .header('Content-Disposition', `inline; filename="${level.manual}"`).header('Content-Length', size).send(createReadStream(file));
  });

  app.get<{ Params: { id: string; kind: string } }>('/api/academy/media/:id/:kind', {
    // Un video se pide por rangos al reproducir y al saltar; el límite general sería demasiado bajo.
    config: { rateLimit: { max: 600, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const { id, kind } = request.params;
    let data: Manifest;
    try { data = await manifest(); } catch { return reply.code(503).send({ message: 'El contenido de la Academia no está disponible.' }); }
    const level = data.levels.find(l => l.capsules.some(c => c.id === id));
    const capsule = level?.capsules.find(c => c.id === id);
    if (!level || !capsule || !(kind in KINDS)) return reply.code(404).send({ message: 'Recurso no encontrado.' });
    if (!level.free && !(await isAdmin(request))) return reply.code(403).send({ message: 'Este nivel estará disponible al adquirirlo.' });

    // Solo nombres del manifiesto, y nunca fuera de la carpeta de contenido.
    const file = path.resolve(root, level.folder, capsule[kind as Kind]);
    if (!file.startsWith(root + path.sep)) return reply.code(404).send({ message: 'Recurso no encontrado.' });
    let size: number;
    try { size = (await stat(file)).size; } catch { return reply.code(404).send({ message: 'Recurso no encontrado.' }); }

    reply.header('Cache-Control', 'private, max-age=3600');
    if (kind === 'subtitles') return reply.type('text/vtt; charset=utf-8').send(srtToVtt(await readFile(file, 'utf8')));
    if (kind === 'pdf') {
      return reply.type('application/pdf').header('Content-Disposition', `inline; filename="${capsule.pdf}"`)
        .header('Content-Length', size).send(createReadStream(file));
    }
    reply.type('video/mp4').header('Accept-Ranges', 'bytes');
    const range = request.headers.range;
    if (!range) return reply.header('Content-Length', size).send(createReadStream(file));
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    let start = match?.[1] ? Number(match[1]) : NaN;
    let end = match?.[2] ? Number(match[2]) : size - 1;
    if (match && !match[1] && match[2]) { start = Math.max(0, size - Number(match[2])); end = size - 1; }
    if (!match || Number.isNaN(start) || start > end || start >= size) {
      return reply.code(416).header('Content-Range', `bytes */${size}`).send();
    }
    end = Math.min(end, size - 1);
    return reply.code(206).header('Content-Range', `bytes ${start}-${end}/${size}`).header('Content-Length', end - start + 1)
      .send(createReadStream(file, { start, end }));
  });
}
