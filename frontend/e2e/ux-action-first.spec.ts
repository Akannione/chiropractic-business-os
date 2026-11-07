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
  await page.getByRole('button', { name: 'Reports', exact: true }).click();
  await expect(page).toHaveURL(/inquiries$/);
  page.once('dialog', async (dialog) => { await dialog.accept(); });
  await page.getByRole('button', { name: 'Reports', exact: true }).click();
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

test('Today offers an undo that restores the prior follow-up state', async ({ page }) => {
  const first = page.locator('.modern-action-card').first();
  const name = await first.locator('.action-person strong').innerText();
  await first.getByRole('button', { name: 'Mark scheduled' }).click();
  const undo = page.getByRole('button', { name: 'Undo last change' });
  await expect(undo).toBeVisible();
  await undo.click();
  await expect(page.getByRole('status').last()).toContainText('restored');
  await expect(page.locator('.modern-action-card', { hasText: name })).toBeVisible();
});

test('Owner navigation exposes Performance and Reports and preserves monthly reporting', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Performance', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Performance', exact: true }).click();
  await expect(page).toHaveURL(/performance$/);
  await expect(page.getByRole('heading', { name: 'Practice Performance' })).toBeVisible();
  await expect(page.getByText('Estimated Opportunity Value')).toBeVisible();
  await page.getByRole('button', { name: 'Reports', exact: true }).click();
  await expect(page).toHaveURL(/owner-review$/);
  await expect(page.getByRole('link', { name: 'Monthly report' })).toBeVisible();
  await page.getByRole('link', { name: 'Monthly report' }).click();
  await expect(page).toHaveURL(/monthly-report$/);
});

test('Owner Review presents one action plan with optional checklist and clear estimated value', async ({ page }) => {
  await page.goto('/owner-review');
  await expect(page.getByRole('heading', { name: 'Owner Action Plan' })).toHaveCount(1);
  await expect(page.locator('.owner-review-grid > .panel')).toHaveCount(1);
  await expect(page.getByText('Review checklist (4 steps)')).toBeVisible();
  await page.getByText('Review checklist (4 steps)').click();
  await expect(page.getByText('Review overdue follow-ups.')).toBeVisible();
});

test('Mobile reactivation workflow uses scannable cards and direct outcome action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/reactivations');
  await expect(page.locator('.reactivation-mobile-list')).toBeVisible();
  await expect(page.locator('.reactivation-mobile-list .reactivation-mobile-card').first()).toBeVisible();
  await page.locator('.reactivation-mobile-card').first().getByRole('button', { name: 'Record outcome' }).click();
  await expect(page.getByRole('heading', { name: /Follow Up With/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save follow-up outcome' })).toBeVisible();
});

test('mobile Performance KPIs use compact two-column cards', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/performance');
  const cards = page.locator('.performance-workspace .kpi-card');
  await expect(cards).toHaveCount(8);
  const a = await cards.nth(0).boundingBox();
  const b = await cards.nth(1).boundingBox();
  expect(a).toBeTruthy();
  expect(b).toBeTruthy();
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(3);
});
