import { pathToFileURL } from 'node:url';

export function validateDemoResponses({ health, config, auth }) {
  if (health?.ok !== true) throw new Error('API health check failed.');
  if (config?.demoMode !== true) throw new Error('Demo mode is not enabled. Do not demonstrate with real data.');
  if (typeof auth?.authEnabled !== 'boolean') throw new Error('Authentication status is unavailable.');
  if (!Array.isArray(config.statuses) || !config.statuses.length) throw new Error('Practice configuration is incomplete.');
  return auth.authEnabled ? 'Staff login is required.' : 'Open fake-data demo: no staff password required.';
}

async function get(url, json = true) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000), redirect: 'error' });
  if (!response.ok) throw new Error(`Request failed: ${url} (HTTP ${response.status})`);
  if (json) return response.json();
  if (!response.headers.get('content-type')?.includes('text/html')) throw new Error('Website did not return HTML.');
  await response.body?.cancel();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const base = new URL(process.env.CBOS_DEMO_URL || 'https://businessosmvp.vercel.app');
    if (base.username || base.password || base.search || base.hash) throw new Error('Use a base URL without credentials or query parameters.');
    if (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname))) throw new Error('Use HTTPS, or HTTP on localhost.');
    await get(new URL('/', base), false);
    const health = await get(new URL('/api/health', base));
    const config = await get(new URL('/api/config', base));
    const auth = await get(new URL('/api/auth/status', base));
    console.log(validateDemoResponses({ health, config, auth }));
    console.log('Demo preflight passed: website, proxied API health, configuration and demo mode.');
    console.log('Only use fictional data. This does not verify existing records, browser rendering or real-data readiness.');
  } catch (error) {
    console.error(`Demo preflight failed: ${error.message}`);
    process.exitCode = 1;
  }
}
