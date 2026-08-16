import { Activity } from '../models/Activity.js';
import { Inquiry } from '../models/Inquiry.js';
import { logActivity } from './activityService.js';
import { HttpError } from '../middleware/errorHandler.js';

/**
 * Finding and combining patients recorded twice.
 *
 * Only the CSV import checks for duplicates, so the public intake form happily
 * creates a second record when a patient submits it twice. This gives staff a
 * way to see those and put them back together.
 *
 * The matching rule deliberately mirrors the import: a candidate needs the same
 * name and a shared contact detail. Matching on contact alone would group a
 * household, and proposing that a parent and child be merged into one patient
 * is a worse error than leaving a duplicate alone.
 */

type ContactRow = {
  _id: unknown;
  name?: string;
  email?: string;
  phone?: string;
};

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function identityKeys(row: ContactRow) {
  const person = normalizeName(String(row.name || ''));
  if (!person) return [];
  const keys: string[] = [];
  const email = normalizeEmail(String(row.email || ''));
  const phone = normalizePhone(String(row.phone || ''));
  if (email) keys.push(`${person}|email:${email}`);
  if (phone) keys.push(`${person}|phone:${phone}`);
  return keys;
}

/**
 * Groups of inquiry ids that appear to be the same patient.
 *
 * Reads only name, email, and phone across the collection. That is a scan, but
 * this is an occasional review screen rather than a request on the hot path,
 * and the projection keeps each document small.
 */
export async function findDuplicateGroups() {
  const rows = await Inquiry.find({}, { name: 1, email: 1, phone: 1 }).lean<ContactRow[]>();

  // A record can match on both email and phone, so track which group each id
  // has already joined rather than emitting it twice.
  const groupsByKey = new Map<string, Set<string>>();

  for (const row of rows) {
    const id = String(row._id);
    for (const key of identityKeys(row)) {
      const bucket = groupsByKey.get(key) || new Set<string>();
      bucket.add(id);
      groupsByKey.set(key, bucket);
    }
  }

  const emitted = new Set<string>();
  const groups: string[][] = [];
  for (const ids of groupsByKey.values()) {
    if (ids.size < 2) continue;
    const signature = [...ids].sort().join(',');
    if (emitted.has(signature)) continue;
    emitted.add(signature);
    groups.push([...ids]);
  }

  return groups;
}

/** Candidate groups with the full records, newest record first within a group. */
export async function listDuplicateCandidates() {
  const groups = await findDuplicateGroups();
  if (!groups.length) return [];

  const ids = groups.flat();
  const records = await Inquiry.find({ _id: { $in: ids } }).lean({ virtuals: true });
  const byId = new Map(records.map((record) => [String(record._id), record]));

  return groups
    .map((group) => group
      .map((id) => byId.get(id))
      .filter((record): record is NonNullable<typeof record> => Boolean(record))
      .sort((left, right) => Number(right.created_at) - Number(left.created_at)))
    .filter((group) => group.length > 1);
}

/**
 * How advanced a status is. A record saying the person became a patient
 * outranks one that never progressed, so merging must not discard it.
 * Lost sits lowest: it is only kept when nothing contradicts it.
 */
const STATUS_RANK: Record<string, number> = {
  'Active Patient': 5,
  'Consultation Scheduled': 4,
  'Follow-Up Needed': 3,
  'New Inquiry': 2,
  Lost: 1,
};

function isBlank(value: unknown) {
  return value === null || value === undefined || value === '';
}

/** The target's value unless it is blank, in which case the source fills it. */
function preferTarget<T>(targetValue: T, sourceValue: T) {
  return isBlank(targetValue) ? sourceValue : targetValue;
}

function mergeNotes(targetNotes: string, sourceNotes: string) {
  const target = targetNotes.trim();
  const source = sourceNotes.trim();
  if (!source || target === source) return target;
  if (!target) return source;
  return `${target}\n\n${source}`;
}

function earlierDate(left?: Date | null, right?: Date | null) {
  if (!left) return right;
  if (!right) return left;
  return left < right ? left : right;
}

function laterDate(left?: Date | null, right?: Date | null) {
  if (!left) return right;
  if (!right) return left;
  return left > right ? left : right;
}


/**
 * Folds `sourceId` into `targetId` and deletes the source.
 *
 * Field rules, chosen so a merge never silently loses clinical or contact
 * information:
 *
 * - blank fields on the target are filled from the source
 * - status keeps whichever record got further; a patient who converted stays
 *   converted
 * - estimated value takes the higher figure rather than the sum, because
 *   adding two estimates for one patient would inflate pipeline revenue
 * - notes from both are kept, separated by a blank line
 * - created_at keeps the earlier date, which is when the practice first heard
 *   from this patient
 * - last_visit_date keeps the later date and next_follow_up_date the earlier,
 *   so the reactivation queue reflects the most recent visit and the most
 *   urgent callback
 *
 * The source's activity history is repointed rather than deleted, and the merge
 * itself is recorded, so the trail survives.
 */
export async function mergeInquiries(targetId: string, sourceId: string) {
  if (targetId === sourceId) {
    throw new HttpError(400, 'Cannot merge a patient inquiry into itself.');
  }

  const [target, source] = await Promise.all([
    Inquiry.findById(targetId),
    Inquiry.findById(sourceId),
  ]);

  if (!target) throw new HttpError(404, 'The inquiry to keep was not found.');
  if (!source) throw new HttpError(404, 'The inquiry to merge was not found.');

  const targetRank = STATUS_RANK[target.status] ?? 0;
  const sourceRank = STATUS_RANK[source.status] ?? 0;

  target.set({
    phone: preferTarget(target.phone, source.phone),
    email: preferTarget(target.email, source.email),
    service_needed: preferTarget(target.service_needed, source.service_needed),
    status: sourceRank > targetRank ? source.status : target.status,
    estimated_value: Math.max(Number(target.estimated_value || 0), Number(source.estimated_value || 0)),
    notes: mergeNotes(String(target.notes || ''), String(source.notes || '')),
    next_follow_up_date: earlierDate(target.next_follow_up_date, source.next_follow_up_date),
    appointment_status: preferTarget(target.appointment_status, source.appointment_status),
    patient_type: preferTarget(target.patient_type, source.patient_type),
    appointment_request: preferTarget(target.appointment_request, source.appointment_request),
    offer_type: preferTarget(target.offer_type, source.offer_type),
    last_visit_date: laterDate(target.last_visit_date, source.last_visit_date),
    expected_visit_frequency_days: preferTarget(
      target.expected_visit_frequency_days,
      source.expected_visit_frequency_days,
    ),
    assigned_follow_up_owner: preferTarget(target.assigned_follow_up_owner, source.assigned_follow_up_owner),
    follow_up_outcome: target.follow_up_outcome === 'Not Contacted'
      ? source.follow_up_outcome
      : target.follow_up_outcome,
    created_at: earlierDate(target.created_at, source.created_at),
  });

  await target.save();

  const moved = await Activity.updateMany({ inquiry_id: source._id }, { inquiry_id: target._id });
  await Inquiry.deleteOne({ _id: source._id });

  await logActivity({
    inquiryId: String(target._id),
    patientName: target.name,
    action: 'Inquiries merged',
    detail: `Merged a duplicate record for ${source.name} (${source.email || 'no email'}, `
      + `${source.phone || 'no phone'}) into this inquiry.`,
  });

  return { merged: target, movedActivities: moved.modifiedCount ?? 0 };
}
