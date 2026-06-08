import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { InquiryInput } from './inquiryService.js';

function isEmailConfigured() {
  return Boolean(env.notificationEmail && env.smtp.host && env.smtp.from);
}

export async function notifyNewInquiry(inquiry: InquiryInput) {
  if (!isEmailConfigured()) return { sent: false, reason: 'Email notification is not configured.' };

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user && env.smtp.pass ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to: env.notificationEmail,
    subject: `New patient inquiry: ${inquiry.name}`,
    text: [
      'A new patient inquiry was submitted.',
      '',
      `Patient: ${inquiry.name}`,
      `Phone: ${inquiry.phone}`,
      `Email: ${inquiry.email}`,
      `Requested Service: ${inquiry.service_needed}`,
      `Source: ${inquiry.source}`,
      `Status: ${inquiry.status}`,
      `Follow-Up Date: ${inquiry.next_follow_up_date || 'Not set'}`,
      `Estimated Treatment Value: $${inquiry.estimated_value}`,
      '',
      `Notes: ${inquiry.notes || 'None'}`,
    ].join('\n'),
  });

  return { sent: true };
}
