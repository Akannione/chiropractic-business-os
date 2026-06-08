export type View = 'dashboard' | 'inquiries' | 'summary' | 'exports' | 'public-intake';

export type InquiryStatus =
  | 'New Inquiry'
  | 'Consultation Scheduled'
  | 'Active Patient'
  | 'Lost'
  | 'Follow-Up Needed';

export type InquirySource = 'Google' | 'Referral' | 'Insurance' | 'Website' | 'Phone Call';

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

export type AppConfig = {
  statuses: InquiryStatus[];
  sources: InquirySource[];
  services: string[];
  demoMode: boolean;
  kpiHelp: Record<string, string>;
};
