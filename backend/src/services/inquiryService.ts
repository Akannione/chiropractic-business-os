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
  input: Pick<InquiryInput, 'status' | 'notes' | 'next_follow_up_date'>,
) {
  return Inquiry.findByIdAndUpdate(
    id,
    {
      status: input.status,
      notes: input.notes?.trim() || '',
      next_follow_up_date: parseDateOnly(input.next_follow_up_date),
      updated_at: new Date(),
    },
    { new: true, runValidators: true },
  );
}

