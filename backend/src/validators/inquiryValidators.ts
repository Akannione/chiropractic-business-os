import { SOURCES, STATUSES } from '../config/constants.js';
import { HttpError } from '../middleware/errorHandler.js';

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const phonePattern = /^\+?[0-9][0-9\s().-]{6,19}$/;

function assertValid(errors: string[]) {
  if (errors.length) throw new HttpError(400, errors.join(' '));
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

export function validateStatus(status: unknown) {
  if (typeof status !== 'string') throw new HttpError(400, 'Choose a valid status.');
  if (!(STATUSES as readonly string[]).includes(status)) throw new HttpError(400, 'Choose a valid status.');
}
