import {
  APPOINTMENT_STATUSES,
  FOLLOW_UP_OUTCOMES,
  OFFER_TYPES,
  PATIENT_TYPES,
  SOURCES,
  STATUSES,
} from '../config/constants.js';
import { HttpError } from '../middleware/errorHandler.js';

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const phonePattern = /^\+?[0-9][0-9\s().-]{6,19}$/;

function assertValid(errors: string[]) {
  if (errors.length) throw new HttpError(400, errors.join(' '));
}

function workflowErrors(body: Record<string, unknown>) {
  const errors: string[] = [];
  if (
    body.appointment_status !== undefined &&
    !(APPOINTMENT_STATUSES as readonly string[]).includes(String(body.appointment_status))
  ) {
    errors.push('Choose a valid appointment status.');
  }
  if (
    body.patient_type !== undefined &&
    !(PATIENT_TYPES as readonly string[]).includes(String(body.patient_type))
  ) {
    errors.push('Choose a valid patient type.');
  }
  if (
    body.offer_type !== undefined &&
    !(OFFER_TYPES as readonly string[]).includes(String(body.offer_type))
  ) {
    errors.push('Choose a valid offer type.');
  }
  if (
    body.follow_up_outcome !== undefined &&
    !(FOLLOW_UP_OUTCOMES as readonly string[]).includes(String(body.follow_up_outcome))
  ) {
    errors.push('Choose a valid follow-up outcome.');
  }
  if (
    body.expected_visit_frequency_days !== undefined &&
    body.expected_visit_frequency_days !== null &&
    body.expected_visit_frequency_days !== '' &&
    (!Number.isInteger(Number(body.expected_visit_frequency_days)) ||
      Number(body.expected_visit_frequency_days) < 1)
  ) {
    errors.push('Expected visit frequency must be a positive whole number of days.');
  }
  return errors;
}

export function validateInquiryBody(body: Record<string, unknown>) {
  const errors: string[] = [];
  if (!String(body.name || '').trim()) errors.push('Patient name is required.');
  if (!phonePattern.test(String(body.phone || '').trim())) errors.push('Enter a valid phone number.');
  if (!emailPattern.test(String(body.email || '').trim())) errors.push('Enter a valid email address.');
  if (!String(body.service_needed || '').trim()) errors.push('Requested Service is required.');
  if (!(SOURCES as readonly string[]).includes(String(body.source))) errors.push('Choose a valid inquiry source.');
  if (!(STATUSES as readonly string[]).includes(String(body.status))) errors.push('Choose a valid status.');
  if (Number(body.estimated_value || 0) < 0) errors.push('Estimated Treatment Value cannot be negative.');
  errors.push(...workflowErrors(body));
  assertValid(errors);
}

export function validatePublicInquiryBody(body: Record<string, unknown>) {
  const errors: string[] = [];
  if (!String(body.name || '').trim()) errors.push('Patient name is required.');
  if (!phonePattern.test(String(body.phone || '').trim())) errors.push('Enter a valid phone number.');
  if (!emailPattern.test(String(body.email || '').trim())) errors.push('Enter a valid email address.');
  if (!String(body.service_needed || '').trim()) errors.push('Requested Service is required.');
  if (body.source && !(SOURCES as readonly string[]).includes(String(body.source))) {
    errors.push('Choose a valid inquiry source.');
  }
  assertValid(errors);
}

export function validateInquiryUpdate(body: Record<string, unknown>) {
  const errors = workflowErrors(body);
  if (body.status !== undefined && !(STATUSES as readonly string[]).includes(String(body.status))) {
    errors.push('Choose a valid status.');
  }
  if (body.estimated_value !== undefined && Number(body.estimated_value) < 0) {
    errors.push('Estimated Treatment Value cannot be negative.');
  }
  assertValid(errors);
}
