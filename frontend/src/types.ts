export type View =
  | 'dashboard'
  | 'inquiries'
  | 'reactivations'
  | 'summary'
  | 'monthly'
  | 'activity'
  | 'exports'
  | 'settings'
  | 'public-intake';

export type InquiryStatus =
  | 'New Inquiry'
  | 'Consultation Scheduled'
  | 'Active Patient'
  | 'Lost'
  | 'Follow-Up Needed';

export type InquirySource = 'Google' | 'Referral' | 'Insurance' | 'Website' | 'Phone Call';
export type AppointmentStatus =
  | 'Not Scheduled'
  | 'Appointment Scheduled'
  | 'Cancelled'
  | 'No Show';
export type PatientType = 'New Patient' | 'Existing Patient' | 'Reactivation' | 'Dead Lead';
export type OfferType = 'None' | 'Groupon' | 'Other';
export type FollowUpOutcome =
  | 'Not Contacted'
  | 'Left Voicemail'
  | 'Spoke - Scheduled'
  | 'Spoke - Not Scheduled'
  | 'No Response';

export type Inquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service_needed: string;
  source: InquirySource;
  status: InquiryStatus;
  estimated_value: number;
  notes: string;
  next_follow_up_date: string;
  appointment_status: AppointmentStatus;
  patient_type: PatientType;
  appointment_request: string;
  offer_type: OfferType;
  last_visit_date: string;
  expected_visit_frequency_days: number | null;
  assigned_follow_up_owner: string;
  follow_up_outcome: FollowUpOutcome;
  created_at: string;
  updated_at: string;
};

export type PublicInquiryInput = {
  name: string;
  phone: string;
  email: string;
  service_needed: string;
  source?: InquirySource;
  notes?: string;
};

export type Kpis = {
  totalPatientInquiries: number;
  newThisWeek: number;
  activePatients: number;
  followUpsNeeded: number;
  followUpsNeededPercent: number;
  overdueFollowUps: number;
  estimatedTreatmentValue: number;
  inquiryToPatientRate: number;
  topInquirySource: string;
};

export type WeeklySummary = Kpis & {
  weekStart: string;
  weekEnd: string;
  plainEnglishSummary: string;
};

export type MonthlySummary = Kpis & {
  monthStart: string;
  monthEnd: string;
  plainEnglishSummary: string;
};

export type AppConfig = {
  practiceName: string;
  statuses: InquiryStatus[];
  sources: InquirySource[];
  services: string[];
  appointmentStatuses: AppointmentStatus[];
  patientTypes: PatientType[];
  offerTypes: OfferType[];
  followUpOutcomes: FollowUpOutcome[];
  demoMode: boolean;
  kpiHelp: Record<string, string>;
};

export type AuthStatus = {
  authEnabled: boolean;
};

export type LoginResult = AuthStatus & {
  token: string;
};

export type Activity = {
  id: string;
  inquiry_id?: string;
  patient_name: string;
  action: string;
  detail: string;
  created_at: string;
};

export type ReminderResult = {
  sent: boolean;
  reason?: string;
  overdue: number;
  dueToday: number;
  newInquiries: number;
};

export type ImportPreviewRow = {
  rowNumber: number;
  name: string;
  phone: string;
  email: string;
  service_needed: string;
  source: InquirySource;
  estimated_value: number;
  appointment_status: AppointmentStatus;
  patient_type: PatientType;
  appointment_request: string;
  offer_type: OfferType;
  last_visit_date: string | null;
  expected_visit_frequency_days: number | null;
  assigned_follow_up_owner: string;
  follow_up_outcome: FollowUpOutcome;
  duplicate: boolean;
  errors: string[];
};

export type ImportPreview = {
  rows: ImportPreviewRow[];
  totalRows: number;
  importableRows: number;
  duplicateRows: number;
  errorRows: number;
};

export type ImportResult = {
  imported: number;
  skippedDuplicates: number;
  failed: number;
  errors: string[];
};

export type ReactivationStatus = 'Overdue' | 'Due Today' | 'Upcoming';

export type ReactivationRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service_needed: string;
  status: InquiryStatus;
  patient_type: PatientType;
  last_visit_date: string;
  expected_visit_frequency_days: number;
  next_reactivation_date: string;
  reactivation_status: ReactivationStatus;
  days_overdue: number;
  assigned_follow_up_owner: string;
  follow_up_outcome: FollowUpOutcome;
  notes: string;
  next_follow_up_date: string;
};

export type ReactivationQueue = {
  rows: ReactivationRow[];
  overdue: number;
  dueToday: number;
  upcoming: number;
};
