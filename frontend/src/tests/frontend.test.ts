type Stored = Record<string, string>;

export {};

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${String(expected)}, received ${String(actual)}`);
  }
}

function assertIncludes(value: string, pattern: RegExp) {
  if (!pattern.test(value)) throw new Error(`Expected "${value}" to match ${pattern}`);
}

async function assertRejects(action: () => Promise<unknown>, pattern: RegExp) {
  try {
    await action();
  } catch (error) {
    assertIncludes((error as Error).message, pattern);
    return;
  }
  throw new Error('Expected promise to reject.');
}

function installWindow() {
  const stored: Stored = {};
  const localStorage = {
    getItem: (key: string) => stored[key] ?? null,
    setItem: (key: string, value: string) => {
      stored[key] = value;
    },
    removeItem: (key: string) => {
      delete stored[key];
    },
  };

  (globalThis as unknown as { window: { localStorage: typeof localStorage } }).window = {
    localStorage,
  };
}

installWindow();

const apiModule = await import('../services/api');
const formatModule = await import('../utils/format');
const pipelineModule = await import('../pages/PipelinePage');
const inquiryDrawerModule = await import('../components/InquiryDrawer');
const inquiryFormModule = await import('../components/InquiryForm');

const {
  api,
  clearAuthToken,
  getAuthToken,
  isCbosPreviewHostname,
  resolveApiBaseUrl,
  setAuthToken,
  setUnauthorizedHandler,
} = apiModule;
const { addDaysIso, setPracticeTimeZone, todayIso } = formatModule;
const { pipelineLimitMessage } = pipelineModule;
const { nextDrawerFocusIndex } = inquiryDrawerModule;
const { emptyInquiryForm } = inquiryFormModule;

async function testCsvImportKeepsAuthHeader() {
  setAuthToken('staff-token');
  let capturedHeaders = new Headers();

  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response(JSON.stringify({
      rows: [],
      totalRows: 0,
      importableRows: 0,
      duplicateRows: 0,
      errorRows: 0,
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;

  await api.previewImportCsv('name,phone,email,service_needed\n');
  assertEqual(capturedHeaders.get('authorization'), 'Bearer staff-token');
  assertEqual(capturedHeaders.get('content-type'), 'text/csv');
}

async function testIntelligencePreviewKeepsStaffAuth() {
  setAuthToken('staff-token');
  let capturedHeaders = new Headers();
  let capturedBody = '';

  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    capturedHeaders = new Headers(init?.headers);
    capturedBody = String(init?.body || '');
    return new Response(JSON.stringify({
      files: [],
      signals: [],
      summary: { filesReceived: 1, recognizedReports: 0, unrecognizedReports: 1, totalRows: 1, signalsFound: 0 },
      boundary: 'Preview only.',
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;

  await api.previewIntelligence([{ name: 'demo.csv', csvText: 'a,b\n1,2' }]);
  assertEqual(capturedHeaders.get('authorization'), 'Bearer staff-token');
  assertEqual(capturedHeaders.get('content-type'), 'application/json');
  assertIncludes(capturedBody, /demo\.csv/);
  clearAuthToken();
}

async function testExpiredStaffTokenClearsSession() {
  setAuthToken('expired-token');
  let unauthorized = false;
  setUnauthorizedHandler(() => {
    unauthorized = true;
  });

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ message: 'Staff login is required.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })) as typeof fetch;

  await assertRejects(() => api.inquiries({ pageSize: 1 }), /Staff login is required/);
  assertEqual(getAuthToken(), '');
  assertEqual(unauthorized, true);
  setUnauthorizedHandler(null);
}

async function testPublic401DoesNotClearStaffToken() {
  setAuthToken('still-valid');
  let unauthorized = false;
  setUnauthorizedHandler(() => {
    unauthorized = true;
  });

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ message: 'Temporary config failure.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })) as typeof fetch;

  await assertRejects(() => api.config(), /Temporary config failure/);
  assertEqual(getAuthToken(), 'still-valid');
  assertEqual(unauthorized, false);
  clearAuthToken();
  setUnauthorizedHandler(null);
}

function testPracticeTimezoneDateHelpers() {
  setPracticeTimeZone('America/New_York');
  assertEqual(
    todayIso(new Date('2026-03-09T00:30:00.000Z')),
    '2026-03-08',
    '8:30 PM ET should still be the practice date before midnight',
  );
  assertEqual(addDaysIso(1, new Date('2026-03-08T05:30:00.000Z')), '2026-03-09');
}

function testPipelineLimitMessage() {
  assertEqual(pipelineLimitMessage(100, 100), '');
  assertEqual(
    pipelineLimitMessage(150, 100),
    'Showing the 100 newest of 150 patient inquiries. Use Patient Inquiries filters for the full list.',
  );
}

function testApiBaseUrlResolution() {
  assertEqual(
    isCbosPreviewHostname('businessosmvp-git-chatgpt-pilot-1aeab7-tobi-oniyide-s-projects.vercel.app'),
    true,
  );
  assertEqual(
    resolveApiBaseUrl(
      { VITE_API_BASE_URL: 'https://cbos-api.vercel.app/api' },
      'businessos-git-pilot-tobi-oniyide-s-projects.vercel.app',
    ),
    '/api',
  );
  assertEqual(resolveApiBaseUrl({ DEV: true }, ''), 'http://localhost:4000/api');
  assertEqual(
    resolveApiBaseUrl({ VITE_API_BASE_URL: 'https://cbos-api.vercel.app/api' }, 'cbos.example.com'),
    'https://cbos-api.vercel.app/api',
  );
}

function testInquiryDrawerFocusWraps() {
  assertEqual(nextDrawerFocusIndex(0, 4, true), 3);
  assertEqual(nextDrawerFocusIndex(3, 4, false), 0);
  assertEqual(nextDrawerFocusIndex(1, 4, false), 2);
  assertEqual(nextDrawerFocusIndex(0, 0, false), -1);
}

function testInquiryFormDefaults() {
  const form = emptyInquiryForm(null);
  assertEqual(form.status, 'New Inquiry');
  assertEqual(form.source, 'Google');
  assertEqual(form.service_needed, 'Spinal Adjustment');
  assertEqual(form.next_follow_up_date, todayIso());
}

await testCsvImportKeepsAuthHeader();
await testIntelligencePreviewKeepsStaffAuth();
await testExpiredStaffTokenClearsSession();
await testPublic401DoesNotClearStaffToken();
testPracticeTimezoneDateHelpers();
testPipelineLimitMessage();
testApiBaseUrlResolution();
testInquiryDrawerFocusWraps();
testInquiryFormDefaults();

console.log('Frontend tests passed.');

// Deliberately synthetic sentinel values: these must never leave telemetry.
const { safeTelemetryProperties, safeOutboundProperties } = await import('../services/telemetryPolicy');
assertEqual(safeTelemetryProperties('unknown'), null);
assertEqual(safeTelemetryProperties('__proto__'), null);
assertEqual(JSON.stringify(safeTelemetryProperties('workspace_viewed', { workspace: 'inquiries', name: 'PRIVATE_SENTINEL', notes: 'PRIVATE_SENTINEL' })), '{"workspace":"inquiries"}');
assertEqual(JSON.stringify(safeTelemetryProperties('workspace_viewed', { workspace: 'PRIVATE_SENTINEL' })), '{}');
for (const value of [-1, NaN, Infinity, 1.5, '12', null, {}, Number.MAX_SAFE_INTEGER + 1]) {
  assertEqual(JSON.stringify(safeTelemetryProperties('csv_import_completed', { imported_rows: value })), '{}');
}
assertEqual(JSON.stringify(safeTelemetryProperties('csv_import_completed', { imported_rows: 0, skipped_duplicates: 2 })), '{"imported_rows":0,"skipped_duplicates":2}');
const anonymousId = '019c6e27-e55b-73d1-87d8-4e01f1f75043';
const outbound = safeOutboundProperties('workspace_viewed', {
  workspace: 'dashboard', distinct_id: anonymousId, $session_id: anonymousId,
  $current_url: 'https://example.test/?name=PRIVATE_SENTINEL', $referrer: 'PRIVATE_SENTINEL',
  $set: { email: 'PRIVATE_SENTINEL' }, $initial_person_info: { name: 'PRIVATE_SENTINEL' },
  $process_person_profile: true, arbitrary_future_sdk_property: 'PRIVATE_SENTINEL',
}, 'test-project-token');
assertEqual(JSON.stringify(outbound).includes('PRIVATE_SENTINEL'), false);
assertEqual(outbound?.distinct_id, anonymousId);
assertEqual(outbound?.$process_person_profile, false);
assertEqual(safeOutboundProperties('workspace_viewed', { distinct_id: 'patient@example.test' }, 'test'), null);
console.log('Telemetry privacy regression tests passed.');
