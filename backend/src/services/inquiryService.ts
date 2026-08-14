import { DEAD_LEAD_PATIENT_TYPE, LOST_STATUS } from '../config/constants.js';
import { Inquiry } from '../models/Inquiry.js';
import { parseDateOnly } from '../utils/date.js';
import { logActivities, logActivity } from './activityService.js';

export type InquiryInput = {
  name: string;
  phone: string;
  email: string;
  service_needed: string;
  source: string;
  status: string;
  estimated_value: number;
  notes?: string;
  next_follow_up_date?: string | null;
  appointment_status?: string;
  patient_type?: string;
  appointment_request?: string;
  offer_type?: string;
  last_visit_date?: string | null;
  expected_visit_frequency_days?: number | null;
  assigned_follow_up_owner?: string;
  follow_up_outcome?: string;
};

function positiveIntegerOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

/**
 * Fields the KPI and report calculations actually read. Fetching whole
 * documents pulls notes and clinic workflow fields that no summary uses.
 */
const REPORT_FIELDS = {
  status: 1,
  estimated_value: 1,
  source: 1,
  created_at: 1,
  next_follow_up_date: 1,
} as const;

/** Fields buildReactivationQueue reads when constructing a call-list row. */
const REACTIVATION_FIELDS = {
  name: 1,
  phone: 1,
  email: 1,
  service_needed: 1,
  status: 1,
  patient_type: 1,
  last_visit_date: 1,
  expected_visit_frequency_days: 1,
  assigned_follow_up_owner: 1,
  follow_up_outcome: 1,
  notes: 1,
  next_follow_up_date: 1,
} as const;

/**
 * Only the inquiries that can possibly appear in the reactivation queue.
 *
 * buildReactivationQueue applies the same rules in JavaScript and stays the
 * source of truth for classification; this narrows what has to be read at all.
 * Mongo's $ne also matches documents missing the field, which matches the
 * JavaScript behaviour for records written before these fields existed.
 */
export async function listReactivationCandidates() {
  return Inquiry.find(
    {
      status: { $ne: LOST_STATUS },
      patient_type: { $ne: DEAD_LEAD_PATIENT_TYPE },
      last_visit_date: { $ne: null },
      expected_visit_frequency_days: { $gte: 1 },
    },
    REACTIVATION_FIELDS,
  )
    .lean({ virtuals: true });
}

/** Projected read for the weekly summary, which reports on all inquiries. */
export async function listInquiriesForReports() {
  return Inquiry.find({}, REPORT_FIELDS).lean();
}

/**
 * The monthly summary only describes inquiries created this month.
 * buildMonthlySummary applies the same cutoff itself, so this narrows what is
 * read without changing the result.
 */
export async function listInquiriesCreatedSince(since: Date) {
  return Inquiry.find({ created_at: { $gte: since } }, REPORT_FIELDS).lean();
}

export async function listInquiries() {
  return Inquiry.find().sort({ created_at: -1, _id: -1 }).lean({ virtuals: true });
}

/**
 * Normalises an input into the exact shape stored in MongoDB. Shared by the
 * single-record path and the bulk import so both write identical documents.
 */
export function buildInquiryDocument(input: InquiryInput, now = new Date()) {
  return {
    ...input,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    service_needed: input.service_needed.trim(),
    estimated_value: Number(input.estimated_value || 0),
    notes: input.notes?.trim() || '',
    next_follow_up_date: parseDateOnly(input.next_follow_up_date),
    appointment_status: input.appointment_status || 'Not Scheduled',
    patient_type: input.patient_type || 'New Patient',
    appointment_request: input.appointment_request?.trim() || '',
    offer_type: input.offer_type || 'None',
    last_visit_date: parseDateOnly(input.last_visit_date),
    expected_visit_frequency_days: positiveIntegerOrNull(input.expected_visit_frequency_days),
    assigned_follow_up_owner: input.assigned_follow_up_owner?.trim() || '',
    follow_up_outcome: input.follow_up_outcome || 'Not Contacted',
    created_at: now,
    updated_at: now,
  };
}

export async function createInquiry(input: InquiryInput) {
  const inquiry = await Inquiry.create(buildInquiryDocument(input));
  await logActivity({
    inquiryId: inquiry.id,
    patientName: inquiry.name,
    action: 'Inquiry created',
    detail: `Created from ${inquiry.source} with status ${inquiry.status}.`,
  });
  return inquiry;
}

export type BulkInsertFailure = { index: number; message: string };

/**
 * Inserts many inquiries in one round trip instead of one per row.
 *
 * A CSV import previously issued two sequential writes per row, an inquiry and
 * an activity, so a 5,000-row clinic export meant 10,000 round trips.
 *
 * Runs unordered so one bad row does not abandon the rest. `index` on each
 * failure refers to the position in `inputs`, letting the caller map a failure
 * back to its CSV row number.
 */
