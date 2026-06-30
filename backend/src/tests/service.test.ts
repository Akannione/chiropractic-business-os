import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { errorHandler } from '../middleware/errorHandler.js';
import { Inquiry } from '../models/Inquiry.js';
import { inquiryRouter } from '../routes/inquiryRoutes.js';
import { runReactivationSmoke } from '../scripts/reactivationSmoke.js';
import { calculateKpis } from '../services/kpiService.js';
import {
  mapExternalRow,
  parseInquiryCsv,
  previewInquiryCsv,
} from '../services/importService.js';
import {
  buildReactivationQueue,
  type ReactivationQueue,
} from '../services/reactivationService.js';
import { buildWeeklySummary } from '../services/reportService.js';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const inquiries = [
  {
    status: 'Active Patient',
    estimated_value: 300,
    source: 'Google',
    created_at: today,
    next_follow_up_date: null,
  },
  {
    status: 'Follow-Up Needed',
    estimated_value: 200,
    source: 'Referral',
    created_at: today,
    next_follow_up_date: yesterday,
  },
] as never;

const kpis = calculateKpis(inquiries);
assert.equal(kpis.totalPatientInquiries, 2);
assert.equal(kpis.activePatients, 1);
assert.equal(kpis.followUpsNeeded, 1);
assert.equal(kpis.overdueFollowUps, 1);
assert.equal(kpis.estimatedTreatmentValue, 500);

const csvRows = parseInquiryCsv('name,phone,email\nTest Patient,404-555-0100,test@example.com\n');
assert.equal(csvRows.length, 1);
assert.equal(csvRows[0].name, 'Test Patient');

const bomCsvRows = parseInquiryCsv(
  '\uFEFFname,phone,email,service_needed\nBOM Patient,404-555-0109,bom@example.com,Spinal Adjustment\n',
);
assert.equal(bomCsvRows[0].name, 'BOM Patient');

const multilineCsvRows = parseInquiryCsv(
  [
    'name,phone,email,service_needed,notes',
    '"Multiline Patient",404-555-0119,multiline@example.com,Spinal Adjustment,"Called Monday',
    'Needs follow-up Friday"',
  ].join('\n'),
);
assert.equal(multilineCsvRows.length, 1);
assert.equal(multilineCsvRows[0].notes, 'Called Monday\nNeeds follow-up Friday');

const quotedCsvRows = parseInquiryCsv(
  [
    'name,phone,email,service_needed,notes',
    'Quoted Patient,404-555-0121,quoted@example.com,Spinal Adjustment,"Patient said ""yes"", call Friday"',
  ].join('\n'),
);
assert.equal(quotedCsvRows[0].notes, 'Patient said "yes", call Friday');

const crlfCsvRows = parseInquiryCsv(
  'name,phone,email,service_needed\r\n\r\nCRLF Patient,404-555-0122,crlf@example.com,Spinal Adjustment\r\n',
);
assert.equal(crlfCsvRows.length, 1);
assert.equal(crlfCsvRows[0].name, 'CRLF Patient');

const blankOptionalRow = mapExternalRow(parseInquiryCsv(
  'name,phone,email,service_needed,patient_type,last_visit_date,expected_visit_frequency_days\nBlank Optional,404-555-0123,blank@example.com,Spinal Adjustment,,,\n',
)[0]);
assert.equal(blankOptionalRow.patient_type, 'New Patient');
assert.equal(blankOptionalRow.last_visit_date, null);
assert.equal(blankOptionalRow.expected_visit_frequency_days, null);

const weeklySummary = buildWeeklySummary(inquiries);
assert.equal(weeklySummary.totalPatientInquiries, 2);
assert.ok(weeklySummary.plainEnglishSummary.includes('patient inquiries'));

