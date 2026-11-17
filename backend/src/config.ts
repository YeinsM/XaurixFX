import { existsSync } from 'node:fs';

export function readConfig(environment: NodeJS.ProcessEnv = process.env) {
  if (environment === process.env && existsSync('.env')) process.loadEnvFile();
  const databaseUrl = environment.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required. Copy backend/.env.example to backend/.env.');
  const origin = environment.FRONTEND_ORIGIN ?? environment.APP_ORIGIN ?? 'http://localhost:5173';
  if (new URL(origin).origin !== origin) throw new Error('FRONTEND_ORIGIN must be an exact origin without a trailing slash.');
  const port = Number(environment.PORT ?? '4000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
  return {
    databaseUrl,
    origin,
    port,
    host: environment.HOST ?? '127.0.0.1',
    secureCookies: environment.NODE_ENV === 'production',
    geminiApiKey: environment.GEMINI_API_KEY?.trim() || undefined,
    goldPriceApiKey: environment.GOLDPRICE_API_KEY?.trim() || undefined,
    geminiModel: environment.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen',
  };
}
