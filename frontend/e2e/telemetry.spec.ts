import { test, expect } from '@playwright/test';

// Run the actual SDK with a non-local hostname, but intercept EVERY request.
// No synthetic analytics are sent to PostHog and no patient records are loaded.
test('SDK outbound policy removes URL, referrer, super-properties and free text', async ({ page, baseURL }) => {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'cbos.test') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }
    if (url.pathname === '/') {
      await route.fulfill({ contentType: 'text/html', body: '<html><head><title>PRIVATE_SENTINEL</title></head><body>Isolated SDK test</body></html>' });
      return;
    }
    const response = await route.fetch({ url: `${baseURL}${url.pathname}${url.search}` });
    await route.fulfill({ response });
  });
  await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await page.goto('http://cbos.test/?patient=PRIVATE_SENTINEL');
  const result = await page.evaluate(async () => {
    const path = '/e2e/fixtures/telemetry-harness.ts';
    const harness = await import(path);
    return harness.captureWithSdk();
  });
  expect(result.captured).toBeTruthy();
  expect(result.captured.properties.workspace).toBe('inquiries');
  expect(result.captured.properties.distinct_id).toMatch(/^[0-9a-f-]{36}$/i);
  expect(result.captured.properties.$process_person_profile).toBe(false);
  expect(JSON.stringify(result.captured)).not.toContain('PRIVATE_SENTINEL');
  expect(result.rejected).toBeNull();
});
