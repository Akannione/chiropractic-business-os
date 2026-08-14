import crypto from 'node:crypto';
import { env } from '../config/env.js';

const tokenTtlMs = 1000 * 60 * 60 * 12;

function sign(payload: string) {
  return crypto.createHmac('sha256', env.authTokenSecret).update(payload).digest('hex');
}

export function isAuthEnabled() {
  return Boolean(env.adminPassword);
}

export function createAuthToken() {
  const expiresAt = Date.now() + tokenTtlMs;
  const payload = `admin:${expiresAt}`;
  return `admin.${expiresAt}.${sign(payload)}`;
}

export function verifyAuthToken(token: string) {
  const [subject, expiresAtText, signature] = token.split('.');
  if (subject !== 'admin' || !expiresAtText || !signature) return false;
  const payload = `${subject}:${expiresAtText}`;
  const expected = sign(payload);
  const expiresAt = Number(expiresAtText);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) && expiresAt > Date.now();
}

/**
 * Compares digests rather than the raw values.
 *
 * timingSafeEqual requires equal-length buffers, so the previous length check
 * had to run first and returned early on a mismatch, revealing the configured
 * password's length. Hashing both sides yields fixed-width buffers, so one
 * constant-time comparison covers length and content together.
 */
export function validateAdminPassword(password: string) {
  if (!isAuthEnabled()) return false;
  const supplied = crypto.createHash('sha256').update(password).digest();
  const expected = crypto.createHash('sha256').update(env.adminPassword).digest();
  return crypto.timingSafeEqual(supplied, expected);
}
