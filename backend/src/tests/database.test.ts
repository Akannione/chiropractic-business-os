/**
 * Integration tests against a real MongoDB.
 *
 * The unit suite stubs Inquiry.find, which means the query layer itself is
 * never exercised: filter construction, index-backed lookups, the aggregation,
 * and the merge all pass their tests while talking to a fake. Most of what
 * changed recently lives exactly there, so it needs a real database.
 *
 * Runs against a dedicated database and drops it afterwards, so it cannot
 * touch demo or production data. Skips cleanly when MongoDB is unavailable,
 * so `npm run test` stays runnable anywhere.
 *
 * Run with: npm run test:db
 */

import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Activity } from '../models/Activity.js';
import { Inquiry } from '../models/Inquiry.js';
import {
  buildInquiryDocument,
  listInquiriesPage,
  listReactivationCandidates,
} from '../services/inquiryService.js';
import { calculateKpis, calculateKpisFromDatabase } from '../services/kpiService.js';
import { buildReactivationQueue } from '../services/reactivationService.js';
import { findDuplicateGroups, mergeInquiries } from '../services/duplicateService.js';
import { addDays, startOfToday } from '../utils/date.js';

const TEST_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/cbos_integration_test';

const today = startOfToday();
const yesterday = addDays(today, -1);
const tomorrow = addDays(today, 1);

/**
 * buildInquiryDocument always stamps created_at with the current time, which is
 * correct for real writes but means a fixture cannot backdate a record through
 * it. Apply created_at afterwards so merge ordering can actually be tested.
 */
function inquiry(overrides: Record<string, unknown> & { created_at?: Date }) {
  const { created_at, ...rest } = overrides;
  const document = buildInquiryDocument({
    name: 'Test Patient',
    phone: '404-555-0100',
    email: 'test@example.com',
    service_needed: 'Spinal Adjustment',
    source: 'Website',
    status: 'New Inquiry',
    estimated_value: 100,
    ...rest,
  } as never);
  return created_at ? { ...document, created_at } : document;
}

async function seed() {
  await Inquiry.deleteMany({});
  await Activity.deleteMany({});
  await Inquiry.insertMany([
    // No follow-up date at all. BSON sorts null before dates, so a bare
    // `$lt: today` would wrongly match this in the Overdue view.
    inquiry({ name: 'No Date', email: 'nodate@example.com', phone: '404-555-0001' }),
    inquiry({
      name: 'Overdue Patient',
      email: 'overdue@example.com',
      phone: '404-555-0002',
      next_follow_up_date: yesterday.toISOString().slice(0, 10),
    }),
    inquiry({
      name: 'Due Today Patient',
      email: 'duetoday@example.com',
      phone: '404-555-0003',
      next_follow_up_date: today.toISOString().slice(0, 10),
    }),
    inquiry({
      name: 'Future Patient',
      email: 'future@example.com',
      phone: '404-555-0004',
      next_follow_up_date: tomorrow.toISOString().slice(0, 10),
    }),
    // Lost, and overdue. Every follow-up view must exclude it.
    inquiry({
      name: 'Lost Patient',
      email: 'lost@example.com',
      phone: '404-555-0005',
      status: 'Lost',
      next_follow_up_date: yesterday.toISOString().slice(0, 10),
    }),
    inquiry({
      name: 'Flagged Patient',
      email: 'flagged@example.com',
      phone: '404-555-0006',
      status: 'Follow-Up Needed',
    }),
    inquiry({
      name: 'Active Patient Record',
      email: 'active@example.com',
      phone: '404-555-0007',
      status: 'Active Patient',
      source: 'Referral',
      estimated_value: 500,
      notes: 'Searchable haystack phrase',
    }),
    // Reactivation eligibility.
    inquiry({
      name: 'Recall Due',
      email: 'recall@example.com',
      phone: '404-555-0008',
      last_visit_date: addDays(today, -45).toISOString().slice(0, 10),
      expected_visit_frequency_days: 30,
    }),
    inquiry({
      name: 'Dead Recall',
      email: 'deadrecall@example.com',
      phone: '404-555-0009',
      patient_type: 'Dead Lead',
      last_visit_date: addDays(today, -45).toISOString().slice(0, 10),
      expected_visit_frequency_days: 30,
    }),
  ]);
}

