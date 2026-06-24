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
  appointment_status: 'Appointment Status',
  patient_type: 'Patient Type',
  appointment_request: 'Requested Appointment',
  offer_type: 'Offer Type',
  last_visit_date: 'Last Visit Date',
  expected_visit_frequency_days: 'Expected Visit Frequency (Days)',
  assigned_follow_up_owner: 'Assigned Follow-Up Owner',
  follow_up_outcome: 'Follow-Up Outcome',
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
