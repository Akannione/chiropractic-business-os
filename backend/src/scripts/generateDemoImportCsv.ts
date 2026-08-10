/**
 * Regenerates docs/NEW_PATIENT_IMPORT_DEMO.csv with dates relative to the run date.
 *
 * The walkthrough CSV must be regenerated before a clinic demo. Hardcoded visit
 * dates drift out of the reactivation window as time passes, which makes the
 * queue look like months of neglected patients instead of a working recall list.
 *
 * Run with: npm run demo:csv --prefix backend
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const outputPath = resolve(__dirname, '../../../docs/NEW_PATIENT_IMPORT_DEMO.csv');

const HEADERS = [
  'Patient Name',
  'Phone',
  'Email',
  'Requested Service',
  'Source',
  'Patient Type',
  'Appointment Status',
  'Requested Appointment',
  'Offer Type',
  'Last Visit Date',
  'Visit Frequency Days',
  'Assigned Follow-Up Owner',
  'Follow-Up Outcome',
  'Notes',
] as const;

type Row = Record<(typeof HEADERS)[number], string>;

function dateFromOffset(days: number) {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

/** Renders a US-style date, which the importer must reject. */
function usFormatDateFromOffset(days: number) {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() + days);
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${month}/${day}/${value.getFullYear()}`;
}

function buildRows(): Row[] {
  return [
    // Importable. Lands in the Overdue queue at 14 days past the expected return.
    {
      'Patient Name': 'Dana Whitfield',
      Phone: '470-555-0231',
      Email: 'dana.whitfield@example.com',
      'Requested Service': 'Wellness Consultation',
      Source: 'Referral',
      'Patient Type': 'Existing Patient',
      'Appointment Status': 'Not Scheduled',
      'Requested Appointment': 'Thursday afternoon',
      'Offer Type': 'None',
      'Last Visit Date': dateFromOffset(-44),
      'Visit Frequency Days': '30',
      'Assigned Follow-Up Owner': 'Front Desk',
      'Follow-Up Outcome': 'Not Contacted',
      Notes: 'Fake demo record. Monthly wellness patient who missed a recall.',
    },
    // Importable. Lands in the Due Today queue.
    {
      'Patient Name': 'Marcus Ellery',
      Phone: '678-555-0248',
      Email: 'marcus.ellery@example.com',
      'Requested Service': 'Spinal Adjustment',
      Source: 'Phone Call',
      'Patient Type': 'Reactivation',
      'Appointment Status': 'Not Scheduled',
      'Requested Appointment': 'Monday morning',
      'Offer Type': 'None',
      'Last Visit Date': dateFromOffset(-30),
      'Visit Frequency Days': '30',
      'Assigned Follow-Up Owner': 'Doc',
      'Follow-Up Outcome': 'Not Contacted',
      Notes: 'Fake demo record. Expected back today on a monthly schedule.',
    },
    // Importable. Lands in the Upcoming queue seven days out.
    {
      'Patient Name': 'Sofia Nkemdirim',
      Phone: '404-555-0263',
      Email: 'sofia.nkemdirim@example.com',
      'Requested Service': 'Massage Therapy',
      Source: 'Website',
      'Patient Type': 'Existing Patient',
      'Appointment Status': 'Not Scheduled',
      'Requested Appointment': 'Any weekday after 3 PM',
      'Offer Type': 'Groupon',
      'Last Visit Date': dateFromOffset(-23),
      'Visit Frequency Days': '30',
      'Assigned Follow-Up Owner': 'Front Desk',
      'Follow-Up Outcome': 'Not Contacted',
      Notes: 'Fake demo record. Due back next week, not yet contacted.',
    },
    // Duplicate. Matches a seeded patient by email and phone, so the importer skips it.
    {
      'Patient Name': 'Aisha Coleman',
      Phone: '470-555-0120',
      Email: 'aisha.coleman@example.com',
      'Requested Service': 'Wellness Consultation',
      Source: 'Referral',
      'Patient Type': 'Existing Patient',
      'Appointment Status': 'Not Scheduled',
      'Requested Appointment': 'Friday morning',
      'Offer Type': 'None',
      'Last Visit Date': dateFromOffset(-30),
      'Visit Frequency Days': '30',
      'Assigned Follow-Up Owner': 'Doc',
      'Follow-Up Outcome': 'Not Contacted',
      Notes: 'Fake demo record. Already in the system; expected to be skipped.',
    },
    // Invalid. US-formatted date, the most common real clinic export problem.
    {
      'Patient Name': 'Tobias Renner',
      Phone: '706-555-0274',
      Email: 'tobias.renner@example.com',
      'Requested Service': 'Back Pain Consultation',
      Source: 'Google',
      'Patient Type': 'Existing Patient',
      'Appointment Status': 'Not Scheduled',
      'Requested Appointment': 'Wednesday',
      'Offer Type': 'None',
      'Last Visit Date': usFormatDateFromOffset(-27),
      'Visit Frequency Days': '30',
      'Assigned Follow-Up Owner': 'Front Desk',
      'Follow-Up Outcome': 'Not Contacted',
      Notes: 'Fake demo record. Date is not YYYY-MM-DD and must be flagged.',
    },
  ];
}

function toCsvValue(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function main() {
  const rows = buildRows();
  const lines = [
    HEADERS.join(','),
    ...rows.map((row) => HEADERS.map((header) => toCsvValue(row[header])).join(',')),
  ];

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');

  console.log(`Wrote ${rows.length} rows to ${outputPath}`);
  console.log('Expected preview: 3 importable, 1 duplicate, 1 error.');
}

main();
