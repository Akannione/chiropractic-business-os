import { calculateKpis } from './kpiService.js';
import { InquiryShape } from '../models/Inquiry.js';
import { startOfToday, startOfWeek } from '../utils/date.js';

export function buildWeeklySummary(inquiries: InquiryShape[]) {
  const today = startOfToday();
  const weekStart = startOfWeek(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const kpis = calculateKpis(inquiries);
  const summary =
    inquiries.length === 0
      ? 'No patient inquiries are currently stored. Add a few inquiries to generate a useful practice snapshot.'
      : `The practice has ${kpis.totalPatientInquiries} patient inquiries, ${kpis.newThisWeek} new this week, and ${kpis.activePatients} active patients. ${kpis.followUpsNeeded} inquiries need follow-up, with ${kpis.overdueFollowUps} overdue. Estimated Treatment Value is $${kpis.estimatedTreatmentValue.toLocaleString()} from inquiries not marked Lost.`;

  return {
    weekStart: weekStart.toISOString().slice(0, 10),
    weekEnd: weekEnd.toISOString().slice(0, 10),
    ...kpis,
    plainEnglishSummary: summary,
  };
}

