import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

// Fixed, versioned parameters prevent untrusted hashes from requesting arbitrary work.
const parameters = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, parameters, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt-v1$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const match = /^scrypt-v1\$([a-f0-9]{32})\$([a-f0-9]{128})$/.exec(stored);
  if (!match) return false;
  const key = await derive(password, Buffer.from(match[1]!, 'hex'));
  return timingSafeEqual(key, Buffer.from(match[2]!, 'hex'));
}

export function hashSession(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function newSession(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashSession(token) };
}
