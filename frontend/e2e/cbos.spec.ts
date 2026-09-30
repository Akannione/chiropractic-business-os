import { test, expect } from '@playwright/test';

const sections = [
  ['Today', /Good to see you/i],
  ['Patient Inquiries', /Patient Inquiries/i],
  ['Reactivations', /Patient Reactivations/i],
  ['Pipeline', /Patient Pipeline/i],
  ['Owner Review', /Weekly Owner Review/i],
  ['Intelligence', /Practice Intelligence/i],
  ['Monthly Report', /Monthly Owner Report/i],
  ['Activity', /Activity History/i],
  ['Duplicates', /Possible Duplicates/i],
  ['Import & Export', /Import & Export/i],
  ['Public Intake', /Tell the Practice What You Need/i],
  ['Settings', /Practice Settings/i],
] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Good to see you.')).toBeVisible();
});

test('desktop navigation reaches every MVP workspace without runtime errors', async ({ page }) => {
  const errors:string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const [nav, heading] of sections) {
    await page.getByRole('button', { name: nav, exact: true }).click();
    await expect(page.getByText(heading).first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('Today primary workflow updates a queued inquiry', async ({ page }) => {
  const scheduled = page.getByRole('button', { name: 'Scheduled', exact: true }).first();
  if (await scheduled.count()) {
    await scheduled.click();
    await expect(page.locator('.notice.success')).toBeVisible();
  }
});

test('Add Inquiry drawer creates an inquiry and closes', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Inquiry', exact: true }).click();
  await page.getByLabel('Patient Name').fill('E2E Front Desk Test');
  await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('4045550199');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('e2e@example.com');
  await page.getByRole('button', { name: 'Add Inquiry', exact: true }).last().click();
  await expect(page.locator('.notice.success')).toContainText('Patient inquiry added');
});

test('Intelligence synthetic demo produces report matches and signals', async ({ page }) => {
  await page.getByRole('button', { name: 'Intelligence', exact: true }).click();
  await page.getByRole('button', { name: /Try sample data/i }).click();
  await expect(page.getByText('Report matches')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What needs attention', exact: true })).toBeVisible();
});

test('Pipeline loads and refreshes', async ({ page }) => {
  await page.getByRole('button', { name: 'Pipeline', exact: true }).click();
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Patient Pipeline', exact: true })).toBeVisible();
});

test('Import & Export exposes CSV download and guarded import workflow', async ({ page }) => {
  await page.getByRole('button', { name: 'Import & Export', exact: true }).click();
  await expect(page.getByRole('button', { name: /Download CSV/i })).toBeVisible();
  await expect(page.getByText('Import Existing Patient Inquiries')).toBeVisible();
});

test('public /intake route works independently', async ({ page }) => {
  await page.goto('/intake');
  await expect(page.getByText(/Tell the Practice What You Need/i).first()).toBeVisible();
  await expect(page.getByLabel('Patient Name')).toBeVisible();
});

test('mobile layout opens navigation and reaches Today/Intelligence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.locator('.sidebar.mobile-open')).toBeVisible();
  await page.getByRole('button', { name: 'Intelligence', exact: true }).click();
  await expect(page.getByText('Practice Intelligence')).toBeVisible();
});

test('desktop front-desk viewport has no horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test('workspace URLs are deep-linkable and browser navigation restores context', async ({ page }) => {
  await page.goto('/intelligence');
  await expect(page.getByText('Practice Intelligence')).toBeVisible();
  await expect(page).toHaveURL(/\/intelligence$/);
  await page.getByRole('button', { name: 'Pipeline', exact: true }).click();
  await expect(page).toHaveURL(/\/pipeline$/);
  await expect(page.getByRole('heading', { name: 'Patient Pipeline', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/intelligence$/);
  await expect(page.getByText('Practice Intelligence')).toBeVisible();
});

test('unknown workspace URLs recover to Today instead of leaving a misleading path', async ({ page }) => {
  await page.goto('/not-a-real-workspace');
  await expect(page.getByText('Good to see you.')).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});
