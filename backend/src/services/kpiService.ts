import {
  ACTIVE_STATUS,
  FOLLOW_UP_NEEDED_STATUS,
  LOST_STATUS,
} from '../config/constants.js';
import { InquiryShape } from '../models/Inquiry.js';
import { startOfToday, startOfWeek } from '../utils/date.js';

type InquiryLike = Pick<
  InquiryShape,
  'status' | 'estimated_value' | 'source' | 'created_at' | 'next_follow_up_date'
>;

export function calculateKpis(inquiries: InquiryLike[]) {
  const today = startOfToday();
  const weekStart = startOfWeek(today);
  const total = inquiries.length;
  const notLost = inquiries.filter((inquiry) => inquiry.status !== LOST_STATUS);
  const active = inquiries.filter((inquiry) => inquiry.status === ACTIVE_STATUS);
  const newThisWeek = inquiries.filter((inquiry) => inquiry.created_at >= weekStart);
  const overdue = notLost.filter(
    (inquiry) => inquiry.next_follow_up_date && inquiry.next_follow_up_date < today,
  );
  const followUpsNeeded = notLost.filter(
    (inquiry) =>
      inquiry.status === FOLLOW_UP_NEEDED_STATUS ||
      (inquiry.next_follow_up_date && inquiry.next_follow_up_date <= today),
  );
  const estimatedTreatmentValue = notLost.reduce(
    (sum, inquiry) => sum + Number(inquiry.estimated_value || 0),
    0,
  );
  const sourceCounts = new Map<string, number>();
  for (const inquiry of inquiries) {
    sourceCounts.set(inquiry.source, (sourceCounts.get(inquiry.source) || 0) + 1);
  }
  const topSource = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];

  return {
    totalPatientInquiries: total,
    newThisWeek: newThisWeek.length,
    activePatients: active.length,
    followUpsNeeded: followUpsNeeded.length,
    followUpsNeededPercent: total ? (followUpsNeeded.length / total) * 100 : 0,
    overdueFollowUps: overdue.length,
    estimatedTreatmentValue,
    inquiryToPatientRate: total ? (active.length / total) * 100 : 0,
    topInquirySource: topSource?.[0] || 'None',
  };
}

