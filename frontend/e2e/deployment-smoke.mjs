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
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30_000 });
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
