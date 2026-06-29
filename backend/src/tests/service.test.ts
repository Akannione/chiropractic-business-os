import assert from 'node:assert/strict';
import { calculateKpis } from '../services/kpiService.js';
import { mapExternalRow, parseInquiryCsv } from '../services/importService.js';
import { buildReactivationQueue } from '../services/reactivationService.js';
import { buildWeeklySummary } from '../services/reportService.js';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const inquiries = [
  {
    status: 'Active Patient',
    estimated_value: 300,
    source: 'Google',
    created_at: today,
    next_follow_up_date: null,
  },
  {
    status: 'Follow-Up Needed',
    estimated_value: 200,
    source: 'Referral',
    created_at: today,
    next_follow_up_date: yesterday,
  },
] as never;

const kpis = calculateKpis(inquiries);
assert.equal(kpis.totalPatientInquiries, 2);
assert.equal(kpis.activePatients, 1);
assert.equal(kpis.followUpsNeeded, 1);
assert.equal(kpis.overdueFollowUps, 1);
assert.equal(kpis.estimatedTreatmentValue, 500);

const csvRows = parseInquiryCsv('name,phone,email\nTest Patient,404-555-0100,test@example.com\n');
assert.equal(csvRows.length, 1);
assert.equal(csvRows[0].name, 'Test Patient');

const weeklySummary = buildWeeklySummary(inquiries);
assert.equal(weeklySummary.totalPatientInquiries, 2);
assert.ok(weeklySummary.plainEnglishSummary.includes('patient inquiries'));

const reactivationToday = new Date('2026-06-24T12:00:00.000Z');
const reactivationQueue = buildReactivationQueue(
  [
    {
      _id: 'overdue',
      name: 'Overdue Patient',
      phone: '404-555-0101',
      email: 'overdue@example.com',
      service_needed: 'Spinal Adjustment',
      status: 'Active Patient',
      patient_type: 'Existing Patient',
      last_visit_date: new Date('2026-05-20T00:00:00.000Z'),
      expected_visit_frequency_days: 30,
      assigned_follow_up_owner: 'Front Desk',
      follow_up_outcome: 'Not Contacted',
      notes: '',
    },
    {
      _id: 'due',
      name: 'Due Today Patient',
      phone: '404-555-0102',
      email: 'due@example.com',
      service_needed: 'Wellness Consultation',
      status: 'Active Patient',
      patient_type: 'Reactivation',
      last_visit_date: new Date('2026-06-17T00:00:00.000Z'),
      expected_visit_frequency_days: 7,
      assigned_follow_up_owner: 'Doc',
      follow_up_outcome: 'Left Voicemail',
      notes: '',
    },
    {
      _id: 'upcoming',
      name: 'Upcoming Patient',
      phone: '404-555-0103',
      email: 'upcoming@example.com',
      service_needed: 'Massage Therapy',
      status: 'Active Patient',
      patient_type: 'Existing Patient',
      last_visit_date: new Date('2026-06-20T00:00:00.000Z'),
      expected_visit_frequency_days: 7,
      assigned_follow_up_owner: '',
      follow_up_outcome: 'Not Contacted',
      notes: '',
    },
    {
      _id: 'excluded',
      name: 'Dead Lead',
      phone: '404-555-0104',
      email: 'dead@example.com',
      service_needed: 'Spinal Adjustment',
      status: 'Lost',
      patient_type: 'Dead Lead',
      last_visit_date: new Date('2026-05-01T00:00:00.000Z'),
      expected_visit_frequency_days: 30,
      assigned_follow_up_owner: '',
      follow_up_outcome: 'No Response',
      notes: '',
    },
  ] as never,
  reactivationToday,
);
assert.deepEqual(
  reactivationQueue.rows.map((row) => row.name),
  ['Overdue Patient', 'Due Today Patient', 'Upcoming Patient'],
);
assert.equal(reactivationQueue.overdue, 1);
assert.equal(reactivationQueue.dueToday, 1);
assert.equal(reactivationQueue.upcoming, 1);
assert.equal(reactivationQueue.rows[0].days_overdue, 5);
assert.equal(reactivationQueue.rows[1].reactivation_status, 'Due Today');
assert.equal(reactivationQueue.rows[2].next_reactivation_date, '2026-06-27');

const metaSoftRows = parseInquiryCsv(
  [
    'Patient Name,Phone,Email,Requested Service,Patient Type,Appointment Status,Requested Appointment,Offer Type,Last Visit Date,Visit Frequency Days,Assigned Follow-Up Owner,Follow-Up Outcome,Notes',
    'Taylor Brooks,404-555-0110,taylor@example.com,Massage Therapy,Existing Patient,Appointment Scheduled,Friday 10 AM,Groupon,2026-05-20,30,Front Desk,Left Voicemail,Requested reactivation call',
  ].join('\n'),
);
const mappedMetaSoftRow = mapExternalRow(metaSoftRows[0]);
assert.equal(mappedMetaSoftRow.patient_type, 'Existing Patient');
assert.equal(mappedMetaSoftRow.appointment_status, 'Appointment Scheduled');
assert.equal(mappedMetaSoftRow.appointment_request, 'Friday 10 AM');
assert.equal(mappedMetaSoftRow.offer_type, 'Groupon');
assert.equal(mappedMetaSoftRow.last_visit_date, '2026-05-20');
assert.equal(mappedMetaSoftRow.expected_visit_frequency_days, 30);
assert.equal(mappedMetaSoftRow.assigned_follow_up_owner, 'Front Desk');
assert.equal(mappedMetaSoftRow.follow_up_outcome, 'Left Voicemail');

console.log('Service tests passed.');
