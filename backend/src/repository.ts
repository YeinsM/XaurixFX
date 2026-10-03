import type { Pool, PoolClient } from 'pg';
import { hashSession, newSession } from './security.js';

export interface User { id: string; name: string; email: string }
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

async function insertSession(client: Pool | PoolClient, userId: string) {
  const session = newSession();
  await client.query(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + $3 * interval '1 second')",
    [session.hash, userId, SESSION_SECONDS],
  );
  return session.token;
}

export async function registerUser(pool: Pool, name: string, email: string, passwordHash: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query<User>(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash],
    );
    const user = result.rows[0]!;
    await client.query('INSERT INTO accounts (user_id) VALUES ($1)', [user.id]);
    const token = await insertSession(client, user.id);
    await client.query('COMMIT');
    return { user, token };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function findUserByEmail(pool: Pool, email: string) {
  const result = await pool.query<User & { password_hash: string }>('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function createSession(pool: Pool, userId: string) {
  return insertSession(pool, userId);
}

export async function getSessionUser(pool: Pool, token?: string): Promise<User | undefined> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return undefined;
  const result = await pool.query<User>(
    'SELECT u.id, u.name, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now()',
    [hashSession(token)],
  );
  return result.rows[0];
}

export async function revokeSession(pool: Pool, token?: string) {
  if (token) await pool.query('UPDATE sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL', [hashSession(token)]);
}

export async function updateProfile(pool: Pool, userId: string, name: string): Promise<User> {
  const result = await pool.query<User>('UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email', [name, userId]);
  return result.rows[0]!;
}

export async function getAccount(pool: Pool, userId: string) {
  const result = await pool.query(
    `SELECT id, currency, balance::text, principal::text, profit::text,
     return_percent::text AS "returnPercent", participation_percent::text AS "participationPercent",
     valuation_at AS "valuationAt", target_date::text AS "targetDate", status
     FROM accounts WHERE user_id = $1`, [userId],
  );
  return result.rows[0];
}
