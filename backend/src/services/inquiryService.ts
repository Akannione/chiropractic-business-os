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
};

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
    await logActivity({
      inquiryId: updated.id,
      patientName: updated.name,
      action: 'Inquiry updated',
      detail: changes.length ? `Changed ${changes.join(', ')}.` : 'Inquiry details updated.',
    });
  }
  return updated;
}