async function testFollowUpFiltersHandleNulls() {
  const overdue = await listInquiriesPage({ followUp: 'Overdue', pageSize: 100 });
  const names = overdue.rows.map((r) => r.name).sort();
  assert.deepEqual(names, ['Overdue Patient'],
    'Overdue must exclude null follow-up dates and Lost inquiries');

  const dueToday = await listInquiriesPage({ followUp: 'Due Today', pageSize: 100 });
  assert.deepEqual(dueToday.rows.map((r) => r.name), ['Due Today Patient']);

  const needs = await listInquiriesPage({ followUp: 'Needs Follow-Up', pageSize: 100 });
  assert.deepEqual(needs.rows.map((r) => r.name).sort(),
    ['Due Today Patient', 'Flagged Patient', 'Overdue Patient'],
    'Needs Follow-Up is status-flagged or dated today or earlier, never Lost');
}

/**
 * Pins how MongoDB treats null and missing fields in a range query.
 *
 * This was written down backwards once: BSON *sort* order does place null
 * before dates, from which it looked as though a bare `$lt: <Date>` would
 * match a record with no follow-up date. It does not. Comparison operators are
 * type-bracketed, so `$lt` against a Date only ever considers Date values.
 * Both halves are asserted here so the distinction stops being folklore.
 */
async function testRangeQueriesAreTypeBracketed() {
  const probe = mongoose.connection.collection('null_probe');
  await probe.deleteMany({});
  await probe.insertMany([
    { tag: 'null-date', d: null },
    { tag: 'missing-field' },
    { tag: 'past-date', d: yesterday },
  ]);

  const bare = await probe.find({ d: { $lt: today } }).toArray();
  assert.deepEqual(bare.map((r) => r.tag), ['past-date'],
    '$lt against a Date must ignore null and missing fields');

  const guarded = await probe.find({ d: { $ne: null, $lt: today } }).toArray();
  assert.deepEqual(guarded.map((r) => r.tag), ['past-date'],
    'the $ne: null guard is redundant here, not load-bearing');

  const sorted = await probe.find({}).sort({ d: 1 }).toArray();
  assert.equal(sorted[0].tag, 'null-date',
    'sort order does put null first, which is the fact that misled the original comment');

  await probe.drop();
}

async function testFilterClausesDoNotCollide() {
  // A follow-up view excludes Lost, so pairing it with status=Lost must match
  // nothing. An earlier implementation let one overwrite the other.
  const conflicting = await listInquiriesPage({ status: 'Lost', followUp: 'Overdue', pageSize: 100 });
  assert.equal(conflicting.total, 0);

  const lost = await listInquiriesPage({ status: 'Lost', pageSize: 100 });
  assert.equal(lost.total, 1, 'status=Lost alone still returns the Lost inquiry');
}

async function testSearchSpansEveryField() {
  for (const [label, term, expected] of [
    ['name', 'Active Patient Record', 'Active Patient Record'],
    ['email', 'flagged@example.com', 'Flagged Patient'],
    ['phone', '404-555-0008', 'Recall Due'],
    ['notes', 'haystack', 'Active Patient Record'],
  ] as const) {
    const result = await listInquiriesPage({ search: term, pageSize: 100 });
    assert.equal(result.total, 1, `search by ${label} should match one record`);
    assert.equal(result.rows[0].name, expected);
  }

  // Regex metacharacters must be treated as literal text, not a pattern.
  const injected = await listInquiriesPage({ search: '.*', pageSize: 100 });
  assert.equal(injected.total, 0, 'search input must be escaped, not run as a pattern');
}

async function testPagination() {
  const total = await Inquiry.countDocuments();
  const first = await listInquiriesPage({ page: 1, pageSize: 3 });
  const second = await listInquiriesPage({ page: 2, pageSize: 3 });

  assert.equal(first.total, total, 'total counts every match, not the page');
  assert.equal(first.rows.length, 3);
  const overlap = first.rows.filter((row) =>
    second.rows.some((other) => String(other._id) === String(row._id)));
  assert.equal(overlap.length, 0, 'pages must not repeat records');

  const capped = await listInquiriesPage({ pageSize: 9999 });
  assert.equal(capped.pageSize, 100, 'page size is capped');
}

async function testReactivationCandidatesMatchTheQueue() {
  const candidates = await listReactivationCandidates();
  const queue = buildReactivationQueue(candidates as never);

  assert.deepEqual(queue.rows.map((row) => row.name), ['Recall Due'],
    'dead leads and inquiries without visit history are excluded in the database');

  // The narrowed query must not drop anything the JavaScript rules would keep.
  const everything = await Inquiry.find().lean({ virtuals: true });
  const unfiltered = buildReactivationQueue(everything as never);
  assert.deepEqual(
    queue.rows.map((r) => r.name).sort(),
    unfiltered.rows.map((r) => r.name).sort(),
    'filtering in the database must produce the same queue as filtering in JavaScript',
  );
}

