import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { InquiryShape } from '../models/Inquiry.js';
import { formatDate } from '../utils/date.js';
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

export async function sendDailyFollowUpSummary({
  overdue,
  dueToday,
  newInquiries,
}: {
  overdue: InquiryShape[];
  dueToday: InquiryShape[];
  newInquiries: InquiryShape[];
}) {
  if (!isEmailConfigured()) return { sent: false, reason: 'Email notification is not configured.' };

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user && env.smtp.pass ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });

  const formatRows = (rows: InquiryShape[]) =>
    rows.length
      ? rows
          .map(
            (inquiry) =>
              `- ${inquiry.name} | ${inquiry.phone} | ${inquiry.service_needed} | Follow-up: ${formatDate(inquiry.next_follow_up_date)}`,
          )
          .join('\n')
      : '- None';

  await transporter.sendMail({
    from: env.smtp.from,
    to: env.notificationEmail,
    subject: `${env.practiceName} daily follow-up summary`,
    text: [
      `${env.practiceName} daily follow-up summary`,
      '',
      `Overdue follow-ups (${overdue.length})`,
      formatRows(overdue),
      '',
      `Due today (${dueToday.length})`,
      formatRows(dueToday),
      '',
      `New inquiries (${newInquiries.length})`,
      formatRows(newInquiries),
      '',
      'Open CBOS to update statuses and notes.',
    ].join('\n'),
  });

  return { sent: true };
}
