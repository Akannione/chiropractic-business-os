import assert from 'node:assert/strict';
import { calculateKpis } from '../services/kpiService.js';
import { parseInquiryCsv } from '../services/importService.js';
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

console.log('Service tests passed.');
