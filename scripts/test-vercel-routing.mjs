import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const rewrites = config.rewrites || [];

assert.deepEqual(
  rewrites[0],
  {
    source: '/api/:path*',
    destination: 'https://cbos-api.vercel.app/api/:path*',
  },
  'The root Vercel project must proxy /api before the SPA fallback.',
);
assert.deepEqual(
  rewrites[1],
  { source: '/(.*)', destination: '/index.html' },
  'The SPA fallback must remain after the API rewrite.',
);

console.log('Vercel routing tests passed.');

const securityHeaders = new Map((config.headers?.[0]?.headers || []).map(({ key, value }) => [key, value]));
assert.equal(securityHeaders.get('X-Content-Type-Options'), 'nosniff');
assert.equal(securityHeaders.get('X-Frame-Options'), 'DENY');
assert.equal(securityHeaders.get('Referrer-Policy'), 'no-referrer');
assert.match(securityHeaders.get('Content-Security-Policy') || '', /frame-ancestors 'none'/);
assert.match(securityHeaders.get('Content-Security-Policy') || '', /object-src 'none'/);
