import { Inquiry } from '../models/Inquiry.js';
import { parseDateOnly } from '../utils/date.js';
import { logActivity } from './activityService.js';

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

export async function listInquiries() {
  return Inquiry.find().sort({ created_at: -1, _id: -1 }).lean({ virtuals: true });
}

export async function createInquiry(input: InquiryInput) {
  const now = new Date();
  const inquiry = await Inquiry.create({
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
  });
  await logActivity({
    inquiryId: inquiry.id,
    patientName: inquiry.name,
    action: 'Inquiry created',
    detail: `Created from ${inquiry.source} with status ${inquiry.status}.`,
  });
  return inquiry;
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
