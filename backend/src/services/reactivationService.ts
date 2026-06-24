import { addDays, formatDate, parseDateOnly, startOfToday } from '../utils/date.js';

export type ReactivationStatus = 'Overdue' | 'Due Today' | 'Upcoming';

type ReactivationInquiry = {
  _id?: unknown;
  id?: unknown;
  name: string;
  phone: string;
  email: string;
  service_needed: string;
  status: string;
  patient_type?: string;
  last_visit_date?: Date | string | null;
  expected_visit_frequency_days?: number | null;
  assigned_follow_up_owner?: string;
  follow_up_outcome?: string;
  notes?: string;
  next_follow_up_date?: Date | string | null;
};

export type ReactivationRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service_needed: string;
  status: string;
  patient_type: string;
  last_visit_date: string;
  expected_visit_frequency_days: number;
  next_reactivation_date: string;
  reactivation_status: ReactivationStatus;
  days_overdue: number;
  assigned_follow_up_owner: string;
  follow_up_outcome: string;
  notes: string;
  next_follow_up_date: string;
};

const dayInMilliseconds = 24 * 60 * 60 * 1000;

function normalizeDay(value: Date | string) {
  if (value instanceof Date) {
    const isoDate = value.toISOString().slice(0, 10);
    return parseDateOnly(isoDate);
  }
  return parseDateOnly(String(value).slice(0, 10));
}

export function buildReactivationQueue(
  inquiries: ReactivationInquiry[],
  today = startOfToday(),
) {
  const currentDay = normalizeDay(today) || startOfToday();

  const rows = inquiries.flatMap<ReactivationRow>((inquiry) => {
    if (inquiry.status === 'Lost' || inquiry.patient_type === 'Dead Lead') return [];

    const lastVisit = inquiry.last_visit_date ? normalizeDay(inquiry.last_visit_date) : null;
    const frequencyDays = Number(inquiry.expected_visit_frequency_days);
    if (!lastVisit || !Number.isInteger(frequencyDays) || frequencyDays < 1) return [];

    const nextReactivation = addDays(lastVisit, frequencyDays);
    const dayDifference = Math.round(
      (nextReactivation.getTime() - currentDay.getTime()) / dayInMilliseconds,
    );
    const reactivationStatus: ReactivationStatus =
      dayDifference < 0 ? 'Overdue' : dayDifference === 0 ? 'Due Today' : 'Upcoming';

    return [{
      id: String(inquiry.id || inquiry._id || ''),
      name: inquiry.name,
      phone: inquiry.phone,
      email: inquiry.email,
      service_needed: inquiry.service_needed,
      status: inquiry.status,
      patient_type: inquiry.patient_type || 'Existing Patient',
      last_visit_date: formatDate(lastVisit),
      expected_visit_frequency_days: frequencyDays,
      next_reactivation_date: formatDate(nextReactivation),
      reactivation_status: reactivationStatus,
      days_overdue: Math.max(0, -dayDifference),
      assigned_follow_up_owner: inquiry.assigned_follow_up_owner || '',
      follow_up_outcome: inquiry.follow_up_outcome || 'Not Contacted',
      notes: inquiry.notes || '',
      next_follow_up_date: inquiry.next_follow_up_date
        ? formatDate(normalizeDay(inquiry.next_follow_up_date))
        : '',
    }];
  });

  rows.sort((left, right) => {
    const urgencyOrder: Record<ReactivationStatus, number> = {
      Overdue: 0,
      'Due Today': 1,
      Upcoming: 2,
    };
    const urgencyDifference =
      urgencyOrder[left.reactivation_status] - urgencyOrder[right.reactivation_status];
    if (urgencyDifference !== 0) return urgencyDifference;
    if (left.reactivation_status === 'Overdue') return right.days_overdue - left.days_overdue;
    return left.next_reactivation_date.localeCompare(right.next_reactivation_date);
  });

  return {
    rows,
    overdue: rows.filter((row) => row.reactivation_status === 'Overdue').length,
    dueToday: rows.filter((row) => row.reactivation_status === 'Due Today').length,
    upcoming: rows.filter((row) => row.reactivation_status === 'Upcoming').length,
  };
}
