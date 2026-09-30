import { test, expect } from '@playwright/test';

// This is an isolated SDK integration test. Firefox cannot execute the Vite
// virtual-host module harness used here, while the policy itself is covered by
// engine-independent unit tests and all CBOS workflows still run in Firefox.
test('SDK outbound policy removes URL, referrer, super-properties and free text', async ({ page, baseURL, browserName }) => {
  test.skip(browserName === 'firefox', 'Firefox does not load the isolated Vite virtual-host telemetry harness.');

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