const reactivationToday = new Date('2026-06-24T12:00:00.000Z');
const reactivationQueue = buildReactivationQueue(
  [
    {
      _id: 'overdue',
      name: 'Overdue Patient',
      phone: '404-555-0101',
      email: 'overdue@example.com',
      service_needed: 'Spinal Adjustment',
      status: 'Active Patient',
      patient_type: 'Existing Patient',
      last_visit_date: new Date('2026-05-20T00:00:00.000Z'),
      expected_visit_frequency_days: 30,
      assigned_follow_up_owner: 'Front Desk',
      follow_up_outcome: 'Not Contacted',
      notes: '',
    },
    {
      _id: 'due',
      name: 'Due Today Patient',
      phone: '404-555-0102',
      email: 'due@example.com',
      service_needed: 'Wellness Consultation',
      status: 'Active Patient',
      patient_type: 'Reactivation',
      last_visit_date: new Date('2026-06-17T00:00:00.000Z'),
      expected_visit_frequency_days: 7,
      assigned_follow_up_owner: 'Doc',
      follow_up_outcome: 'Left Voicemail',
      notes: '',
    },
    {
      _id: 'upcoming',
      name: 'Upcoming Patient',
      phone: '404-555-0103',
      email: 'upcoming@example.com',
      service_needed: 'Massage Therapy',
      status: 'Active Patient',
      patient_type: 'Existing Patient',
      last_visit_date: new Date('2026-06-20T00:00:00.000Z'),
      expected_visit_frequency_days: 7,
      assigned_follow_up_owner: '',
      follow_up_outcome: 'Not Contacted',
      notes: '',
    },
    {
      _id: 'excluded',
      name: 'Dead Lead',
      phone: '404-555-0104',
      email: 'dead@example.com',
      service_needed: 'Spinal Adjustment',
      status: 'Lost',
      patient_type: 'Dead Lead',
      last_visit_date: new Date('2026-05-01T00:00:00.000Z'),
      expected_visit_frequency_days: 30,
      assigned_follow_up_owner: '',
      follow_up_outcome: 'No Response',
      notes: '',
    },
  ] as never,
  reactivationToday,
);
assert.deepEqual(
  reactivationQueue.rows.map((row) => row.name),
  ['Overdue Patient', 'Due Today Patient', 'Upcoming Patient'],
);
assert.equal(reactivationQueue.overdue, 1);
assert.equal(reactivationQueue.dueToday, 1);
assert.equal(reactivationQueue.upcoming, 1);
assert.equal(reactivationQueue.rows[0].days_overdue, 5);
assert.equal(reactivationQueue.rows[1].reactivation_status, 'Due Today');
assert.equal(reactivationQueue.rows[2].next_reactivation_date, '2026-06-27');

const metaSoftRows = parseInquiryCsv(
  [
    'Patient Name,Phone,Email,Requested Service,Patient Type,Appointment Status,Requested Appointment,Offer Type,Last Visit Date,Visit Frequency Days,Assigned Follow-Up Owner,Follow-Up Outcome,Notes',
    'Taylor Brooks,404-555-0110,taylor@example.com,Massage Therapy,Existing Patient,Appointment Scheduled,Friday 10 AM,Groupon,2026-05-20,30,Front Desk,Left Voicemail,Requested reactivation call',
  ].join('\n'),
);
const mappedMetaSoftRow = mapExternalRow(metaSoftRows[0]);
assert.equal(mappedMetaSoftRow.patient_type, 'Existing Patient');
assert.equal(mappedMetaSoftRow.appointment_status, 'Appointment Scheduled');
assert.equal(mappedMetaSoftRow.appointment_request, 'Friday 10 AM');
assert.equal(mappedMetaSoftRow.offer_type, 'Groupon');
assert.equal(mappedMetaSoftRow.last_visit_date, '2026-05-20');
assert.equal(mappedMetaSoftRow.expected_visit_frequency_days, 30);
assert.equal(mappedMetaSoftRow.assigned_follow_up_owner, 'Front Desk');
assert.equal(mappedMetaSoftRow.follow_up_outcome, 'Left Voicemail');

