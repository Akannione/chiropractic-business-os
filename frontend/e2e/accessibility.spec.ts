import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const API = process.env.E2E_API_URL || 'http://localhost:4010/api';

const workspaces = [
  ['Today', 'Today'], ['Patient Inquiries', 'Patient Inquiries'], ['Reactivations', 'Patient Reactivations'],
  ['Pipeline', 'Patient Pipeline'], ['Owner Review', 'Weekly Owner Review'], ['Intelligence', 'Practice Intelligence'],
  ['Monthly Report', 'Monthly Practice Report'], ['Activity', 'Activity'], ['Duplicates', 'Possible Duplicates'],
  ['Import & Export', 'Import & Export'], ['Settings', 'Practice Settings'],
] as const;

test.beforeEach(async ({ request }) => {
  const reset = await request.post(`${API}/demo/reset`);
  expect(reset.ok()).toBeTruthy();
});

test('core workspaces have no serious or critical automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  for (const [nav, label] of workspaces) {
    if (nav !== 'Today') await page.getByRole('button', { name: nav, exact: true }).click();
    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact || ''));
    expect(severe, `${label}: ${severe.map((v) => `${v.id}: ${v.help}`).join('; ')}`).toEqual([]);
  }
});

test('Add Inquiry drawer is keyboard operable and restores focus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Add Inquiry' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Add Patient Inquiry' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('public intake has no serious or critical automated accessibility violations', async ({ page }) => {
  await page.goto('/intake');
  const results = await new AxeBuilder({ page }).analyze();
  const severe = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact || ''));
  expect(severe, severe.map((v) => `${v.id}: ${v.help}`).join('; ')).toEqual([]);
});
