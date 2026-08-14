import { buildSampleInquiries } from '../data/sampleData.js';
import { env } from '../config/env.js';
import { Inquiry } from '../models/Inquiry.js';

/**
 * Populates an empty collection with the fake demo practice.
 *
 * Only ever runs in demo mode. This is called on connection, so without the
 * guard a real clinic whose collection was emptied, by a failed migration or a
 * mistaken delete, would silently refill with invented patients. Staff would
 * have no way to tell those from real records.
 */
export async function seedSampleDataIfEmpty() {
  if (!env.demoMode) return 0;

  const count = await Inquiry.countDocuments();
  if (count > 0) return 0;

  const rows = buildSampleInquiries();
  const result = await Inquiry.collection.bulkWrite(
    rows.map((row) => ({
      updateOne: {
        filter: { email: row.email },
        update: { $setOnInsert: row },
        upsert: true,
      },
    })),
  );
  return result.upsertedCount;
}

/**
 * Deletes every inquiry and restores the demo practice.
 *
 * Guarded here as well as at the controller: this wipes the collection, so it
 * must be impossible to reach outside demo mode by any route.
 */
export async function resetSampleData() {
  if (!env.demoMode) {
    throw new Error('Refusing to reset data: demo mode is disabled.');
  }

  await Inquiry.deleteMany({});
  const rows = buildSampleInquiries();
  await Inquiry.insertMany(rows);
  return rows.length;
}
