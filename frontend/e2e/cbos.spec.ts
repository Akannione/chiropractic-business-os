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
  await expect(page.getByText('Good to see you.')).toBeVisible({ timeout: 15_000 });
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

test('Today priority queue orders overdue before due today and upcoming', async ({ page }) => {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const makeInquiry = (
    id: string,
    name: string,
    nextFollowUpDate: string,
  ) => ({
    id,
    name,
    phone: '4045550100',
    email: `${id}@example.com`,
    service_needed: 'Spinal Adjustment',
    activity_context: '',
    source: 'Website',
    status: 'Follow-Up Needed',
    estimated_value: 200,
    notes: '',
    next_follow_up_date: nextFollowUpDate,
    appointment_status: 'Not Scheduled',
    patient_type: 'New Patient',
    appointment_request: '',
    offer_type: 'None',
    last_visit_date: '',
    expected_visit_frequency_days: null,
    assigned_follow_up_owner: '',
    follow_up_outcome: 'Not Contacted',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  });

  await page.route('**/api/inquiries?*', async (route) => {
    const url = new URL(route.request().url());

    if (url.searchParams.get('followUp') !== 'Needs Follow-Up') {
      await route.continue();
      return;
    }

    const rows = [
      makeInquiry('future', 'Future Follow Up', '2099-12-31'),
      makeInquiry('today', 'Due Today Follow Up', today),
      makeInquiry('overdue-newer', 'Newer Overdue Follow Up', '2021-01-01'),
      makeInquiry('overdue-oldest', 'Oldest Overdue Follow Up', '2020-01-01'),
      makeInquiry('no-date', 'No Date Follow Up', ''),
    ];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        rows,
        total: rows.length,
        page: 1,
        pageSize: 50,
      }),
    });
  });

  await page.reload();
  await expect(page.getByText('Good to see you.')).toBeVisible();

  const cards = page.locator('.modern-action-card');

  await expect(cards).toHaveCount(5);
  await expect(cards.nth(0)).toContainText('Oldest Overdue Follow Up');
  await expect(cards.nth(1)).toContainText('Newer Overdue Follow Up');
  await expect(cards.nth(2)).toContainText('Due Today Follow Up');
  await expect(cards.nth(3)).toContainText('Future Follow Up');
  await expect(cards.nth(4)).toContainText('No Date Follow Up');
});

test('Practice Pulse does not attribute overall estimated value to follow-up subset', async ({ page }) => {
  await page.route('**/api/kpis', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalPatientInquiries: 8,
        newThisWeek: 3,
        activePatients: 1,
        followUpsNeeded: 4,
        followUpsNeededPercent: 50,
        overdueFollowUps: 3,
        estimatedTreatmentValue: 1680,
        inquiryToPatientRate: 12.5,
        topInquirySource: 'Google',
      }),
    });
  });

  await page.reload();
  await expect(page.getByText('Good to see you.')).toBeVisible();

  const pulse = page.locator('.pulse-card');

  await expect(pulse).toContainText('4 follow-ups need attention.');
  await expect(pulse).not.toContainText('4 follow-ups represent');
  await expect(pulse).not.toContainText('$1,680');
});

test('Add Inquiry drawer creates an inquiry and closes', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Add Inquiry', exact: true });
  await expect(trigger).toBeEnabled();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Add Patient Inquiry' });
  await expect(dialog.getByLabel('Demo data safety notice')).toContainText(/fabricated information only/i);
  await expect(dialog.getByLabel('Patient Name')).toHaveAttribute('autocomplete', 'off');
  await dialog.getByLabel('Patient Name').fill('E2E Front Desk Test');
  await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('4045550199');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('e2e@example.com');
  await page.getByRole('button', { name: 'Add Inquiry', exact: true }).last().click();
  await expect(page.locator('.notice.success')).toContainText('Patient inquiry added');
});

test('successful inquiry save is not reported as failed when background refresh fails', async ({ page }) => {
  let createRequests = 0;
  let failNextKpis = false;
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/inquiries')) createRequests += 1;
  });
  await page.route('**/api/kpis', async (route) => {
    if (failNextKpis) {
      failNextKpis = false;
      await route.abort();
      return;
    }
    await route.continue();
  });

  const trigger = page.getByRole('button', { name: 'Add Inquiry', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Add Patient Inquiry' });
  await dialog.getByLabel('Patient Name').fill('E2E Refresh Failure');
  await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('4045550188');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('refresh-failure@example.com');
  failNextKpis = true;
  await page.getByRole('button', { name: 'Add Inquiry', exact: true }).last().click();

  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.notice.success')).toContainText('Patient inquiry added');
  await expect(page.locator('.notice.error')).toContainText('Action completed, but CBOS could not refresh');
  expect(createRequests).toBe(1);
});

test('Intelligence synthetic demo produces report matches and signals', async ({ page }) => {
  await page.getByRole('button', { name: 'Intelligence', exact: true }).click();
  await expect(page.getByLabel('Intelligence demo data safety notice')).toContainText(/no raw clinic exports/i);
  await expect(page.getByRole('heading', { name: 'Start with synthetic or deidentified exports' })).toBeVisible();
  const intelligenceFileInput = page.locator('input[type=file]');
  await expect(intelligenceFileInput).toBeDisabled();
  await page.getByLabel('I confirm these CSVs contain only fabricated or deidentified data.').check();
  await expect(intelligenceFileInput).toBeEnabled();
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
  await expect(page.getByText('Practice Intelligence')).toBeVisible({ timeout: 15_000 });
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

test('key workspaces stay within the viewport across phone tablet and desktop widths', async ({ page }) => {
  const widths = [320, 390, 768, 1024, 1440];
  const paths = ['/', '/inquiries', '/intelligence', '/pipeline'];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });
    for (const path of paths) {
      await page.goto(path);
      await page.locator('#main-content').waitFor();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(overflow, path + ' overflows at ' + width + 'px').toBe(false);
    }
  }
});
