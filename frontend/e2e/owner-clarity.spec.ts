import { expect, test, type Page } from '@playwright/test';


async function openWorkspace(page: Page, name: string) {
  const target = page.getByRole('button', { name, exact: true });
  if (!(await target.isVisible())) {
    const more = page.getByRole('button', { name: 'More', exact: true });
    if (await more.isVisible()) await more.click();
  }
  await target.click();
}
test('owner-first workspaces avoid duplicate page titles and retain safety', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('note', { name: 'Demo data safety notice', exact: true })).toContainText('fake data only');
  await expect(page.getByRole('heading', { name: 'Next actions' })).toBeVisible();
  await expect(page.locator('.pulse-card')).toHaveCount(0);
  const nav = [
    ['Patient Inquiries', 'Patient Inquiries'],
    ['Reactivations', 'Patient Reactivations'],
    ['Pipeline', 'Patient Pipeline'],
    ['Owner Review', 'Weekly Owner Review'],
    ['Intelligence', 'Practice Intelligence'],
    ['Monthly Report', 'Monthly Owner Report'],
    ['Import & Export', 'Import & Export'],
  ];
  for (const [label, heading] of nav) {
    await openWorkspace(page, label);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.getByRole('note', { name: 'Demo data safety notice', exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Owner Review', exact: true }).click();
  const checklist = page.locator('.owner-review-details');
  await expect(checklist.locator('summary')).toBeVisible();
  await expect(checklist.getByText('Confirm every new inquiry has a next step.')).not.toBeVisible();
  await checklist.locator('summary').click();
  await expect(checklist.getByText('Confirm every new inquiry has a next step.')).toBeVisible();
  await openWorkspace(page, 'Intelligence');
  await expect(page.getByText('API / FHIR')).toHaveCount(0);
  await expect(page.getByText('Preview · no data saved')).toBeVisible();
  await page.getByRole('button', { name: 'Reactivations', exact: true }).click();
  const help = page.locator('.kpi-card .kpi-help').first();
  await expect(help.locator('summary')).toBeVisible();
  await expect(help.getByText('Patients past their expected return date.')).not.toBeVisible();
  await help.locator('summary').click();
  await expect(help.getByText('Patients past their expected return date.')).toBeVisible();
});

test('owner-first mobile screen does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('note', { name: 'Demo data safety notice', exact: true })).toBeVisible();
  for (const label of ['Patient Inquiries', 'Owner Review', 'Intelligence']) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await openWorkspace(page, label);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(391);
    await expect(page.locator('main h1')).toHaveCount(1);
  }
});

test('switching inquiries never shows another record in the selected editor', async ({ page }) => {
  await page.goto('/');
  const response = await page.request.get('/api/inquiries?pageSize=25');
  expect(response.ok()).toBeTruthy();
  const data = await response.json() as { rows: { name: string; next_follow_up_date: string }[] };
  const first = data.rows.find((row) => Boolean(row.next_follow_up_date));
  const second = data.rows.find((row) => Boolean(row.next_follow_up_date) && row.next_follow_up_date !== first?.next_follow_up_date);
  expect(first).toBeDefined();
  expect(second).toBeDefined();

  await page.getByRole('button', { name: 'Patient Inquiries', exact: true }).click();
  const detail = page.locator('.sticky-detail');
  for (const inquiry of [first!, second!, first!]) {
    await page.locator('.inquiry-list-item').filter({ hasText: inquiry.name }).first().click();
    await expect(detail.locator('.detail-summary strong').first()).toHaveText(inquiry.name);
    await expect(detail.locator('.detail-form input[type=date]').first()).toHaveValue(inquiry.next_follow_up_date);
  }
});

test('mobile Today surfaces the first follow-up before excessive scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const first = page.locator('.modern-action-card').first();
  await expect(first).toBeVisible();
  const top = await first.evaluate((element) => element.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
});

test('reactivation selection keeps each record and editable owner synchronized', async ({ page }) => {
  await page.goto('/');
  const response = await page.request.get('/api/reactivations');
  expect(response.ok()).toBeTruthy();
  const data = await response.json() as { rows: { name: string; phone: string; assigned_follow_up_owner: string }[] };
  expect(data.rows.length).toBeGreaterThan(1);
  await page.getByRole('button', { name: 'Reactivations', exact: true }).click();
  for (const row of data.rows.slice(0, 2).concat(data.rows[0])) {
    await page.locator('.reactivation-row').filter({ hasText: row.name }).first().click();
    await expect(page.getByRole('heading', { name: `Follow Up With ${row.name}` })).toBeVisible();
    const form = page.locator('form.inquiry-form');
    await expect(form.locator('.detail-summary strong').first()).toHaveText(row.phone);
    await expect(form.getByLabel('Follow-Up Owner')).toHaveValue(row.assigned_follow_up_owner);
  }
});
