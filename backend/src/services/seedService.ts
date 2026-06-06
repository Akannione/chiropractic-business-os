import { buildSampleInquiries } from '../data/sampleData.js';
import { Inquiry } from '../models/Inquiry.js';

export async function seedSampleDataIfEmpty() {
  const count = await Inquiry.countDocuments();
  if (count > 0) return 0;
  const rows = buildSampleInquiries();
  await Inquiry.insertMany(rows);
  return rows.length;
}

export async function resetSampleData() {
  await Inquiry.deleteMany({});
  const rows = buildSampleInquiries();
  await Inquiry.insertMany(rows);
  return rows.length;
}

