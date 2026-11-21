import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import Fastify from 'fastify';
import { registerAcademy, srtToVtt } from '../src/academy.ts';

async function fixture(isAdmin?: (request: { headers: Record<string, unknown> }) => Promise<boolean>) {
  const root = await mkdtemp(path.join(tmpdir(), 'academy-'));
  const capsule = (id: string) => ({ id, title: id, topic: 't', objective: 'o', durationSec: 30, narrated: false,
    video: `${id}.mp4`, subtitles: `${id}.srt`, pdf: `${id}.pdf` });
  await writeFile(path.join(root, 'catalogo.json'), JSON.stringify({ levels: [
    { level: 1, name: 'Gratis', folder: 'n1', free: true, priceUsdt: null, capsules: [capsule('1.1-a'), { ...capsule('1.1-b'), video: '../../secreto.mp4' }] },
    { level: 3, name: 'Pago', folder: 'n3', free: false, priceUsdt: null, manual: 'manual-nivel-3.pdf', capsules: [capsule('3.1-a')] },
  ] }));
  await mkdir(path.join(root, 'n1'));
  await mkdir(path.join(root, 'n3'));
  await writeFile(path.join(root, 'n1', '1.1-a.mp4'), Buffer.from('0123456789'));
  await writeFile(path.join(root, 'n1', '1.1-a.srt'), '1\n00:00:03,000 --> 00:00:05,500\nHola\n');
  await writeFile(path.join(root, 'n1', '1.1-a.pdf'), '%PDF-1.4');
  await writeFile(path.join(root, 'n3', '3.1-a.mp4'), 'pago');
  await writeFile(path.join(root, 'n3', 'manual-nivel-3.pdf'), '%PDF-manual');
  const app = Fastify();
  registerAcademy(app, { root, isAdmin });
  return app;
}

test('catalog exposes media only for free levels', async () => {
  const app = await fixture();
  const res = await app.inject('/api/academy');
  assert.equal(res.statusCode, 200);
  const { levels } = res.json();
  assert.equal(levels[0].capsules[0].media.video, '/api/academy/media/1.1-a/video');
  assert.equal(levels[1].capsules[0].media, null);
  assert.equal('folder' in levels[0], false);
});

test('free video supports byte ranges', async () => {
  const app = await fixture();
  const full = await app.inject('/api/academy/media/1.1-a/video');
  assert.equal(full.statusCode, 200);
  assert.equal(full.body, '0123456789');
  const part = await app.inject({ url: '/api/academy/media/1.1-a/video', headers: { range: 'bytes=2-4' } });
  assert.equal(part.statusCode, 206);
  assert.equal(part.body, '234');
  assert.equal(part.headers['content-range'], 'bytes 2-4/10');
  const tail = await app.inject({ url: '/api/academy/media/1.1-a/video', headers: { range: 'bytes=-3' } });
  assert.equal(tail.body, '789');
  const bad = await app.inject({ url: '/api/academy/media/1.1-a/video', headers: { range: 'bytes=50-' } });
  assert.equal(bad.statusCode, 416);
});

test('subtitles are served as WebVTT and PDFs inline', async () => {
  const app = await fixture();
  const vtt = await app.inject('/api/academy/media/1.1-a/subtitles');
  assert.match(vtt.headers['content-type'] as string, /^text\/vtt/);
  assert.match(vtt.body, /^WEBVTT\n\n1\n00:00:03\.000 --> 00:00:05\.500/);
  const pdf = await app.inject('/api/academy/media/1.1-a/pdf');
  assert.equal(pdf.headers['content-type'], 'application/pdf');
  assert.equal(srtToVtt('1\r\n00:00:01,000 --> 00:00:02,000\r\nA\r\n'), 'WEBVTT\n\n1\n00:00:01.000 --> 00:00:02.000\nA\n');
});

test('paid levels, unknown ids, kinds and escaping paths are refused', async () => {
  const app = await fixture();
  assert.equal((await app.inject('/api/academy/media/3.1-a/video')).statusCode, 403);
  assert.equal((await app.inject('/api/academy/media/9.9-z/video')).statusCode, 404);
  assert.equal((await app.inject('/api/academy/media/1.1-a/catalogo')).statusCode, 404);
  assert.equal((await app.inject('/api/academy/media/1.1-b/video')).statusCode, 404);
});

test('administrators see paid levels unlocked; everyone else keeps 403', async () => {
  // El servidor decide por la sesión; aquí se simula con una cabecera de prueba.
  const app = await fixture(async request => request.headers['x-test-admin'] === 'yes');
  const asAdmin = (await app.inject({ url: '/api/academy', headers: { 'x-test-admin': 'yes' } })).json();
  assert.equal(asAdmin.admin, true);
  assert.equal(asAdmin.levels[1].unlocked, true);
  assert.equal(asAdmin.levels[1].capsules[0].media.video, '/api/academy/media/3.1-a/video');
  assert.equal((await app.inject({ url: '/api/academy/media/3.1-a/video', headers: { 'x-test-admin': 'yes' } })).statusCode, 200);

  const visitor = await app.inject('/api/academy');
  assert.equal(visitor.json().admin, false);
  assert.equal(visitor.json().levels[1].media, undefined);
  assert.equal(visitor.json().levels[1].capsules[0].media, null);
  assert.equal(visitor.headers['cache-control'], 'private, no-store');
  assert.equal((await app.inject('/api/academy/media/3.1-a/video')).statusCode, 403);
  assert.equal((await app.inject({ url: '/api/academy/media/3.1-a/video', headers: { 'x-test-admin': 'no' } })).statusCode, 403);
});

test('a failing admin check fails closed', async () => {
  const app = await fixture(async () => { throw new Error('db down'); });
  assert.equal((await app.inject('/api/academy/media/3.1-a/video')).statusCode, 403);
  assert.equal((await app.inject('/api/academy')).json().admin, false);
});

test('level manuals follow the same lock as the level', async () => {
  const app = await fixture(async request => request.headers['x-test-admin'] === 'yes');
  const visitor = (await app.inject('/api/academy')).json();
  assert.equal(visitor.levels[1].hasManual, true);
  assert.equal(visitor.levels[1].manual, null);
  assert.equal((await app.inject('/api/academy/manual/3')).statusCode, 403);
  assert.equal((await app.inject('/api/academy/manual/1')).statusCode, 404);
  assert.equal((await app.inject('/api/academy/manual/..')).statusCode, 404);
  const admin = await app.inject({ url: '/api/academy/manual/3', headers: { 'x-test-admin': 'yes' } });
  assert.equal(admin.statusCode, 200);
  assert.equal(admin.headers['content-type'], 'application/pdf');
  assert.equal((await app.inject({ url: '/api/academy', headers: { 'x-test-admin': 'yes' } })).json().levels[1].manual, '/api/academy/manual/3');
});
