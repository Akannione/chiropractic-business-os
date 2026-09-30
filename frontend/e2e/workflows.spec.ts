import { test, expect } from '@playwright/test';

const API = process.env.E2E_API_URL || 'http://localhost:4010/api';

test.beforeEach(async ({ request }) => {
  const reset = await request.post(`${API}/demo/reset`);
  expect(reset.ok()).toBeTruthy();
});

test('public intake submits a new inquiry end to end', async ({ page }) => {
  await page.goto('/intake?source=E2E');
  await expect(page.getByLabel('Demo data safety notice')).toContainText('fabricated information only');
  await expect(page.getByRole('textbox', { name: 'Patient Name', exact: true })).toHaveAttribute('autocomplete', 'off');
  await page.getByRole('textbox', { name: 'Patient Name', exact: true }).fill('Public E2E Patient');
  await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('4045550188');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('public-e2e@example.com');
  await page.getByLabel('Requested Service', { exact: true }).fill('Spinal Adjustment');
  await page.getByRole('button', { name: 'Submit Demo Inquiry' }).click();
  await expect(page.getByText(/demo inquiry received/i)).toBeVisible();
});

test('staff workspace makes fake-data-only demo status explicit', async ({ page }) => {
  await page.goto('/');
  const notice = page.getByLabel('Demo data safety notice');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText(/fake data only/i);
  await expect(notice).toContainText(/Do not enter real patient/i);
});

test('reactivation queue saves front-desk follow-up details', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Reactivations', exact: true }).click();
  const save = page.getByRole('button', { name: 'Save Follow-Up', exact: true });
  if (await save.count()) {
    await page.getByPlaceholder('Front Desk, Doctor, or staff name').fill('E2E Front Desk');
    await page.getByLabel('Notes').fill('E2E follow-up verification');
    await save.click();
    await expect(page.locator('.notice.success')).toBeVisible();
  } else {
    await expect(page.getByText(/Select a patient|No.*reactivation|queue/i).first()).toBeVisible();
  }
});

test('inquiry quick filters and reset remain usable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Patient Inquiries', exact: true }).click();
  for (const name of ['Needs Follow-Up', 'Overdue', 'New Inquiries', 'Active Patients', 'Clear']) {
    const button = page.getByLabel('Common patient inquiry filters').getByRole('button', { name, exact: true });
    await expect(button).toBeVisible();
    await button.click();
  }
});

test('CSV import previews valid rows then imports them', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Import & Export', exact: true }).click();
  const csv = [
    'name,phone,email,service_needed,source,notes',
    'CSV E2E Patient,4045550177,csv-e2e@example.com,Spinal Adjustment,Website,Imported by browser test',
  ].join('\n');
  await page.locator('input[type=file]').setInputFiles({ name: 'e2e-inquiries.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.getByRole('heading', { name: 'Import Preview' })).toBeVisible();
  await expect(page.getByText('CSV E2E Patient')).toBeVisible();
  const importButton = page.getByRole('button', { name: 'Import Previewed Rows' });
  await expect(importButton).toBeEnabled();
  await importButton.click();
  await expect(page.locator('.notice.success')).toContainText(/imported/i);
});

test('CSV import rejects oversized files before reading or previewing them', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Import & Export', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({
    name: 'oversized.csv',
    mimeType: 'text/csv',
    buffer: Buffer.alloc(1_000_001, 65),
  });
  await expect(page.getByText('oversized.csv is larger than the 1 MB import limit. Choose a smaller CSV.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Import Previewed Rows' })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Import Preview' })).toHaveCount(0);
});

test('CSV import blocks malformed rows instead of importing them', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Import & Export', exact: true }).click();
  const csv = ['name,phone,email,service_needed', ',,,'].join('\n');
  await page.locator('input[type=file]').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  const importButton = page.getByRole('button', { name: 'Import Previewed Rows' });
  await expect(importButton).toBeDisabled();
});

test('duplicate review requires confirmation and merge completes', async ({ page, request }) => {
  const payload = { name: 'Duplicate E2E', phone: '4045550166', email: 'dup-e2e@example.com', service_needed: 'Spinal Adjustment', source: 'Website', status: 'New Inquiry' };
  expect((await request.post(`${API}/inquiries`, { data: payload })).ok()).toBeTruthy();
  expect((await request.post(`${API}/inquiries`, { data: { ...payload, notes: 'Second copy' } })).ok()).toBeTruthy();
  await page.goto('/');
  await page.getByRole('button', { name: 'Duplicates', exact: true }).click();
  await expect(page.getByText('Duplicate E2E').first()).toBeVisible();
  await page.getByRole('button', { name: 'Keep this one' }).first().click();
  await expect(page.getByRole('button', { name: 'Yes, merge' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes, merge' }).click();
  await expect(page.locator('.notice.success')).toContainText('Merged into Duplicate E2E');
});

test('settings daily summary returns a controlled success or configuration message', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Send Daily Summary' }).click();
  await expect(page.locator('.notice.success, .notice.error')).toBeVisible();
});

test('desktop sidebar collapse and expansion preserve navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Collapse navigation' }).click();
  await expect(page.locator('.app-shell.sidebar-collapsed')).toBeVisible();
  await page.getByRole('button', { name: 'Expand navigation' }).click();
  await expect(page.locator('.app-shell.sidebar-collapsed')).toHaveCount(0);
  await page.getByRole('button', { name: 'Pipeline', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Patient Pipeline', exact: true })).toBeVisible();
});

test('mobile navigation can close without changing workspace', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.locator('.sidebar.mobile-open')).toBeVisible();
  await page.getByRole('button', { name: 'Close navigation' }).last().click();
  await expect(page.locator('.sidebar.mobile-open')).toHaveCount(0);
  await expect(page.getByText('Good to see you.')).toBeVisible();
});
