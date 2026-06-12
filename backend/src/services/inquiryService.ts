import { Inquiry } from '../models/Inquiry.js';
import { parseDateOnly } from '../utils/date.js';

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
  return Inquiry.create({
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
}

export async function updateInquiry(
  id: string,
  input: Partial<InquiryInput>,
) {
  return Inquiry.findByIdAndUpdate(
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
}
