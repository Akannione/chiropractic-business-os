import {
  AutomatedInquiryInput,
  createAutomatedInquiry,
  estimateTreatmentValue,
  normalizeSource,
} from './automationService.js';
import { Inquiry } from '../models/Inquiry.js';
import {
  APPOINTMENT_STATUSES,
  FOLLOW_UP_OUTCOMES,
  OFFER_TYPES,
  PATIENT_TYPES,
} from '../config/constants.js';

type CsvRow = Record<string, string>;

type ImportPreviewRow = AutomatedInquiryInput & {
  rowNumber: number;
  source: string;
  estimated_value: number;
  duplicate: boolean;
  errors: string[];
};

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const phonePattern = /^\+?[0-9][0-9\s().-]{6,19}$/;

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

export function parseInquiryCsv(csvText: string): CsvRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<CsvRow>((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {});
  });
}

function firstValue(row: CsvRow, keys: string[]) {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return '';
}

function enumValue(value: string, options: readonly string[], fallback: string) {
  const match = options.find((option) => option.toLowerCase() === value.trim().toLowerCase());
  return match || fallback;
}

function positiveInteger(value: string) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

export function mapExternalRow(row: CsvRow): AutomatedInquiryInput {
  const patientType = firstValue(row, ['patient_type', 'Patient Type']);
  const appointmentStatus = firstValue(row, [
    'appointment_status',
    'Appointment Status',
    'Was Appointment Scheduled',
  ]);
  const offerType = firstValue(row, ['offer_type', 'Offer Type', 'Promotion']);
  const followUpOutcome = firstValue(row, ['follow_up_outcome', 'Follow-Up Outcome']);
  return {
    name: firstValue(row, ['name', 'patient_name', 'full_name', 'Patient Name']),
    phone: firstValue(row, ['phone', 'Phone']),
    email: firstValue(row, ['email', 'Email']),
    service_needed: firstValue(row, ['service_needed', 'requested_service', 'service', 'Requested Service']),
    source: normalizeSource(firstValue(row, ['source', 'Source', 'inquiry_source'])),
    notes: firstValue(row, ['notes', 'message', 'Message', 'Notes']),
    estimated_value: Number(firstValue(row, ['estimated_value', 'Estimated Treatment Value'])) || undefined,
    patient_type: enumValue(patientType, PATIENT_TYPES, 'New Patient'),
    appointment_status: enumValue(appointmentStatus, APPOINTMENT_STATUSES, 'Not Scheduled'),
    appointment_request: firstValue(row, [
      'appointment_request',
      'requested_appointment',
      'Requested Appointment',
    ]),
    offer_type: enumValue(offerType, OFFER_TYPES, 'None'),
    last_visit_date:
      firstValue(row, ['last_visit_date', 'Last Visit Date']) || null,
    expected_visit_frequency_days:
      positiveInteger(
        firstValue(row, [
          'expected_visit_frequency_days',
          'visit_frequency_days',
          'Visit Frequency Days',
        ]),
      ) || null,
    assigned_follow_up_owner: firstValue(row, [
      'assigned_follow_up_owner',
      'follow_up_owner',
      'Assigned Follow-Up Owner',
    ]),
    follow_up_outcome: enumValue(
      followUpOutcome,
      FOLLOW_UP_OUTCOMES,
      'Not Contacted',
    ),
  };
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function validatePreviewRow(row: AutomatedInquiryInput) {
  const errors: string[] = [];
  if (!row.name.trim()) errors.push('Patient name is required.');
  if (!phonePattern.test(row.phone.trim())) errors.push('Enter a valid phone number.');
  if (!emailPattern.test(row.email.trim())) errors.push('Enter a valid email address.');
  if (!row.service_needed.trim()) errors.push('Requested Service is required.');
  return errors;
}

export async function previewInquiryCsv(csvText: string) {
  const rows = parseInquiryCsv(csvText).map(mapExternalRow);
  const existing = await Inquiry.find({}, { email: 1, phone: 1 }).lean();
  const existingContacts = new Set<string>();
  for (const inquiry of existing) {
    const email = normalizeEmail(String(inquiry.email || ''));
    const phone = normalizePhone(String(inquiry.phone || ''));
    if (email) existingContacts.add(`email:${email}`);
    if (phone) existingContacts.add(`phone:${phone}`);
  }
  const seenContacts = new Set<string>();

  const previewRows: ImportPreviewRow[] = rows.map((row, index) => {
    const email = normalizeEmail(row.email);
    const phone = normalizePhone(row.phone);
    const emailKey = email ? `email:${email}` : '';
    const phoneKey = phone ? `phone:${phone}` : '';
    const duplicate =
      Boolean(emailKey && existingContacts.has(emailKey)) ||
      Boolean(phoneKey && existingContacts.has(phoneKey)) ||
      Boolean(emailKey && seenContacts.has(emailKey)) ||
      Boolean(phoneKey && seenContacts.has(phoneKey));
    if (emailKey) seenContacts.add(emailKey);
    if (phoneKey) seenContacts.add(phoneKey);

    return {
      ...row,
      rowNumber: index + 2,
      name: row.name,
      phone: row.phone,
      email: row.email,
      service_needed: row.service_needed,
      source: normalizeSource(row.source),
      estimated_value: estimateTreatmentValue(row.service_needed, row.estimated_value),
      duplicate,
      errors: validatePreviewRow(row),
    };
  });

  return {
    rows: previewRows,
    totalRows: previewRows.length,
    importableRows: previewRows.filter((row) => !row.duplicate && row.errors.length === 0).length,
    duplicateRows: previewRows.filter((row) => row.duplicate).length,
    errorRows: previewRows.filter((row) => row.errors.length > 0).length,
  };
}

export async function importInquiryCsv(csvText: string) {
  const preview = await previewInquiryCsv(csvText);
  const rows = parseInquiryCsv(csvText).map(mapExternalRow);
  let imported = 0;
  let skippedDuplicates = 0;
  const errors: string[] = [];

  for (const [index, row] of rows.entries()) {
    const previewRow = preview.rows[index];
    if (previewRow?.duplicate) {
      skippedDuplicates += 1;
      continue;
    }
    if (previewRow?.errors.length) {
      errors.push(`Row ${previewRow.rowNumber}: ${previewRow.errors.join(' ')}`);
      continue;
    }
    try {
      await createAutomatedInquiry(row, 'CSV import');
      imported += 1;
    } catch (error) {
      errors.push(`Row ${index + 2}: ${(error as Error).message}`);
    }
  }

  return { imported, skippedDuplicates, failed: errors.length, errors };
}
