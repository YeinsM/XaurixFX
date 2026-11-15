import { existsSync } from 'node:fs';

export function readConfig() {
  if (existsSync('.env')) process.loadEnvFile();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required. Copy backend/.env.example to backend/.env.');
  const origin = process.env.FRONTEND_ORIGIN ?? process.env.APP_ORIGIN ?? 'http://localhost:5173';
  if (new URL(origin).origin !== origin) throw new Error('FRONTEND_ORIGIN must be an exact origin without a trailing slash.');
  const port = Number(process.env.PORT ?? '4000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
  return { databaseUrl, origin, port, host: process.env.HOST ?? '127.0.0.1', secureCookies: process.env.NODE_ENV === 'production' };
}
