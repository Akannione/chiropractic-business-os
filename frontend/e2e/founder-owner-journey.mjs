// Synthetic, local-only founder proxy rehearsal. Never point this script at production.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const origin = 'http://127.0.0.1:5197';
const api = 'http://127.0.0.1:4030/api';
const output = resolve(dirname(fileURLToPath(import.meta.url)), '../../output/founder-journey-2026-10-22');
const fetchJson = async (path, options = {}) => {
  const response = await fetch(api + path, { redirect: 'error', ...options });
  if (!response.ok) throw Error('Local synthetic API refused ' + path + ': ' + response.status);
  return response.json();
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const snapshot = async (page, name) => {
  await page.screenshot({ path: resolve(output, name + '.png'), fullPage: true, animations: 'disabled' });
};
const steps = [];
const record = (task, result, detail, durationMs) => steps.push({ task, result, detail, elapsed_ms: durationMs });
const config = await fetchJson('/config');
assert(config.demoMode === true, 'Demo mode false: abort before browser or mutations.');
const auth = await fetchJson('/auth/status');
assert(auth.authEnabled === false, 'Staff auth enabled: unsuitable for this synthetic rehearsal.');
mkdirSync(output, { recursive: true });
const original = await fetchJson('/demo/reset', { method: 'POST' });
assert(original.inserted === 8, 'Expected exactly eight fabricated records after demo reset.');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
let resetSucceeded = false;
try {
  let start = Date.now();
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.locator('.modern-action-card').first().waitFor();
  const names = await page.locator('.modern-action-card .action-person strong').allTextContents();
  assert(names[0] === 'Priya Patel', 'First overdue is not Priya Patel.');
  assert(names.slice(0, 4).join('|') === 'Priya Patel|Maya Johnson|Aisha Coleman|Nia Brown', 'Priority order differs: ' + names.join('|'));
  assert(await page.getByRole('note', { name: 'Demo data safety notice', exact: true }).isVisible(), 'Missing fake-data warning.');
  const firstCard = await page.locator('.modern-action-card').first().innerText();
  assert(firstCard.includes('Overdue'), 'First card lacks timing priority.');
  await snapshot(page, '01-today-first-overdue');
  record('Identify first overdue follow-up', 'PASS', 'Priya Patel first; overdue label visible; no user assistance simulated', Date.now() - start);

  start = Date.now();
  await page.getByRole('button', { name: 'Patient Inquiries', exact: true }).click();
  await page.locator('.inquiry-list-item').first().waitFor();
  await page.locator('.inquiry-list-item').filter({ hasText: 'Priya Patel' }).first().click();
  const detail = page.locator('.sticky-detail');
  assert((await detail.innerText()).includes('Work Priya Patel'), 'Selected inquiry details not found.');
  const followUp = await detail.locator('input[type=date]').first().inputValue();
  assert(followUp === '2026-10-17', 'Priya next follow-up date changed unexpectedly: ' + followUp);
  const fields = await detail.locator('label').allTextContents();
  assert(fields.some(x => x.includes('Next Follow-Up')), 'Cannot locate editable next follow-up field.');
  await snapshot(page, '02-inquiry-inspected');
  record('Inspect inquiry and follow-up', 'PASS', 'Priya selected, detail editor visible, follow-up date 2026-10-17 preserved', Date.now() - start);

  start = Date.now();
  await page.getByRole('button', { name: 'Reactivations', exact: true }).click();
  const list = page.locator('.reactivation-row');
  await list.first().waitFor();
  const rows = await list.allTextContents();
  assert(rows.some(x => x.includes('Chris Miller')), 'Expected synthetic reactivation row missing.');
  await list.filter({ hasText: 'Chris Miller' }).first().click();
  const reactivationForm = page.locator('form.inquiry-form');
  await reactivationForm.getByLabel('Follow-Up Owner').fill('Founder Demo');
  await reactivationForm.getByLabel('Follow-Up Outcome').selectOption({ label: 'Left Voicemail' });
  await reactivationForm.getByLabel('Notes').fill('Synthetic founder rehearsal; no actual clinic contact.');
  await snapshot(page, '03-reactivation-before-save');
  await reactivationForm.getByRole('button', { name: 'Save Follow-Up' }).click();
  await page.locator('.notice.success').waitFor();
  const apiRows = await fetchJson('/reactivations');
  const updated = apiRows.rows.find(r => r.name === 'Chris Miller');
  assert(updated?.assigned_follow_up_owner === 'Founder Demo', 'Reactivation owner update not persisted.');
  assert(updated?.follow_up_outcome === 'Left Voicemail', 'Reactivation outcome update not persisted.');
  await snapshot(page, '04-reactivation-saved');
  record('Review and log a synthetic reactivation', 'PASS', 'Chris outcome and ownership saved and verified through isolated API; no real patient contacted', Date.now() - start);

  start = Date.now();
  await page.getByRole('button', { name: 'Owner Review', exact: true }).click();
  const heading = page.getByRole('heading', { name: 'Weekly Owner Review', exact: true });
  await heading.waitFor();
  const summary = await fetchJson('/weekly-summary');
  assert(summary.followUpsNeeded === 4 && summary.overdueFollowUps === 3, 'Unexpected owner summary counts.');
  assert(summary.estimatedTreatmentValue === 1680, 'Unexpected estimated treatment value.');
  const review = page.locator('.owner-workspace');
  assert((await review.innerText()).includes('3 follow-ups are past due'), 'Owner action plan does not reflect overdue pressure.');
  const checklist = page.locator('.owner-review-details');
  assert(await checklist.count() === 1, 'Expandable optional owner checklist unavailable.');
  assert(!(await checklist.getByText('Confirm every new inquiry has a next step.').isVisible()), 'Optional checklist was expanded by default.');
  await snapshot(page, '05-owner-review-brief');
  await checklist.locator('summary').click();
  assert(await checklist.getByText('Confirm every new inquiry has a next step.').isVisible(), 'Expanded checklist missing content.');
  await snapshot(page, '06-owner-review-checklist');
  record('Interpret owner report and optional checklist', 'PASS', '4 follow-ups, 3 overdue, $1,680 estimated value; checklist expandable; no recovered-revenue assertion', Date.now() - start);

  start = Date.now();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  assert((await page.locator('.modern-action-card .action-person strong').first().innerText()) === 'Priya Patel', 'Phone layout differs from desktop priority.');
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert(scrollWidth <= 391, 'Phone layout horizontal overflow: ' + scrollWidth);
  await snapshot(page, '07-mobile-today');
  record('Owner check on phone', 'PASS', '390px viewport preserves first overdue action and no page overflow', Date.now() - start);
  assert(pageErrors.length === 0, 'JavaScript runtime errors: ' + pageErrors.join(';'));
} finally {
  await browser.close();
  const r = await fetchJson('/demo/reset', { method: 'POST' });
  resetSucceeded = r.inserted === 8;
  const restored = await fetchJson('/reactivations');
  const chris = restored.rows.find(r => r.name === 'Chris Miller');
  assert(resetSucceeded && chris?.assigned_follow_up_owner !== 'Founder Demo', 'Synthetic reset did not restore baseline.');
  writeFileSync(resolve(output, 'founder-proxy-results.json'), JSON.stringify({
    date: '2026-10-22', runType: 'automated proxy / synthetic rehearsal',
    humanFounderObserved: false, externalClinicOwnerObserved: false,
    origin, database: 'cbos_owner_focus_20261022 (local only)',
    originalSyntheticRecords: original.inserted, restoredAfterTest: resetSucceeded,
    browserErrors: pageErrors, steps
  }, null, 2) + '\n');
}
console.log(JSON.stringify({ steps, restoredAfterTest: resetSucceeded, screenshots: 7 }, null, 2));
