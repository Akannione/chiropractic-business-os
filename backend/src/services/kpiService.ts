import {
  ACTIVE_STATUS,
  FOLLOW_UP_NEEDED_STATUS,
  LOST_STATUS,
} from '../config/constants.js';
import { Inquiry, InquiryShape } from '../models/Inquiry.js';
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

export type Kpis = ReturnType<typeof calculateKpis>;

/**
 * The same metrics computed inside MongoDB instead of by fetching every
 * document. calculateKpis above stays the readable definition and the one the
 * analytics contract describes; this must agree with it exactly, which the
 * benchmark asserts against 20,000 varied records.
 *
 * Note on null handling: the `$ne: null` beside each date comparison mirrors
 * the truthiness check the JavaScript version performs, but MongoDB does not
 * need it. Range queries are type-bracketed, so `$lt` against a Date ignores
 * null and missing fields. BSON sort order does put null first, which is a
 * different mechanism; see database.test.ts.
 */
export async function calculateKpisFromDatabase(): Promise<Kpis> {
  const today = startOfToday();
  const weekStart = startOfWeek(today);
  const notLost = { status: { $ne: LOST_STATUS } };

  const [facet] = await Inquiry.aggregate<{
    total: { n: number }[];
    newThisWeek: { n: number }[];
    active: { n: number }[];
    overdue: { n: number }[];
    followUpsNeeded: { n: number }[];
    value: { sum: number }[];
    topSource: { _id: string }[];
  }>([
    {
      $facet: {
        total: [{ $count: 'n' }],
        newThisWeek: [{ $match: { created_at: { $gte: weekStart } } }, { $count: 'n' }],
        active: [{ $match: { status: ACTIVE_STATUS } }, { $count: 'n' }],
        overdue: [
          { $match: { ...notLost, next_follow_up_date: { $ne: null, $lt: today } } },
          { $count: 'n' },
        ],
        followUpsNeeded: [
          {
            $match: {
              ...notLost,
              $or: [
                { status: FOLLOW_UP_NEEDED_STATUS },
                { next_follow_up_date: { $ne: null, $lte: today } },
              ],
            },
          },
          { $count: 'n' },
        ],
        value: [
          { $match: notLost },
          { $group: { _id: null, sum: { $sum: { $ifNull: ['$estimated_value', 0] } } } },
        ],
        // Ties break alphabetically, matching the JavaScript comparator.
        topSource: [
          { $group: { _id: '$source', count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
          { $limit: 1 },
        ],
      },
    },
  ]);

  const total = facet?.total[0]?.n ?? 0;
  const activePatients = facet?.active[0]?.n ?? 0;
  const followUpsNeeded = facet?.followUpsNeeded[0]?.n ?? 0;

  return {
    totalPatientInquiries: total,
    newThisWeek: facet?.newThisWeek[0]?.n ?? 0,
    activePatients,
    followUpsNeeded,
    followUpsNeededPercent: total ? (followUpsNeeded / total) * 100 : 0,
    overdueFollowUps: facet?.overdue[0]?.n ?? 0,
    estimatedTreatmentValue: facet?.value[0]?.sum ?? 0,
    inquiryToPatientRate: total ? (activePatients / total) * 100 : 0,
    topInquirySource: facet?.topSource[0]?._id ?? 'None',
  };
}

