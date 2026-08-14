/**
 * Reports contact collisions before any unique constraint is considered.
 *
 * A unique index cannot be added to a collection that already violates it, so
 * this has to run against every deployment first. It is read-only.
 *
 * Point it at a database with MONGODB_URI, or pass a CSV export on stdin:
 *   curl -s https://cbos-api.vercel.app/api/exports/inquiries.csv | npm run audit:duplicates --prefix backend -- --csv
 */

import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Inquiry } from '../models/Inquiry.js';

type Contact = { name: string; email: string; phone: string };

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/** Digits only, so 404-555-0110 and (404) 555 0110 collide as they should. */
function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function groupBy(contacts: Contact[], key: (c: Contact) => string) {
  const groups = new Map<string, Contact[]>();
  for (const contact of contacts) {
    const value = key(contact);
    if (!value) continue;
    const bucket = groups.get(value) || [];
    bucket.push(contact);
    groups.set(value, bucket);
  }
  return [...groups.entries()].filter(([, rows]) => rows.length > 1);
}

/** Distinct people sharing a contact detail, as a household would. */
function looksLikeSharedContact(rows: Contact[]) {
  const names = new Set(rows.map((r) => r.name.trim().toLowerCase()));
  return names.size > 1;
}

function report(label: string, contacts: Contact[]) {
  console.log(`\n=== ${label} ===`);
  console.log(`records: ${contacts.length.toLocaleString()}`);

  for (const [field, key] of [
    ['email', (c: Contact) => normalizeEmail(c.email)],
    ['phone', (c: Contact) => normalizePhone(c.phone)],
  ] as const) {
    const collisions = groupBy(contacts, key);
    const shared = collisions.filter(([, rows]) => looksLikeSharedContact(rows));
    const repeats = collisions.filter(([, rows]) => !looksLikeSharedContact(rows));

    console.log(`\n${field}:`);
    console.log(`  colliding values      : ${collisions.length}`);
    console.log(`  same name repeated    : ${repeats.length}  (true duplicate records)`);
    console.log(`  different names shared : ${shared.length}  (household-style sharing)`);

    for (const [value, rows] of collisions.slice(0, 10)) {
      const kind = looksLikeSharedContact(rows) ? 'shared' : 'repeat';
      console.log(`    ${kind}  ${value}  ->  ${rows.map((r) => r.name).join(', ')}`);
    }
    if (collisions.length > 10) console.log(`    ... and ${collisions.length - 10} more`);

    console.log(
      collisions.length
        ? `  VERDICT: a unique index on ${field} would fail to build here.`
        : `  VERDICT: a unique index on ${field} would build cleanly against this data.`,
    );
  }
}

function parseCsv(text: string): Contact[] {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(',');
  const nameAt = header.findIndex((h) => /patient name/i.test(h));
  const phoneAt = header.findIndex((h) => /^phone$/i.test(h));
  const emailAt = header.findIndex((h) => /^email$/i.test(h));

  return lines.slice(1).map((line) => {
    // Values may be quoted and contain commas; split on commas outside quotes.
    const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || [];
    const cell = (i: number) => (cells[i] || '').replace(/,$/, '').replace(/^"|"$/g, '').trim();
    return { name: cell(nameAt), phone: cell(phoneAt), email: cell(emailAt) };
  }).filter((c) => c.name);
}

async function main() {
  if (process.argv.includes('--csv')) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
    report('CSV export', parseCsv(Buffer.concat(chunks).toString('utf8')));
    return;
  }

  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10_000 });
  const rows = await Inquiry.find({}, { name: 1, email: 1, phone: 1 }).lean();
  report(mongoose.connection.name, rows.map((r) => ({
    name: String(r.name || ''),
    email: String(r.email || ''),
    phone: String(r.phone || ''),
  })));
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
