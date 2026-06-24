export const STATUSES = [
  'New Inquiry',
  'Consultation Scheduled',
  'Active Patient',
  'Lost',
  'Follow-Up Needed',
] as const;

export const SOURCES = ['Google', 'Referral', 'Insurance', 'Website', 'Phone Call'] as const;

export const APPOINTMENT_STATUSES = [
  'Not Scheduled',
  'Appointment Scheduled',
  'Cancelled',
  'No Show',
] as const;

export const PATIENT_TYPES = [
  'New Patient',
  'Existing Patient',
  'Reactivation',
  'Dead Lead',
] as const;

export const OFFER_TYPES = ['None', 'Groupon', 'Other'] as const;

export const FOLLOW_UP_OUTCOMES = [
  'Not Contacted',
  'Left Voicemail',
  'Spoke - Scheduled',
  'Spoke - Not Scheduled',
  'No Response',
] as const;

export const SERVICES = [
  'Spinal Adjustment',
  'Sports Injury Treatment',
  'Wellness Consultation',
  'Neck Pain Evaluation',
  'Back Pain Consultation',
  'Prenatal Chiropractic Consultation',
  'Massage Therapy',
] as const;

export const ACTIVE_STATUS = 'Active Patient';
export const LOST_STATUS = 'Lost';
export const FOLLOW_UP_NEEDED_STATUS = 'Follow-Up Needed';

export const KPI_HELP = {
  estimatedTreatmentValue:
    'The total potential treatment revenue from patient inquiries that have not been marked Lost.',
  conversionRate: 'The share of all patient inquiries that became Active Patients.',
  followUpsNeeded: 'Inquiries marked Follow-Up Needed or due for follow-up today or earlier.',
  newThisWeek: 'Patient inquiries created during the current week, starting Monday.',
  activePatients: 'Patient inquiries currently marked Active Patient.',
  overdueFollowUps: 'Inquiries with a follow-up date before today. Lost inquiries are excluded.',
  topInquirySource: 'The inquiry source with the highest number of patient inquiries.',
} as const;
