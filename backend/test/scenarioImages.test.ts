import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalImageStore } from '../src/analysis/imageStore.js';
import { buildScenarioImagePrompt, extractScenarioText, generateScenarioImages, type ScenarioImageRepository } from '../src/analysis/scenarioImages.js';
import type { AnalysisRecord } from '../src/analysis/types.js';

const report = `## 3. PLAN DE ENTRADA
### Escenario A: compra
Entrada 3845–3848, SL 3830, TP1 3870, TP2 3885, TP3 3900.

### Escenario B: venta
Entrada 3820, SL 3835, TP1 3800, TP2 3790, TP3 3775.

| Escenario | Dirección | Entrada | SL |
|---|---|---|---|
| A | Compra | 3845 | 3830 |
| B | Venta | 3820 | 3835 |

Preferencia actual: A.`;

test('extracts each scenario block with its own table row only', () => {
  const a = extractScenarioText(report, 'A')!;
  assert.match(a, /SL 3830/);
  assert.doesNotMatch(a, /SL 3835/);
  assert.match(a, /\| A \| Compra/);
  assert.doesNotMatch(a, /\| B \| Venta/);
  const b = extractScenarioText(report, 'B')!;
  assert.match(b, /SL 3835/);
  assert.doesNotMatch(b, /Preferencia/);
  assert.match(b, /\| B \| Venta/);
  assert.equal(extractScenarioText('Sin escenarios', 'A'), undefined);
  assert.match(buildScenarioImagePrompt(a, 'A'), /Stop Loss[\s\S]*Escenario A:\n### Escenario A/);
});

test('generates scenario A image before B, stores them and skips ready ones', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'xaurix-images-'));
  try {
    const store = createLocalImageStore(directory);
    const saved: Parameters<ScenarioImageRepository['save']>[0][] = [];
    const repository: ScenarioImageRepository = { list: async () => saved.map(row => ({ scenario: row.scenario, status: row.status })), save: async row => { saved.push(row); } };
    const prompts: string[] = [];
    const record = { analysisDate: '2026-11-17', status: 'published', report: { rawText: report } } as AnalysisRecord;
    const generateImage = async (prompt: string) => { prompts.push(prompt); return { data: Buffer.from('png'), mimeType: 'image/png' }; };
    await generateScenarioImages(record, { generateImage, store, repository, model: 'img' });
    assert.equal(prompts.length, 2);
    assert.match(prompts[0]!, /Escenario A/);
    assert.match(prompts[1]!, /Escenario B/);
    assert.deepEqual(saved.map(row => [row.scenario, row.status, row.storageKey]), [
      ['A', 'ready', 'analysis/2026-11-17/scenario-A.png'], ['B', 'ready', 'analysis/2026-11-17/scenario-B.png'],
    ]);
    assert.equal((await store.get('analysis/2026-11-17/scenario-B.png'))?.toString(), 'png');
    await generateScenarioImages(record, { generateImage, store, repository, model: 'img' });
    assert.equal(prompts.length, 2);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('records a failed image without stopping the next scenario', async () => {
  const saved: { scenario: string; status: string; errorMessage?: string }[] = [];
  let calls = 0;
  await generateScenarioImages({ analysisDate: '2026-11-17', status: 'published', report: { rawText: report } } as AnalysisRecord, {
    generateImage: async () => { calls += 1; if (calls === 1) throw new Error('cuota'); return { data: Buffer.from('x'), mimeType: 'image/png' }; },
    store: { put: async () => {}, get: async () => undefined },
    repository: { list: async () => [], save: async row => { saved.push(row); } },
    model: 'img',
  });
  assert.deepEqual(saved.map(row => [row.scenario, row.status, row.errorMessage]), [['A', 'failed', 'cuota'], ['B', 'ready', undefined]]);
});

test('local image store rejects keys outside its directory', async () => {
  const store = createLocalImageStore(join(tmpdir(), 'xaurix-store-check'));
  await assert.rejects(store.put('../evil.png', Buffer.from(''), 'image/png'));
  await assert.rejects(store.get('analysis/../../evil.png'));
});

test('already attempted image scenarios are not charged again, including previous failures', async () => {
  let calls = 0;
  await generateScenarioImages({ analysisDate: '2026-11-17', status: 'published', report: { rawText: report } } as AnalysisRecord, {
    generateImage: async () => { calls++; throw new Error('must not call Gemini'); },
    store: { put: async () => {}, get: async () => undefined },
    repository: { list: async () => [{ scenario: 'A', status: 'failed' }, { scenario: 'B', status: 'ready' }], save: async () => assert.fail('must not overwrite attempted scenarios') },
    model: 'test',
  });
  assert.equal(calls, 0);
});
