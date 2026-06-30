import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { mapExternalRow, parseInquiryCsv } from '../services/importService.js';

type FetchImplementation = typeof fetch;

type SmokeOptions = {
  baseUrl: string;
  csvText: string;
  authToken?: string;
  allowRemoteReset?: boolean;
  fetchImpl?: FetchImplementation;
};

export type ReactivationSmokeResult = {
  previewed: number;
  imported: number;
  reactivationRowsVerified: number;
  updatedInquiryId: string;
  resetInserted: number;
};

type QueueRow = {
  id: string;
  email: string;
  assigned_follow_up_owner: string;
  follow_up_outcome: string;
};

function requireCondition(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isLocalUrl(baseUrl: string) {
  const hostname = new URL(baseUrl).hostname;
  return ['127.0.0.1', 'localhost', '::1'].includes(hostname);
}

export async function runReactivationSmoke({
  baseUrl,
  csvText,
  authToken = '',
  allowRemoteReset = false,
  fetchImpl = fetch,
}: SmokeOptions): Promise<ReactivationSmokeResult> {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  requireCondition(csvText.trim(), 'The fake-data CSV is empty.');
  if (!isLocalUrl(normalizedBaseUrl) && !allowRemoteReset) {
    throw new Error('Remote demo reset is blocked. Set CBOS_SMOKE_ALLOW_REMOTE_RESET=true to opt in.');
  }

  const sourceRows = parseInquiryCsv(csvText).map(mapExternalRow);
  requireCondition(sourceRows.length > 0, 'The fake-data CSV has no data rows.');
  const sourceEmails = sourceRows.map((row) => row.email.trim().toLowerCase());
  const expectedQueueEmails = sourceRows
    .filter((row) => (
      row.patient_type !== 'Dead Lead' &&
      Boolean(row.last_visit_date) &&
      Number(row.expected_visit_frequency_days) > 0
    ))
    .map((row) => row.email.trim().toLowerCase());
  requireCondition(expectedQueueEmails.length > 0, 'The fake-data CSV has no reactivation-eligible rows.');

  const request = async (route: string, init: RequestInit = {}) => {
    const requestHeaders = new Headers(init.headers);
    if (authToken) requestHeaders.set('authorization', `Bearer ${authToken}`);
    const response = await fetchImpl(`${normalizedBaseUrl}${route}`, {
      ...init,
      headers: requestHeaders,
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`${String(init.method || 'GET').toUpperCase()} ${route} returned ${response.status}: ${detail}`);
    }
    return response;
  };
  const requestJson = async <T>(route: string, init: RequestInit = {}) => {
    const response = await request(route, init);
    return response.json() as Promise<T>;
  };
  const resetDemo = () => requestJson<{ inserted: number }>('/demo/reset', { method: 'POST' });

  const config = await requestJson<{ demoMode: boolean }>('/config');
  requireCondition(config.demoMode === true, 'Smoke workflow requires BUSINESS_OS_DEMO_MODE=true.');
  const authStatus = await requestJson<{ authEnabled: boolean }>('/auth/status');
  if (authStatus.authEnabled && !authToken) {
    throw new Error('Staff authentication is enabled. Set CBOS_AUTH_TOKEN before running the smoke workflow.');
  }

  await resetDemo();

  let workflowResult: Omit<ReactivationSmokeResult, 'resetInserted'> | undefined;
  let workflowError: unknown;
  try {
    const csvRequest: RequestInit = {
      method: 'POST',
      headers: { 'content-type': 'text/csv' },
      body: csvText,
    };
    const preview = await requestJson<{
      totalRows: number;
      importableRows: number;
      duplicateRows: number;
      errorRows: number;
    }>('/imports/inquiries.csv/preview', csvRequest);
    requireCondition(preview.totalRows === sourceRows.length, 'CSV preview row count did not match the fake-data file.');
    requireCondition(preview.importableRows === sourceRows.length, 'Not every fake-data row was importable after reset.');
    requireCondition(preview.duplicateRows === 0, 'Fake-data preview unexpectedly found duplicates after reset.');
    requireCondition(preview.errorRows === 0, 'Fake-data preview returned validation errors.');

    const imported = await requestJson<{
      imported: number;
      skippedDuplicates: number;
      failed: number;
    }>('/imports/inquiries.csv', csvRequest);
    requireCondition(imported.imported === sourceRows.length, 'Imported row count did not match the fake-data file.');
    requireCondition(imported.skippedDuplicates === 0, 'Fake-data import unexpectedly skipped duplicates.');
    requireCondition(imported.failed === 0, 'Fake-data import reported failed rows.');

    const queue = await requestJson<{ rows: QueueRow[] }>('/reactivations');
    const importedQueueRows = queue.rows.filter((row) => (
      expectedQueueEmails.includes(row.email.trim().toLowerCase())
    ));
    requireCondition(
      importedQueueRows.length === expectedQueueEmails.length,
      'Reactivation queue did not contain every eligible fake-data row.',
    );

    const target = importedQueueRows[0];
    const update = await requestJson<QueueRow>(`/inquiries/${encodeURIComponent(target.id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        assigned_follow_up_owner: 'Smoke Test',
        follow_up_outcome: 'Spoke - Scheduled',
      }),
    });
    requireCondition(update.assigned_follow_up_owner === 'Smoke Test', 'Follow-up owner update was not persisted.');
    requireCondition(update.follow_up_outcome === 'Spoke - Scheduled', 'Follow-up outcome update was not persisted.');

    const updatedQueue = await requestJson<{ rows: QueueRow[] }>('/reactivations');
    const updatedTarget = updatedQueue.rows.find((row) => row.id === target.id);
    requireCondition(updatedTarget, 'Updated fake-data row disappeared from the reactivation queue.');
    requireCondition(updatedTarget.assigned_follow_up_owner === 'Smoke Test', 'Updated queue owner did not match.');
    requireCondition(updatedTarget.follow_up_outcome === 'Spoke - Scheduled', 'Updated queue outcome did not match.');

    const exportResponse = await request('/exports/inquiries.csv');
    requireCondition(
      (exportResponse.headers.get('content-type') || '').includes('text/csv'),
      'Inquiry export did not return CSV content.',
    );
    const exportedCsv = await exportResponse.text();
    for (const email of sourceEmails) {
      requireCondition(exportedCsv.toLowerCase().includes(email), `Inquiry export is missing ${email}.`);
    }
    requireCondition(exportedCsv.includes('Spoke - Scheduled'), 'Inquiry export is missing the updated outcome.');

    workflowResult = {
      previewed: preview.totalRows,
      imported: imported.imported,
      reactivationRowsVerified: importedQueueRows.length,
      updatedInquiryId: target.id,
    };
  } catch (error) {
    workflowError = error;
  }

  let cleanup: { inserted: number };
  try {
    cleanup = await resetDemo();
  } catch (cleanupError) {
    if (workflowError) {
      throw new AggregateError([workflowError, cleanupError], 'Smoke workflow and demo cleanup both failed.');
    }
    throw cleanupError;
  }
  if (workflowError) throw workflowError;
  requireCondition(workflowResult, 'Smoke workflow did not produce a result.');

  return { ...workflowResult, resetInserted: cleanup.inserted };
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log([
      'Usage: npm run smoke:reactivation',
      '',
      'Environment variables:',
      '  CBOS_API_BASE_URL               API base URL (default: http://127.0.0.1:4000/api)',
      '  CBOS_AUTH_TOKEN                 Staff bearer token when authentication is enabled',
      '  CBOS_SMOKE_CSV                  Override the fake-data CSV path',
      '  CBOS_SMOKE_ALLOW_REMOTE_RESET   Set to true to permit a non-local demo reset',
    ].join('\n'));
    return;
  }

  const defaultCsvPath = path.resolve(
    __dirname,
    '../../../docs/METASOFT_REACTIVATION_DEMO.csv',
  );
  const csvPath = process.env.CBOS_SMOKE_CSV || defaultCsvPath;
  const csvText = await readFile(csvPath, 'utf8');
  const result = await runReactivationSmoke({
    baseUrl: process.env.CBOS_API_BASE_URL || 'http://127.0.0.1:4000/api',
    csvText,
    authToken: process.env.CBOS_AUTH_TOKEN || '',
    allowRemoteReset: process.env.CBOS_SMOKE_ALLOW_REMOTE_RESET === 'true',
  });
  console.log(JSON.stringify({ ok: true, csvPath, ...result }, null, 2));
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
