import { calculateKpis } from './kpiService.js';
import { InquiryShape } from '../models/Inquiry.js';
import {
  addDays,
  formatDate,
  startOfMonthInstant,
  startOfToday,
  startOfWeek,
} from '../utils/date.js';
import { countOf, pluralize } from '../utils/text.js';

export function buildWeeklySummary(inquiries: InquiryShape[]) {
  const today = startOfToday();
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const kpis = calculateKpis(inquiries);
  const summary =
    inquiries.length === 0
      ? 'No patient inquiries are currently stored. Add a few inquiries to generate a useful practice snapshot.'
      : `The practice has ${countOf(kpis.totalPatientInquiries, 'patient inquiry', 'patient inquiries')}, ${kpis.newThisWeek} new this week, and ${countOf(kpis.activePatients, 'active patient')}. ${countOf(kpis.followUpsNeeded, 'inquiry', 'inquiries')} ${pluralize(kpis.followUpsNeeded, 'needs', 'need')} follow-up, with ${kpis.overdueFollowUps} overdue. Estimated Treatment Value is $${kpis.estimatedTreatmentValue.toLocaleString()} from inquiries not marked Lost.`;

  return {
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    ...kpis,
    plainEnglishSummary: summary,
  };
}

export function buildMonthlySummary(inquiries: InquiryShape[]) {
  const today = startOfToday();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 12, 0, 0, 0));
  const nextMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1, 12, 0, 0, 0));
  const monthEnd = addDays(nextMonthStart, -1);
  const monthStartInstant = startOfMonthInstant();
  const monthlyInquiries = inquiries.filter((inquiry) => inquiry.created_at >= monthStartInstant);
  const kpis = calculateKpis(monthlyInquiries);
  const summary =
    monthlyInquiries.length === 0
      ? 'No patient inquiries were created this month yet.'
      : `This month has ${countOf(kpis.totalPatientInquiries, 'patient inquiry', 'patient inquiries')}, ${countOf(kpis.activePatients, 'active patient')}, and ${countOf(kpis.followUpsNeeded, 'follow-up')} needing attention. Estimated Treatment Value for this month is $${kpis.estimatedTreatmentValue.toLocaleString()}.`;

  return {
    monthStart: formatDate(monthStart),
    monthEnd: formatDate(monthEnd),
    ...kpis,
    plainEnglishSummary: summary,
  };
}
