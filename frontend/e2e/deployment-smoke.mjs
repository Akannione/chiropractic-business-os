import { chromium } from '@playwright/test';

const baseUrl = process.env.E2E_DEPLOYMENT_URL;
const apiDeploymentUrl = process.env.E2E_API_DEPLOYMENT_URL;
if (!baseUrl) throw new Error('Set E2E_DEPLOYMENT_URL to the authorized frontend deployment URL.');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (response.status() >= 500) errors.push(`HTTP ${response.status()} ${response.url()}`);
});

try {
  const deployment = new URL(baseUrl);
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
  // Frontend previews intentionally proxy /api to the canonical API. When a
  // branch API preview is supplied, validate that deployment directly so
  // branch-only routes and cache headers are tested without changing preview
  // routing or weakening Vercel Deployment Protection.
  let apiOrigin = new URL(baseUrl).origin;
  if (apiDeploymentUrl) {
    const apiBootstrap = await page.request.get(apiDeploymentUrl);
    if (!apiBootstrap.ok()) throw new Error(`API preview access bootstrap returned HTTP ${apiBootstrap.status()}.`);
    apiOrigin = new URL(apiDeploymentUrl).origin;
  }

  const health = await page.request.get(`${apiOrigin}/api/health`);
  if (!health.ok()) throw new Error(`Deployment API health returned HTTP ${health.status()}.`);
  if (!health.headers()['cache-control']?.includes('no-store')) {
    throw new Error('Deployment API responses must include Cache-Control: no-store.');
  }
  const authStatus = await page.request.get(`${apiOrigin}/api/auth/status`);
  if (!authStatus.ok()) throw new Error(`Deployment auth status returned HTTP ${authStatus.status()}.`);
  const config = await page.request.get(`${apiOrigin}/api/config`);
  if (!config.ok()) throw new Error(`Deployment config returned HTTP ${config.status()}.`);

  if (apiDeploymentUrl) {
    const intelligence = await page.request.post(`${apiOrigin}/api/intelligence/preview`, {
      data: {
        files: [{
          name: 'Appointments Smoke.csv',
          csvText: 'Patient,Appointment Date,Status,Provider\\nSynthetic Patient,2026-09-30,No Show,Dr. Demo',
        }],
      },
    });
    if (!intelligence.ok()) throw new Error(`Branch Intelligence preview returned HTTP ${intelligence.status()}.`);
    const result = await intelligence.json();
    if (result?.summary?.recognizedReports !== 1 || !Array.isArray(result?.signals) || result.signals.length === 0) {
      throw new Error('Branch Intelligence preview did not return the expected recognized synthetic report and signal.');
    }
  }

  await page.getByText('Good to see you.').waitFor();
  for (const name of ['Patient Inquiries', 'Pipeline', 'Intelligence', 'Import & Export', 'Settings']) {
    await page.getByRole('button', { name, exact: true }).click();
  }
  await page.goto(`${deployment.origin}/intake`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.getByText(/Tell the Practice What You Need/i).waitFor();
  if (errors.length) throw new Error(`Deployment smoke errors:\n${errors.join('\n')}`);
  console.log(`Deployment smoke passed: shell, core workspaces, public intake${apiDeploymentUrl ? ', and branch API' : ''}.`);
} finally {
  await browser.close();
}
