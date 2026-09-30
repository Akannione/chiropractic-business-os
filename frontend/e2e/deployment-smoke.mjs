import { chromium } from '@playwright/test';

const baseUrl = process.env.E2E_DEPLOYMENT_URL;
if (!baseUrl) throw new Error('Set E2E_DEPLOYMENT_URL to the authorized deployment URL.');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (response.status() >= 500) errors.push(`HTTP ${response.status()} ${response.url()}`);
});

try {
  const documentResponse = await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30_000 });
  if (!documentResponse) throw new Error('Deployment did not return a document response.');
  const headers = documentResponse.headers();
  const requiredHeaders = {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'cross-origin-opener-policy': 'same-origin',
  };
  for (const [name, expected] of Object.entries(requiredHeaders)) {
    if (headers[name] !== expected) throw new Error(`Missing or invalid deployment header ${name}.`);
  }
  const csp = headers['content-security-policy'] || '';
  for (const directive of [
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self'",
    "connect-src 'self' https://us.i.posthog.com",
  ]) {
    if (!csp.includes(directive)) throw new Error(`Deployment Content-Security-Policy is missing: ${directive}`);
  }
  const health = await page.request.get(`${new URL(baseUrl).origin}/api/health`);
  if (!health.ok()) throw new Error(`Deployment API health returned HTTP ${health.status()}.`);
  if (!health.headers()['cache-control']?.includes('no-store')) {
    throw new Error('Deployment API responses must include Cache-Control: no-store.');
  }
  await page.getByText('Good to see you.').waitFor();
  for (const name of ['Patient Inquiries', 'Pipeline', 'Intelligence', 'Import & Export', 'Settings']) {
    await page.getByRole('button', { name, exact: true }).click();
  }
  const deployment = new URL(baseUrl);
  await page.goto(`${deployment.origin}/intake`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.getByText(/Tell the Practice What You Need/i).waitFor();
  if (errors.length) throw new Error(`Deployment smoke errors:\n${errors.join('\n')}`);
  console.log('Deployment smoke passed: shell, core workspaces, API responses, and public intake.');
} finally {
  await browser.close();
}
