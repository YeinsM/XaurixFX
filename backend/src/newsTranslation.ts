import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, '../..');
const localPython = process.platform === 'win32' ? join(project, '.local', 'translate-venv', 'Scripts', 'python.exe') : join(project, '.local', 'translate-venv', 'bin', 'python');
const script = join(project, 'backend', 'translation', 'translate.py');

export function translateNews(texts: string[]): Promise<string[]> {
  const python = process.env.NEWS_TRANSLATOR_PYTHON || (existsSync(localPython) ? localPython : 'python');
  return new Promise((resolvePromise, reject) => {
    const child = spawn(python, [script], { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, ARGOS_CHUNK_TYPE: 'MINISBD', PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' } });
    let output = '';
    let errors = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error('La traducción superó el tiempo permitido.')); }, 90_000);
    child.stdout.setEncoding('utf8').on('data', chunk => { output += chunk; if (output.length > 200_000) child.kill(); });
    child.stderr.setEncoding('utf8').on('data', chunk => { errors += chunk; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(errors.slice(-600) || `El traductor terminó con código ${code}.`));
      try {
        const result: unknown = JSON.parse(output);
        if (!Array.isArray(result) || result.length !== texts.length || result.some(value => typeof value !== 'string')) throw new Error('Respuesta de traducción inválida.');
        resolvePromise(result as string[]);
      } catch (error) { reject(error); }
    });
    child.stdin.end(JSON.stringify(texts));
  });
}
