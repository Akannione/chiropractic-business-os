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
  await expect(trigger).toBeEnabled();
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Add Patient Inquiry' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Demo data safety notice')).toBeVisible();
  const results = await new AxeBuilder({ page }).include('.inquiry-drawer').analyze();
  const severe = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact || ''));
  expect(severe, severe.map((v) => `${v.id}: ${v.help}`).join('; ')).toEqual([]);
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

test('visible interactive targets meet the WCAG 2.2 minimum target size', async ({ page }) => {
  await page.goto('/');
  for (const [nav] of workspaces) {
    if (nav !== 'Today') await page.getByRole('button', { name: nav, exact: true }).click();
    const undersized = await page.locator('button, a, input[type="checkbox"], input[type="radio"]').evaluateAll((nodes) =>
      nodes
        .filter((node) => {
          const element = node as HTMLElement;
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        })
        .map((node) => {
          const element = node as HTMLElement;
          const rect = element.getBoundingClientRect();
          return { label: element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName, width: rect.width, height: rect.height };
        })
        .filter(({ width, height }) => width < 24 || height < 24),
    );
    expect(undersized, nav + ': ' + JSON.stringify(undersized)).toEqual([]);
  }
});
