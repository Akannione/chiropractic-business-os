import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const frontendConfig = JSON.parse(readFileSync(new URL('../frontend/vercel.json', import.meta.url), 'utf8'));
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

for (const [label, candidate] of [['root', config], ['frontend', frontendConfig]]) {
  const securityHeaders = new Map((candidate.headers?.[0]?.headers || []).map(({ key, value }) => [key, value]));
  assert.equal(securityHeaders.get('X-Content-Type-Options'), 'nosniff', `${label} config must disable MIME sniffing`);
  assert.equal(securityHeaders.get('X-Frame-Options'), 'DENY', `${label} config must block framing`);
  assert.equal(securityHeaders.get('Referrer-Policy'), 'no-referrer', `${label} config must not send referrers`);
  assert.equal(securityHeaders.get('Permissions-Policy'), 'camera=(), microphone=(), geolocation=()', `${label} config must deny unused device permissions`);
  assert.equal(securityHeaders.get('Cross-Origin-Opener-Policy'), 'same-origin', `${label} config must isolate its browsing context`);
  const csp = securityHeaders.get('Content-Security-Policy') || '';
  assert.match(csp, /base-uri 'self'/, `${label} CSP must constrain base URLs`);
  assert.match(csp, /frame-ancestors 'none'/, `${label} CSP must block framing`);
  assert.match(csp, /object-src 'none'/, `${label} CSP must block plugin objects`);
  assert.match(csp, /script-src 'self'/, `${label} CSP must keep script execution same-origin`);
  assert.match(csp, /connect-src 'self' https:\/\/us\.i\.posthog\.com/, `${label} CSP must allow only the approved analytics collector in addition to same-origin connections`);
}

assert.deepEqual(frontendConfig.rewrites, config.rewrites, 'Root and frontend Vercel rewrites must remain identical.');
