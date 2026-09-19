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
