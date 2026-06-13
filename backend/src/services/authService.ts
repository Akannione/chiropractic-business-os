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

export function validateAdminPassword(password: string) {
  if (!isAuthEnabled()) return true;
  if (password.length !== env.adminPassword.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(env.adminPassword));
}
