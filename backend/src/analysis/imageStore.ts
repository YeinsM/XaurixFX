import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';

/**
 * Almacenamiento de binarios de imágenes. Hoy es disco local; para la nube basta
 * con otra implementación (S3, GCS, R2…) que cumpla esta interfaz.
 */
export interface ImageStore {
  put(key: string, data: Buffer, mimeType: string): Promise<void>;
  get(key: string): Promise<Buffer | undefined>;
}

const SAFE_KEY = /^[a-z0-9][a-z0-9/_.-]*$/i;

export function createLocalImageStore(directory: string): ImageStore {
  const root = resolve(directory);
  const pathFor = (key: string) => {
    // Impide rutas fuera del directorio raíz.
    if (!SAFE_KEY.test(key) || key.includes('..')) throw new Error('Invalid image key');
    const path = resolve(root, key);
    if (!path.startsWith(root + sep)) throw new Error('Invalid image key');
    return path;
  };
  return {
    async put(key, data) {
      const path = pathFor(key);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, data);
    },
    async get(key) {
      try { return await readFile(pathFor(key)); }
      catch (error) {
        if ((error as { code?: string })?.code === 'ENOENT') return undefined;
        throw error;
      }
    },
  };
}
