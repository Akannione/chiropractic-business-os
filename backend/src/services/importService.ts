import { AutomatedInquiryInput, createAutomatedInquiry, normalizeSource } from './automationService.js';

type CsvRow = Record<string, string>;

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

export function mapExternalRow(row: CsvRow): AutomatedInquiryInput {
  return {
    name: firstValue(row, ['name', 'patient_name', 'full_name', 'Patient Name']),
    phone: firstValue(row, ['phone', 'Phone']),
    email: firstValue(row, ['email', 'Email']),
    service_needed: firstValue(row, ['service_needed', 'requested_service', 'service', 'Requested Service']),
    source: normalizeSource(firstValue(row, ['source', 'Source', 'inquiry_source'])),
    notes: firstValue(row, ['notes', 'message', 'Message', 'Notes']),
    estimated_value: Number(firstValue(row, ['estimated_value', 'Estimated Treatment Value'])) || undefined,
  };
}

export async function importInquiryCsv(csvText: string) {
  const rows = parseInquiryCsv(csvText).map(mapExternalRow);
  let imported = 0;
  const errors: string[] = [];

  for (const [index, row] of rows.entries()) {
    try {
      await createAutomatedInquiry(row, 'CSV import');
      imported += 1;
    } catch (error) {
      errors.push(`Row ${index + 2}: ${(error as Error).message}`);
    }
  }

  return { imported, failed: errors.length, errors };
}
