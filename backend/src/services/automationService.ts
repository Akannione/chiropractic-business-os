import { FOLLOW_UP_NEEDED_STATUS, SOURCES } from '../config/constants.js';
import { addDays, formatDate, startOfToday } from '../utils/date.js';
import { createInquiry, InquiryInput } from './inquiryService.js';
import { notifyNewInquiry } from './notificationService.js';

const defaultEstimatedValue = 200;
const sourceFollowUpOffsets: Record<string, number> = {
  Google: 0,
  Referral: 0,
  Website: 0,
  Insurance: 1,
  'Phone Call': 0,
};

const serviceFollowUpOffsets: Record<string, number> = {
  'Sports Injury Treatment': 0,
  'Spinal Adjustment': 0,
  'Back Pain Consultation': 0,
  'Neck Pain Evaluation': 0,
  'Wellness Consultation': 2,
  'Prenatal Chiropractic Consultation': 1,
};

const serviceEstimatedValues: Record<string, number> = {
  'Spinal Adjustment': 200,
  'Sports Injury Treatment': 350,
  'Wellness Consultation': 150,
  'Neck Pain Evaluation': 250,
  'Back Pain Consultation': 250,
  'Prenatal Chiropractic Consultation': 220,
};

export type AutomatedInquiryInput = {
  name: string;
  phone: string;
  email: string;
  service_needed: string;
  source?: string;
  notes?: string;
  estimated_value?: number;
};

export function normalizeSource(value: unknown) {
  const source = String(value || 'Website').trim();
  return (SOURCES as readonly string[]).includes(source) ? source : 'Website';
}

export function calculateFollowUpDate(source: string, serviceNeeded: string) {
  const sourceOffset = sourceFollowUpOffsets[source] ?? 0;
  const serviceOffset = serviceFollowUpOffsets[serviceNeeded] ?? 0;
  return formatDate(addDays(startOfToday(), Math.max(sourceOffset, serviceOffset)));
}

export function estimateTreatmentValue(serviceNeeded: string, value?: number) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  return serviceEstimatedValues[serviceNeeded] ?? defaultEstimatedValue;
}

export function buildAutomatedInquiryInput(input: AutomatedInquiryInput, intakeLabel: string): InquiryInput {
  const source = normalizeSource(input.source);
  const serviceNeeded = String(input.service_needed || '').trim();
  return {
    name: String(input.name || '').trim(),
    phone: String(input.phone || '').trim(),
    email: String(input.email || '').trim(),
    service_needed: serviceNeeded,
    source,
    status: FOLLOW_UP_NEEDED_STATUS,
    estimated_value: estimateTreatmentValue(serviceNeeded, input.estimated_value),
    notes: String(input.notes || `Submitted from ${intakeLabel}.`).trim(),
    next_follow_up_date: calculateFollowUpDate(source, serviceNeeded),
  };
}

export async function createAutomatedInquiry(input: AutomatedInquiryInput, intakeLabel: string) {
  const inquiryInput = buildAutomatedInquiryInput(input, intakeLabel);
  const inquiry = await createInquiry(inquiryInput);
  notifyNewInquiry(inquiryInput).catch((error: Error) => {
    console.warn(`Inquiry notification failed: ${error.message}`);
  });
  return inquiry;
}
