/**
 * Verifies that a synthetic benchmark database restore is complete enough for
 * CBOS to trust: collection counts, indexes, and KPI semantics must match.
 *
 * This script does not create a backup or restore anything. It is deliberately
 * read-only so operators can run mongodump/mongorestore separately and then
 * prove the result.
 *
 * Usage:
 *   RESTORE_SOURCE_URI=mongodb://127.0.0.1:27017/cbos_benchmark \
 *   RESTORE_TARGET_URI=mongodb://127.0.0.1:27017/cbos_benchmark_restore \
 *   npm run verify:restore --prefix backend
 */

import mongoose from 'mongoose';
import { calculateKpisFromDatabase } from '../services/kpiService.js';

const SOURCE_URI = process.env.RESTORE_SOURCE_URI || 'mongodb://127.0.0.1:27017/cbos_benchmark';
const TARGET_URI = process.env.RESTORE_TARGET_URI || 'mongodb://127.0.0.1:27017/cbos_benchmark_restore';

type Snapshot = {
  name: string;
  inquiries: number;
  activities: number;
  inquiryIndexes: string[];
  activityIndexes: string[];
  kpis: Awaited<ReturnType<typeof calculateKpisFromDatabase>>;
};

function assertBenchmarkDatabase(name: string) {
  if (!name.includes('benchmark')) {
    throw new Error(`Refusing restore verification for database "${name}"; expected a benchmark database.`);
  }
}

async function snapshot(uri: string): Promise<Snapshot> {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection has no database handle.');
    const name = mongoose.connection.name;
    assertBenchmarkDatabase(name);

    const inquiries = await db.collection('inquiries').countDocuments();
    const activities = await db.collection('activities').countDocuments();
    const inquiryIndexes = (await db.collection('inquiries').indexes())
      .map((index) => index.name)
      .filter((name): name is string => Boolean(name))
      .sort();
    const activityIndexes = (await db.collection('activities').indexes())
      .map((index) => index.name)
      .filter((name): name is string => Boolean(name))
      .sort();
    const kpis = await calculateKpisFromDatabase();

    return { name, inquiries, activities, inquiryIndexes, activityIndexes, kpis };
  } finally {
    await mongoose.disconnect();
  }
}

function sameJson(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function main() {
  const source = await snapshot(SOURCE_URI);
  const target = await snapshot(TARGET_URI);

  const problems: string[] = [];
  if (source.inquiries !== target.inquiries) {
    problems.push(`inquiries: source=${source.inquiries}, restored=${target.inquiries}`);
  }
  if (source.activities !== target.activities) {
    problems.push(`activities: source=${source.activities}, restored=${target.activities}`);
  }
  if (!sameJson(source.inquiryIndexes, target.inquiryIndexes)) {
    problems.push('inquiry indexes differ');
  }
  if (!sameJson(source.activityIndexes, target.activityIndexes)) {
    problems.push('activity indexes differ');
  }
  if (!sameJson(source.kpis, target.kpis)) {
    problems.push('KPI results differ');
  }

  console.log(JSON.stringify({ source, restored: target }, null, 2));

  if (problems.length) {
    throw new Error(`Restore verification failed:\n- ${problems.join('\n- ')}`);
  }

  console.log('\nRestore verification passed: counts, indexes, and KPI semantics match.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
