/**
 * Measures read-path performance against a realistic collection size.
 *
 * The demo database holds around a dozen records, which hides the cost of the
 * unfiltered find() calls behind every read endpoint. This seeds a synthetic
 * clinic and times the real service functions so optimisation work can be
 * proven rather than assumed.
 *
 * Always runs against a dedicated benchmark database, never the demo or
 * production data. Override the size with BENCH_SIZE.
 *
 * Run with: npm run bench --prefix backend
 */

import mongoose from 'mongoose';
import { Inquiry } from '../models/Inquiry.js';
import { listInquiriesForReports, listInquiriesPage, listReactivationCandidates } from '../services/inquiryService.js';
import { calculateKpis, calculateKpisFromDatabase } from '../services/kpiService.js';
import { buildReactivationQueue } from '../services/reactivationService.js';
import { buildWeeklySummary } from '../services/reportService.js';

const BENCH_DB = 'cbos_benchmark';
const BENCH_URI = process.env.BENCH_MONGODB_URI || `mongodb://127.0.0.1:27017/${BENCH_DB}`;
const SIZE = Number(process.env.BENCH_SIZE || 20_000);

const SERVICES = [
  'Spinal Adjustment', 'Sports Injury Treatment', 'Wellness Consultation',
  'Neck Pain Evaluation', 'Back Pain Consultation', 'Massage Therapy',
];
const SOURCES = ['Google', 'Referral', 'Insurance', 'Website', 'Phone Call'];
const STATUSES = ['New Inquiry', 'Consultation Scheduled', 'Active Patient', 'Lost', 'Follow-Up Needed'];
const PATIENT_TYPES = ['New Patient', 'Existing Patient', 'Reactivation', 'Dead Lead'];

const day = 24 * 60 * 60 * 1000;

/** Deterministic pseudo-random so runs are comparable. */
function seeded(i: number, mod: number) {
  return (i * 2654435761) % mod;
}

function buildRows(count: number) {
  const now = Date.now();
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const hasVisit = seeded(i, 10) < 7;
    const created = new Date(now - seeded(i, 900) * day);
    rows.push({
      name: `Patient ${i}`,
      phone: `404-555-${String(i % 10000).padStart(4, '0')}`,
      email: `patient${i}@example.com`,
      service_needed: SERVICES[seeded(i, SERVICES.length)],
      source: SOURCES[seeded(i, SOURCES.length)],
      status: STATUSES[seeded(i, STATUSES.length)],
      estimated_value: 100 + seeded(i, 400),
      notes: `Synthetic benchmark record ${i}. Not real patient information.`,
      next_follow_up_date: seeded(i, 3) === 0 ? new Date(now - seeded(i, 60) * day) : null,
      patient_type: PATIENT_TYPES[seeded(i, PATIENT_TYPES.length)],
      last_visit_date: hasVisit ? new Date(now - seeded(i, 400) * day) : null,
      expected_visit_frequency_days: hasVisit ? [14, 30, 60, 90][seeded(i, 4)] : null,
      assigned_follow_up_owner: seeded(i, 2) === 0 ? 'Front Desk' : 'Doc',
      created_at: created,
      updated_at: created,
    });
  }
  return rows;
}

/** `fn` returns how many documents the database actually handed back. */
async function time(label: string, fn: () => Promise<number>) {
  const start = process.hrtime.bigint();
  const fetched = await fn();
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  return { label, ms, fetched };
}