async function testKpiAggregationParity() {
  const rows = await Inquiry.find().lean();
  const inJs = calculateKpis(rows as never);
  const inDb = await calculateKpisFromDatabase();
  for (const key of Object.keys(inJs) as (keyof typeof inJs)[]) {
    assert.equal(inDb[key], inJs[key], `KPI ${String(key)} diverged from the documented definition`);
  }
}

async function testDuplicateGroupingAgainstRealData() {
  await Inquiry.insertMany([
    inquiry({ name: 'Repeat Patient', email: 'repeat@example.com', phone: '470-555-0700' }),
    inquiry({ name: 'repeat  patient', email: 'REPEAT@example.com', phone: '(470) 555 0700' }),
    inquiry({ name: 'Elena Household', email: 'house@example.com', phone: '470-555-0800' }),
    inquiry({ name: 'Marco Household', email: 'house@example.com', phone: '470-555-0800' }),
  ]);

  const groups = await findDuplicateGroups();
  assert.equal(groups.length, 1, 'only the repeated patient forms a group');

  const records = await Inquiry.find({ _id: { $in: groups[0] } }).lean();
  assert.ok(records.every((r) => /repeat/i.test(String(r.name))),
    'a household sharing a phone and email must never be grouped');
}

async function testMergeKeepsTheRicherRecord() {
  await Inquiry.deleteMany({});
  await Activity.deleteMany({});

  const [keep, discard] = await Inquiry.insertMany([
    inquiry({
      name: 'Merge Target',
      email: 'merge@example.com',
      phone: '470-555-0900',
      status: 'New Inquiry',
      estimated_value: 150,
      notes: 'First note.',
      last_visit_date: addDays(today, -60).toISOString().slice(0, 10),
      created_at: addDays(today, -10),
    }),
    inquiry({
      name: 'Merge Target',
      email: 'merge@example.com',
      phone: '470-555-0900',
      status: 'Active Patient',
      estimated_value: 400,
      notes: 'Second note.',
      assigned_follow_up_owner: 'Doc',
      last_visit_date: addDays(today, -5).toISOString().slice(0, 10),
      created_at: today,
    }),
  ]);

  await Activity.create({ inquiry_id: discard._id, action: 'Inquiry created', created_at: new Date() });

  const { merged, movedActivities } = await mergeInquiries(String(keep._id), String(discard._id));

  assert.equal(merged.status, 'Active Patient', 'a converted patient must not be downgraded');
  assert.equal(merged.estimated_value, 400, 'the higher estimate wins; estimates are never summed');
  assert.equal(merged.assigned_follow_up_owner, 'Doc', 'blank fields fill from the discarded record');
  assert.ok(merged.notes.includes('First note.') && merged.notes.includes('Second note.'),
    'notes from both records survive');
  assert.equal(
    merged.last_visit_date?.toISOString().slice(0, 10),
    addDays(today, -5).toISOString().slice(0, 10),
    'the later visit date wins',
  );
  assert.equal(
    merged.created_at.toISOString().slice(0, 10),
    addDays(today, -10).toISOString().slice(0, 10),
    'the earlier created date wins',
  );

  assert.equal(movedActivities, 1, 'the discarded history is repointed, not deleted');
  assert.equal(await Inquiry.countDocuments({ _id: discard._id }), 0, 'the discarded record is removed');
  assert.equal(await Activity.countDocuments({ inquiry_id: discard._id }), 0, 'no orphaned history');
  assert.ok(await Activity.countDocuments({ action: 'Inquiries merged' }) > 0, 'the merge is recorded');

  await assert.rejects(
    () => mergeInquiries(String(keep._id), String(keep._id)),
    /itself/i,
    'a record cannot be merged into itself',
  );
}

async function main() {
  try {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 3000 });
  } catch {
    console.log('Database tests skipped: no MongoDB reachable at ' + TEST_URI);
    process.exit(0);
  }

  if (!mongoose.connection.name.includes('test')) {
    throw new Error(`Refusing to run against database "${mongoose.connection.name}".`);
  }

  try {
    await Inquiry.init();
    await seed();

    await testFollowUpFiltersHandleNulls();
    await testRangeQueriesAreTypeBracketed();
    await testFilterClausesDoNotCollide();
    await testSearchSpansEveryField();
    await testPagination();
    await testReactivationCandidatesMatchTheQueue();
    await testKpiAggregationParity();
    await testDuplicateGroupingAgainstRealData();
    await testMergeKeepsTheRicherRecord();

    console.log('Database tests passed.');
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
