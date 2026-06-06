const friendlyHeaders: Record<string, string> = {
  name: 'Patient Name',
  phone: 'Phone',
  email: 'Email',
  service_needed: 'Requested Service',
  source: 'Inquiry Source',
  status: 'Status',
  estimated_value: 'Estimated Treatment Value',
  notes: 'Notes',
  next_follow_up_date: 'Next Follow-Up Date',
};

export const exportColumns = Object.keys(friendlyHeaders);

function escapeCsv(value: unknown): string {
  const text = String(value ?? '');
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(rows: Record<string, unknown>[]): string {
  const header = exportColumns.map((column) => friendlyHeaders[column]).join(',');
  const body = rows.map((row) => exportColumns.map((column) => escapeCsv(row[column])).join(','));
  return [header, ...body].join('\n');
}

