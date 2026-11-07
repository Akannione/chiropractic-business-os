import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Next actions' })).toBeVisible();
});

test('secondary destinations start collapsed and can be opened accessibly', async ({ page }) => {
  const toggle = page.getByRole('button', { name: 'More', exact: true });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: 'Pipeline', exact: true })).toHaveCount(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: 'Pipeline', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Patient Pipeline' })).toBeVisible();
});

test('follow-up action is singular, nonbooking and secondary actions are disclosed', async ({ page }) => {
  const first = page.locator('.modern-action-card').first();
  await expect(first.getByRole('button', { name: 'Mark scheduled' })).toHaveCount(1);
  await expect(first.getByRole('button', { name: 'Mark active' })).not.toBeVisible();
  const primary = first.getByRole('button', { name: 'Mark scheduled' });
  await expect(primary).toHaveAttribute('title', /does not book an appointment/i);
  await first.locator('summary', { hasText: 'More actions' }).click();
  await expect(first.getByRole('button', { name: 'Mark active' })).toBeVisible();
  await expect(first.getByRole('button', { name: 'Follow up tomorrow' })).toBeVisible();
});

test('inquiry editor offers grouped fields and does not hide them permanently', async ({ page }) => {
  await page.getByRole('button', { name: 'Patient Inquiries', exact: true }).click();
  await expect(page.locator('.detail-field-group')).toHaveCount(4);
  const section = page.getByText('Clinic workflow', { exact: true });
  await section.click();
  await expect(page.getByLabel('Last Visit Date')).toBeVisible();
});

test('mobile Today queues actions before low-priority KPI cards', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const queue = page.locator('.today-layout');
  const kpis = page.locator('.insight-strip');
  const queueBox = await queue.boundingBox();
  const kpiBox = await kpis.boundingBox();
  expect(queueBox).toBeTruthy();
  expect(kpiBox).toBeTruthy();
  expect(queueBox!.y).toBeLessThan(kpiBox!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
});

test('mobile inquiry selection presents a back-to-list action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Patient Inquiries', exact: true }).click();
  await expect(page.locator('.sticky-detail')).not.toBeVisible();
  await page.locator('.inquiry-list-item').first().click();
  await expect(page.locator('.sticky-detail')).toBeVisible();
  await page.getByRole('button', { name: 'Back to inquiries' }).click();
  await expect(page.locator('.inquiry-list-item').first()).toBeVisible();
});

test('CSV import requires review of the preview before writing', async ({ page }) => {
  await page.getByRole('button', { name: 'More', exact: true }).click();
  await page.getByRole('button', { name: 'Import & Export', exact: true }).click();
  await page.getByLabel('I confirm this CSV contains only fabricated or deidentified data.').check();
  const csv = [
    'name,phone,email,service_needed,source,notes',
    'Review Only,4045550198,review-only@example.com,Spinal Adjustment,Website,Synthetic UI test',
  ].join('\n');
  await page.getByLabel('Choose patient inquiry CSV file').setInputFiles({
    name: 'review-only.csv', mimeType: 'text/csv', buffer: Buffer.from(csv),
  });
  await expect(page.getByRole('heading', { name: 'Import Preview' })).toBeVisible();
  const importButton = page.getByRole('button', { name: 'Import Previewed Rows' });
  await expect(importButton).toBeDisabled();
  await page.getByLabel('I reviewed the preview and confirm importing Ready rows only.').check();
  await expect(importButton).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'Recent Imports' })).toBeVisible();
});

test('editing an inquiry warns before switching workspaces', async ({ page }) => {
  await page.getByRole('button', { name: 'Patient Inquiries', exact: true }).click();
  await expect(page.getByLabel('Patient Name')).toBeVisible();
  await page.getByLabel('Patient Name').fill('Synthetic unsaved edit');
  page.once('dialog', async (dialog) => { await dialog.dismiss(); });
  await page.getByRole('button', { name: 'Owner Review', exact: true }).click();
  await expect(page).toHaveURL(/inquiries$/);
  page.once('dialog', async (dialog) => { await dialog.accept(); });
  await page.getByRole('button', { name: 'Owner Review', exact: true }).click();
  await expect(page).toHaveURL(/owner-review$/);
});

test('mobile inquiry filters are progressive and remain accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/inquiries');
  await expect(page.locator('.filter-grid > label')).toHaveCount(4);
  await expect(page.getByLabel('Search', { exact: true })).toBeVisible();
  await expect(page.locator('.filter-grid > label').nth(2)).not.toBeVisible();
  const toggle = page.getByRole('button', { name: /Show filters/ });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(page.locator('.filter-grid > label').nth(2)).toBeVisible();
  await expect(page.locator('.filter-grid > label').nth(3)).toBeVisible();
});
