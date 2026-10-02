import mongoose from 'mongoose';
import { env } from '../config/env.js';

const URI = process.env.VERIFY_INDEX_URI || env.mongoUri;

const expected: Record<string, string[]> = {
  inquiries: [
    '_id_',
    'email_1',
    'phone_1',
    'created_at_-1__id_-1',
    'status_1_next_follow_up_date_1',
    'status_1_patient_type_1_last_visit_date_1',
    'import_batch_id_1',
  ],
  activities: [
    '_id_',
    'created_at_-1',
    'inquiry_id_1_created_at_-1',
    'import_batch_id_1_created_at_-1',
  ],
  importbatches: [
    '_id_',
    'batch_id_1',
    'created_at_-1',
  ],
};

async function main() {
  await mongoose.connect(URI, {
    serverSelectionTimeoutMS: 10_000,
    autoIndex: false,
  });

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection has no database handle.');

    const existingCollections = new Set(
      (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name),
    );

    const failures: string[] = [];
    const report: Record<string, string[]> = {};

    for (const [collection, requiredIndexes] of Object.entries(expected)) {
      if (!existingCollections.has(collection)) {
        failures.push(`Missing collection: ${collection}`);
        continue;
      }

      const actual = (await db.collection(collection).indexes())
        .map((index) => index.name)
        .filter((name): name is string => Boolean(name))
        .sort();

      report[collection] = actual;

      for (const required of requiredIndexes) {
        if (!actual.includes(required)) {
          failures.push(`${collection}: missing index ${required}`);
        }
      }
    }

    console.log(JSON.stringify({
      database: mongoose.connection.name,
      indexes: report,
    }, null, 2));

    if (failures.length) {
      throw new Error(`Index verification failed:\n- ${failures.join('\n- ')}`);
    }

    console.log('Index verification passed.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
