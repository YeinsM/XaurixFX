import { buildApp } from './app.js';
import { readConfig } from './config.js';
import { createPool } from './db.js';

const config = readConfig();
const pool = createPool(config.databaseUrl);
const app = buildApp({ pool, origin: config.origin, secureCookies: config.secureCookies, logger: true });
pool.on('error', () => app.log.error('Database pool connection failed'));
app.addHook('onClose', async () => { await pool.end(); });
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { void app.close(); });
}
try {
  await app.listen({ host: config.host, port: config.port });
} catch {
  app.log.error('Server could not start; check the host, port, and database configuration.');
  await app.close();
  process.exitCode = 1;
}
