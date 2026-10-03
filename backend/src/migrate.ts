import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Pool } from 'pg';
import { createPool } from './db.js';
import { readConfig } from './config.js';

export async function migrate(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('xaurixfx_schema_migrations'))");
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, checksum char(64) NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const directory = new URL('../migrations/', import.meta.url);
    const files = (await readdir(directory)).filter(file => /^\d+_[a-z_]+\.sql$/.test(file)).sort();
    for (const version of files) {
      const sql = await readFile(new URL(version, directory), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const applied = await client.query('SELECT checksum FROM schema_migrations WHERE version = $1', [version]);
      if (applied.rowCount) {
        if (applied.rows[0].checksum !== checksum) throw new Error(`Migration checksum mismatch: ${version}`);
        continue;
      }
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)', [version, checksum]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(pathToFileURL(process.argv[1]))) {
  const pool = createPool(readConfig().databaseUrl);
  try {
    await migrate(pool);
    process.stdout.write('Database migrations applied.\n');
  } finally {
    await pool.end();
  }
}
