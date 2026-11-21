import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hashPassword, verifyPassword, newSession, hashSession } from '../src/security.ts';

test('passwords have independent salts and only the correct secret verifies', async () => {
  const a = await hashPassword('a-long-private-password');
  const b = await hashPassword('a-long-private-password');
  assert.notEqual(a, b);
  assert.equal(await verifyPassword('a-long-private-password', a), true);
  assert.equal(await verifyPassword('different-password', a), false);
  assert.equal(await verifyPassword('anything', 'malformed'), false);
  assert.equal(await verifyPassword('anything', 'scrypt$1$1$1$x$x'), false);
});

test('session credentials have 256 bits of entropy and only their digest is stored', () => {
  const a = newSession();
  const b = newSession();
  assert.notEqual(a.token, b.token);
  assert.match(a.token, /^[A-Za-z0-9_-]{43}$/);
  assert.match(a.hash, /^[a-f0-9]{64}$/);
  assert.notEqual(a.token, a.hash);
  assert.equal(hashSession(a.token), a.hash);
});

test('loopback origins accept localhost and 127.0.0.1 on the same port only', async () => {
  const { loopbackOrigins } = await import('../src/app.ts');
  assert.deepEqual(loopbackOrigins('http://localhost:5173'), ['http://localhost:5173', 'http://127.0.0.1:5173']);
  assert.deepEqual(loopbackOrigins('http://127.0.0.1:5173'), ['http://127.0.0.1:5173', 'http://localhost:5173']);
  assert.deepEqual(loopbackOrigins('https://app.example.com'), ['https://app.example.com']);
});
