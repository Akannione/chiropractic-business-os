import { FOLLOW_UP_NEEDED_STATUS } from '../config/constants.js';

const day = 24 * 60 * 60 * 1000;

function dateFromOffset(offset: number | null): Date | null {
  if (offset === null) return null;
  const value = new Date(Date.now() + offset * day);
  value.setHours(0, 0, 0, 0);
  return value;
}

function createdFromOffset(offset: number): Date {
  const value = new Date(Date.now() + offset * day);
  value.setHours(9, 0, 0, 0);
  return value;
}

export function buildSampleInquiries() {
  return [
    {
      name: 'Maya Johnson',
      phone: '404-555-0128',
      email: 'maya.johnson@example.com',
      service_needed: 'Spinal Adjustment',
      source: 'Referral',
      status: 'Consultation Scheduled',
      estimated_value: 220,
      notes: 'Referred by an existing patient; lower back stiffness and prefers morning appointments.',
      next_follow_up_date: dateFromOffset(-3),
      created_at: createdFromOffset(-12),
    },
    {
      name: 'Andre Walker',
      phone: '678-555-0191',
      email: 'andre.walker@example.com',
      service_needed: 'Sports Injury Treatment',
      source: 'Google',
      status: 'New Inquiry',
      estimated_value: 280,
      notes: 'Runner with weekend knee and hip pain; asked about first-visit availability.',
      next_follow_up_date: dateFromOffset(1),
      created_at: createdFromOffset(0),
    },
    {
      name: 'Priya Patel',
      phone: '470-555-0177',
      email: 'priya.patel@example.com',
      service_needed: 'Wellness Consultation',
      source: 'Insurance',
      status: FOLLOW_UP_NEEDED_STATUS,
      estimated_value: 175,
      notes: 'Asked whether her insurance covers a wellness visit and wants a benefits check.',
      next_follow_up_date: dateFromOffset(-5),
      created_at: createdFromOffset(-18),
    },
    {
      name: 'Chris Miller',
      phone: '770-555-0142',
      email: 'chris.miller@example.com',
      service_needed: 'Neck Pain Evaluation',
      source: 'Phone Call',
      status: 'Active Patient',
      estimated_value: 260,
      notes: 'Completed consult and started care plan.',
      next_follow_up_date: null,
      created_at: createdFromOffset(-30),
    },
    {
      name: 'Nia Brown',
      phone: '912-555-0184',
      email: 'nia.brown@example.com',
      service_needed: 'Prenatal Chiropractic Consultation',
      source: 'Website',
      status: 'Consultation Scheduled',
      estimated_value: 240,
      notes: 'Website inquiry asking about prenatal care options and side-sleeping discomfort.',
      next_follow_up_date: dateFromOffset(0),
      created_at: createdFromOffset(-4),
    },
    {
      name: 'Jordan Lee',
      phone: '706-555-0109',
      email: 'jordan.lee@example.com',
      service_needed: 'Back Pain Consultation',
      source: 'Referral',
      status: 'Lost',
      estimated_value: 190,
      notes: 'Chose another clinic closer to work after price comparison.',
      next_follow_up_date: null,
      created_at: createdFromOffset(-21),
    },
    {
      name: 'Aisha Coleman',
      phone: '470-555-0120',
      email: 'aisha.coleman@example.com',
      service_needed: 'Spinal Adjustment',
      source: 'Phone Call',
      status: FOLLOW_UP_NEEDED_STATUS,
      estimated_value: 230,
      notes: 'Called during lunch break; wants evening appointment options and needs callback.',
      next_follow_up_date: dateFromOffset(-1),
      created_at: createdFromOffset(-7),
    },
    {
      name: 'Ben Carter',
      phone: '706-555-0181',
      email: 'ben.carter@example.com',
      service_needed: 'Sports Injury Treatment',
      source: 'Google',
      status: 'Consultation Scheduled',
      estimated_value: 275,
      notes: 'Soccer parent asking about recovery plan for recurring ankle issue.',
      next_follow_up_date: dateFromOffset(5),
      created_at: createdFromOffset(-2),
    },
  ].map((item) => ({ ...item, updated_at: item.created_at }));
}