export async function createInquiriesBulk(inputs: InquiryInput[]) {
  if (!inputs.length) return { inserted: 0, failures: [] as BulkInsertFailure[] };

  const now = new Date();
  const documents = inputs.map((input) => buildInquiryDocument(input, now));

  let insertedDocs: { id?: string; _id?: unknown; name: string; source: string; status: string }[] = [];
  const failures: BulkInsertFailure[] = [];

  try {
    insertedDocs = await Inquiry.insertMany(documents, { ordered: false }) as never;
  } catch (error) {
    // An unordered insertMany that partially fails reports what did land plus
    // one entry per rejected document.
    const bulkError = error as {
      insertedDocs?: typeof insertedDocs;
      writeErrors?: { index: number; errmsg?: string; err?: { errmsg?: string } }[];
      message?: string;
    };
    insertedDocs = bulkError.insertedDocs ?? [];
    const writeErrors = bulkError.writeErrors ?? [];
    if (!writeErrors.length) throw error;
    for (const writeError of writeErrors) {
      failures.push({
        index: writeError.index,
        message: writeError.errmsg || writeError.err?.errmsg || 'Could not save this row.',
      });
    }
  }

  if (insertedDocs.length) {
    await logActivities(insertedDocs.map((doc) => ({
      inquiryId: String(doc.id ?? doc._id ?? ''),
      patientName: doc.name,
      action: 'Inquiry created',
      detail: `Created from ${doc.source} with status ${doc.status}.`,
    })));
  }

  return { inserted: insertedDocs.length, failures };
}

export async function updateInquiry(
  id: string,
  input: Partial<InquiryInput>,
) {
  const previous = await Inquiry.findById(id).lean();
  const updated = await Inquiry.findByIdAndUpdate(
    id,
    {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
      ...(input.email !== undefined ? { email: input.email.trim() } : {}),
      ...(input.service_needed !== undefined ? { service_needed: input.service_needed.trim() } : {}),
      ...(input.source !== undefined ? { source: input.source } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.estimated_value !== undefined ? { estimated_value: Number(input.estimated_value || 0) } : {}),
      ...(input.notes !== undefined ? { notes: input.notes?.trim() || '' } : {}),
      ...(input.next_follow_up_date !== undefined ? { next_follow_up_date: parseDateOnly(input.next_follow_up_date) } : {}),
      ...(input.appointment_status !== undefined ? { appointment_status: input.appointment_status } : {}),
      ...(input.patient_type !== undefined ? { patient_type: input.patient_type } : {}),
      ...(input.appointment_request !== undefined ? { appointment_request: input.appointment_request.trim() } : {}),
      ...(input.offer_type !== undefined ? { offer_type: input.offer_type } : {}),
      ...(input.last_visit_date !== undefined ? { last_visit_date: parseDateOnly(input.last_visit_date) } : {}),
      ...(input.expected_visit_frequency_days !== undefined
        ? { expected_visit_frequency_days: positiveIntegerOrNull(input.expected_visit_frequency_days) }
        : {}),
      ...(input.assigned_follow_up_owner !== undefined
        ? { assigned_follow_up_owner: input.assigned_follow_up_owner.trim() }
        : {}),
      ...(input.follow_up_outcome !== undefined ? { follow_up_outcome: input.follow_up_outcome } : {}),
      updated_at: new Date(),
    },
    { new: true, runValidators: true },
  );
  if (updated) {
    const changes: string[] = [];
    if (input.status !== undefined && previous?.status !== input.status) changes.push(`status to ${input.status}`);
    if (
      input.next_follow_up_date !== undefined &&
      String(previous?.next_follow_up_date || '') !== String(parseDateOnly(input.next_follow_up_date) || '')
    ) {
      changes.push(`follow-up to ${input.next_follow_up_date || 'none'}`);
    }
    if (input.notes !== undefined && previous?.notes !== input.notes) changes.push('notes updated');
    if (
      input.follow_up_outcome !== undefined &&
      previous?.follow_up_outcome !== input.follow_up_outcome
    ) {
      changes.push(`follow-up outcome to ${input.follow_up_outcome}`);
    }
    if (
      input.assigned_follow_up_owner !== undefined &&
      previous?.assigned_follow_up_owner !== input.assigned_follow_up_owner
    ) {
      changes.push(`follow-up owner to ${input.assigned_follow_up_owner || 'unassigned'}`);
    }
    await logActivity({
      inquiryId: updated.id,
      patientName: updated.name,
      action: 'Inquiry updated',
      detail: changes.length ? `Changed ${changes.join(', ')}.` : 'Inquiry details updated.',
    });
  }
  return updated;
}