async function main() {
  await mongoose.connect(BENCH_URI, { serverSelectionTimeoutMS: 10_000 });
  const dbName = mongoose.connection.name;
  if (!dbName.includes('benchmark')) {
    throw new Error(`Refusing to run against database "${dbName}"; expected a benchmark database.`);
  }

  const existing = await Inquiry.countDocuments();
  if (existing !== SIZE) {
    console.log(`seeding ${SIZE.toLocaleString()} records into ${dbName} ...`);
    await Inquiry.deleteMany({});
    const rows = buildRows(SIZE);
    for (let i = 0; i < rows.length; i += 5000) {
      await Inquiry.insertMany(rows.slice(i, i + 5000), { ordered: false });
    }
  }

  // Mongoose builds indexes asynchronously on model init; wait so the report
  // below describes the indexes the timings actually ran against.
  await Inquiry.init();

  const count = await Inquiry.countDocuments();
  const indexes = await mongoose.connection.db!.collection('inquiries').indexes();
  console.log(`\ndatabase: ${dbName}`);
  console.log(`records:  ${count.toLocaleString()}`);
  console.log(`indexes:  ${indexes.map((i) => i.name).join(', ')}\n`);

  const results = [];

  results.push(await time('GET /api/kpis (in JavaScript)', async () => {
    const rows = await listInquiriesForReports();
    calculateKpis(rows as never);
    return rows.length;
  }));

  results.push(await time('GET /api/kpis (aggregation)', async () => {
    await calculateKpisFromDatabase();
    return 1;
  }));

  results.push(await time('GET /api/weekly-summary', async () => {
    const rows = await listInquiriesForReports();
    buildWeeklySummary(rows as never);
    return rows.length;
  }));

  results.push(await time('GET /api/reactivations', async () => {
    const rows = await listReactivationCandidates();
    buildReactivationQueue(rows as never);
    return rows.length;
  }));

  results.push(await time('GET /api/inquiries (page 1)', async () => {
    const result = await listInquiriesPage({ page: 1, pageSize: 25 });
    return result.rows.length;
  }));

  results.push(await time('GET /api/inquiries (search)', async () => {
    const result = await listInquiriesPage({ page: 1, pageSize: 25, search: 'Patient 1234' });
    return result.rows.length;
  }));

  results.push(await time('GET /api/inquiries (whole collection)', async () => {
    const rows = await Inquiry.find().sort({ created_at: -1, _id: -1 }).lean();
    return rows.length;
  }));

  // Mirrors importService duplicate detection.
  results.push(await time('CSV import duplicate scan', async () => {
    const rows = await Inquiry.find({}, { email: 1, phone: 1 }).lean();
    return rows.length;
  }));

  // A single-record lookup, the shape any detail view or update uses.
  const targetEmail = `patient${Math.floor(SIZE / 2)}@example.com`;
  results.push(await time('lookup one inquiry by email', async () => {
    const row = await Inquiry.findOne({ email: targetEmail }).lean();
    return row ? 1 : 0;
  }));

  console.log(`${'operation'.padEnd(34)}${'ms'.padStart(10)}${'docs fetched'.padStart(14)}`);
  console.log('-'.repeat(58));
  for (const r of results) {
    console.log(`${r.label.padEnd(34)}${r.ms.toFixed(1).padStart(10)}${r.fetched.toLocaleString().padStart(14)}`);
  }
  console.log('-'.repeat(58));
  console.log(`${'TOTAL'.padEnd(34)}${results.reduce((a, r) => a + r.ms, 0).toFixed(1).padStart(10)}${results.reduce((a, r) => a + r.fetched, 0).toLocaleString().padStart(14)}`);

  // Whether the by-email lookup used an index or scanned the whole collection.
  const plan = await Inquiry.find({ email: targetEmail }).explain('executionStats') as never as {
    executionStats: { totalDocsExamined: number; nReturned: number };
  };
  const stats = plan.executionStats;
  console.log(`\nby-email lookup examined ${stats.totalDocsExamined.toLocaleString()} documents to return ${stats.nReturned}`);
  console.log(`collection total: ${count.toLocaleString()}`);

  // The aggregation must agree with the documented JavaScript definition on
  // every field. Divergence here means the analytics contract is broken.
  const inJs = calculateKpis(await listInquiriesForReports() as never);
  const inDb = await calculateKpisFromDatabase();
  const mismatches = (Object.keys(inJs) as (keyof typeof inJs)[])
    .filter((k) => inJs[k] !== inDb[k])
    .map((k) => `  ${k}: javascript=${inJs[k]} aggregation=${inDb[k]}`);

  if (mismatches.length) {
    console.error(`\nKPI PARITY FAILED across ${count.toLocaleString()} records:`);
    console.error(mismatches.join('\n'));
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`KPI parity: aggregation matches JavaScript on all ${Object.keys(inJs).length} metrics`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