function assertReactivationQueueContract(value: unknown): asserts value is ReactivationQueue {
  assert.ok(value && typeof value === 'object');
  const queue = value as Record<string, unknown>;
  assert.deepEqual(Object.keys(queue).sort(), ['dueToday', 'overdue', 'rows', 'upcoming']);
  assert.ok(Array.isArray(queue.rows));
  assert.equal(typeof queue.overdue, 'number');
  assert.equal(typeof queue.dueToday, 'number');
  assert.equal(typeof queue.upcoming, 'number');

  for (const valueRow of queue.rows) {
    assert.ok(valueRow && typeof valueRow === 'object');
    const row = valueRow as Record<string, unknown>;
    assert.deepEqual(Object.keys(row).sort(), [
      'assigned_follow_up_owner',
      'days_overdue',
      'email',
      'expected_visit_frequency_days',
      'follow_up_outcome',
      'id',
      'last_visit_date',
      'name',
      'next_follow_up_date',
      'next_reactivation_date',
      'notes',
      'patient_type',
      'phone',
      'reactivation_status',
      'service_needed',
      'status',
    ]);
    for (const key of [
      'assigned_follow_up_owner',
      'email',
      'follow_up_outcome',
      'id',
      'last_visit_date',
      'name',
      'next_follow_up_date',
      'next_reactivation_date',
      'notes',
      'patient_type',
      'phone',
      'reactivation_status',
      'service_needed',
      'status',
    ]) {
      assert.equal(typeof row[key], 'string', `${key} must be a string`);
    }
    assert.equal(typeof row.expected_visit_frequency_days, 'number');
    assert.equal(typeof row.days_overdue, 'number');
    assert.ok(['Overdue', 'Due Today', 'Upcoming'].includes(String(row.reactivation_status)));
  }
}

async function testCsvIngestionMatrix() {
  const originalInquiryFind = Inquiry.find;
  let existingContacts: unknown[] = [];
  Inquiry.find = (() => ({
    lean: async () => existingContacts,
  })) as unknown as typeof Inquiry.find;

  try {
    const invalidWorkflowPreview = await previewInquiryCsv(
      [
        'name,phone,email,service_needed,last_visit_date,expected_visit_frequency_days',
        'Invalid Workflow,404-555-0120,invalid@example.com,Spinal Adjustment,not-a-date,weekly',
      ].join('\n'),
    );
    assert.equal(invalidWorkflowPreview.importableRows, 0);
    assert.deepEqual(invalidWorkflowPreview.rows[0].errors, [
      'Last Visit Date must use YYYY-MM-DD and be a real date.',
      'Visit Frequency Days must be a positive whole number.',
    ]);

    const missingRequiredPreview = await previewInquiryCsv(
      'phone,email\n404-555-0124,missing@example.com\n',
    );
    assert.equal(missingRequiredPreview.importableRows, 0);
    assert.deepEqual(missingRequiredPreview.rows[0].errors, [
      'Patient name is required.',
      'Requested Service is required.',
    ]);

    const withinFileDuplicatePreview = await previewInquiryCsv(
      [
        'name,phone,email,service_needed',
        'First Patient,404 555 0125,duplicate@example.com,Spinal Adjustment',
        'Second Patient,404-555-0125,DUPLICATE@example.com,Wellness Consultation',
      ].join('\n'),
    );
    assert.equal(withinFileDuplicatePreview.totalRows, 2);
    assert.equal(withinFileDuplicatePreview.importableRows, 1);
    assert.equal(withinFileDuplicatePreview.duplicateRows, 1);
    assert.equal(withinFileDuplicatePreview.rows[0].duplicate, false);
    assert.equal(withinFileDuplicatePreview.rows[1].duplicate, true);

    existingContacts = [{
      email: 'existing@example.com',
      phone: '4045550126',
    }];
    const existingDuplicatePreview = await previewInquiryCsv(
      [
        'name,phone,email,service_needed',
        'Email Duplicate,404-555-0190,EXISTING@example.com,Spinal Adjustment',
        'Phone Duplicate,404.555.0126,new@example.com,Wellness Consultation',
      ].join('\n'),
    );
    assert.equal(existingDuplicatePreview.importableRows, 0);
    assert.equal(existingDuplicatePreview.duplicateRows, 2);
    assert.ok(existingDuplicatePreview.rows.every((row) => row.duplicate));
  } finally {
    Inquiry.find = originalInquiryFind;
  }
}

async function testReactivationSmokeWorkflow() {
  const smokeCsv = [
    'name,phone,email,service_needed,patient_type,last_visit_date,expected_visit_frequency_days',
    'Smoke Patient,404-555-0130,smoke@example.com,Spinal Adjustment,Existing Patient,2026-06-01,30',
    'Excluded Lead,404-555-0131,excluded@example.com,Wellness Consultation,Dead Lead,2026-05-01,30',
  ].join('\n');
  const calls = [
    { method: 'GET', path: '/config', body: { demoMode: true } },
    { method: 'GET', path: '/auth/status', body: { authEnabled: true } },
    { method: 'POST', path: '/demo/reset', body: { inserted: 8 } },
    {
      method: 'POST',
      path: '/imports/inquiries.csv/preview',
      body: { totalRows: 2, importableRows: 2, duplicateRows: 0, errorRows: 0, rows: [] },
    },
    {
      method: 'POST',
      path: '/imports/inquiries.csv',
      body: { imported: 2, skippedDuplicates: 0, failed: 0, errors: [] },
    },
    {
      method: 'GET',
      path: '/reactivations',
      body: {
        rows: [{
          id: 'smoke-id',
          email: 'smoke@example.com',
          reactivation_status: 'Upcoming',
          assigned_follow_up_owner: '',
          follow_up_outcome: 'Not Contacted',
        }],
        overdue: 0,
        dueToday: 0,
        upcoming: 1,
      },
    },
    {
      method: 'PATCH',
      path: '/inquiries/smoke-id',
      body: {
        id: 'smoke-id',
        email: 'smoke@example.com',
        assigned_follow_up_owner: 'Smoke Test',
        follow_up_outcome: 'Spoke - Scheduled',
      },
    },
    {
      method: 'GET',
      path: '/reactivations',
      body: {
        rows: [{
          id: 'smoke-id',
          email: 'smoke@example.com',
          reactivation_status: 'Upcoming',
          assigned_follow_up_owner: 'Smoke Test',
          follow_up_outcome: 'Spoke - Scheduled',
        }],
        overdue: 0,
        dueToday: 0,
        upcoming: 1,
      },
    },
    {
      method: 'GET',
      path: '/exports/inquiries.csv',
      body: 'Patient Name,Email,Follow-Up Outcome\nSmoke Patient,smoke@example.com,Spoke - Scheduled\nExcluded Lead,excluded@example.com,No Response\n',
      contentType: 'text/csv',
    },
    { method: 'POST', path: '/demo/reset', body: { inserted: 8 } },
  ];

  const fakeFetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const expected = calls.shift();
    assert.ok(expected, `Unexpected request: ${String(input)}`);
    const url = new URL(String(input));
    assert.equal(url.pathname, `/api${expected.path}`);
    assert.equal(String(init?.method || 'GET').toUpperCase(), expected.method);
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('authorization'), 'Bearer test-token');
    if (expected.path.includes('/imports/')) {
      assert.equal(headers.get('content-type'), 'text/csv');
      assert.equal(init?.body, smokeCsv);
    }
    const contentType = expected.contentType || 'application/json';
    const body = contentType === 'application/json'
      ? JSON.stringify(expected.body)
      : String(expected.body);
    return new Response(body, { status: 200, headers: { 'content-type': contentType } });
  }) as typeof fetch;

  const result = await runReactivationSmoke({
    baseUrl: 'http://127.0.0.1:4000/api',
    csvText: smokeCsv,
    authToken: 'test-token',
    fetchImpl: fakeFetch,
  });

  assert.deepEqual(result, {
    previewed: 2,
    imported: 2,
    reactivationRowsVerified: 1,
    updatedInquiryId: 'smoke-id',
    resetInserted: 8,
  });
  assert.equal(calls.length, 0);

  let remoteFetchCalled = false;
  await assert.rejects(
    runReactivationSmoke({
      baseUrl: 'https://example.com/api',
      csvText: smokeCsv,
      fetchImpl: (async () => {
        remoteFetchCalled = true;
        return new Response();
      }) as typeof fetch,
    }),
    /Remote demo reset is blocked/,
  );
  assert.equal(remoteFetchCalled, false);

  const failurePaths: string[] = [];
  const failureResponses = [
    { body: { demoMode: true } },
    { body: { authEnabled: false } },
    { body: { inserted: 8 } },
    { body: { totalRows: 2, importableRows: 1, duplicateRows: 1, errorRows: 0 } },
    { body: { inserted: 8 } },
  ];
  const failingFetch = (async (input: string | URL | Request) => {
    failurePaths.push(new URL(String(input)).pathname);
    const response = failureResponses.shift();
    assert.ok(response, `Unexpected failure-path request: ${String(input)}`);
    return new Response(JSON.stringify(response.body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;
  await assert.rejects(
    runReactivationSmoke({
      baseUrl: 'http://127.0.0.1:4000/api',
      csvText: smokeCsv,
      fetchImpl: failingFetch,
    }),
    /Not every fake-data row was importable after reset/,
  );
  assert.deepEqual(failurePaths, [
    '/api/config',
    '/api/auth/status',
    '/api/demo/reset',
    '/api/imports/inquiries.csv/preview',
    '/api/demo/reset',
  ]);
}

async function testReactivationApiContract() {
  const originalInquiryFind = Inquiry.find;
  let contractRows: unknown[] = [
    {
      _id: 'contract-row',
      name: 'Contract Patient',
      phone: '404-555-0199',
      email: 'contract@example.com',
      service_needed: 'Spinal Adjustment',
      status: 'Active Patient',
      patient_type: 'Existing Patient',
      last_visit_date: new Date('2026-06-01T00:00:00.000Z'),
      expected_visit_frequency_days: 30,
      assigned_follow_up_owner: 'Front Desk',
      follow_up_outcome: 'Not Contacted',
      notes: 'Contract test fixture',
      next_follow_up_date: null,
    },
  ];

  Inquiry.find = (() => ({
    sort: () => ({
      lean: async () => contractRows,
    }),
  })) as unknown as typeof Inquiry.find;

  const contractApp = express();
  contractApp.use('/api', inquiryRouter);
  contractApp.use(errorHandler);
  const contractServer = contractApp.listen(0);

  try {
    const address = contractServer.address() as AddressInfo;
    const contractUrl = `http://127.0.0.1:${address.port}/api/reactivations`;

    const populatedResponse = await fetch(contractUrl);
    assert.equal(populatedResponse.status, 200);
    assert.match(populatedResponse.headers.get('content-type') || '', /^application\/json/);
    const populatedBody: unknown = await populatedResponse.json();
    assertReactivationQueueContract(populatedBody);
    assert.equal(populatedBody.rows.length, 1);

    contractRows = [];
    const emptyResponse = await fetch(contractUrl);
    assert.equal(emptyResponse.status, 200);
    const emptyBody: unknown = await emptyResponse.json();
    assertReactivationQueueContract(emptyBody);
    assert.deepEqual(emptyBody, {
      rows: [],
      overdue: 0,
      dueToday: 0,
      upcoming: 0,
    });
  } finally {
    Inquiry.find = originalInquiryFind;
    await new Promise<void>((resolve, reject) => {
      contractServer.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function runTests() {
  await testCsvIngestionMatrix();
  await testReactivationSmokeWorkflow();
  await testReactivationApiContract();
}

runTests()
  .then(() => console.log('Service tests passed.'))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
