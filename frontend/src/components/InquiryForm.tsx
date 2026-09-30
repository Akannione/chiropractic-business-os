import { useEffect, useId, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  AppConfig,
  AppointmentStatus,
  FollowUpOutcome,
  Inquiry,
  InquirySource,
  InquiryStatus,
  OfferType,
  PatientType,
} from '../types';
import { todayIso } from '../utils/format';

export type InquiryFormState = Pick<
  Inquiry,
  | 'name'
  | 'phone'
  | 'email'
  | 'service_needed'
  | 'activity_context'
  | 'source'
  | 'status'
  | 'estimated_value'
  | 'notes'
  | 'next_follow_up_date'
  | 'appointment_status'
  | 'patient_type'
  | 'appointment_request'
  | 'offer_type'
  | 'last_visit_date'
  | 'expected_visit_frequency_days'
  | 'assigned_follow_up_owner'
  | 'follow_up_outcome'
>;

export function emptyInquiryForm(config: AppConfig | null): InquiryFormState {
  return {
    name: '',
    phone: '',
    email: '',
    service_needed: config?.services[0] || 'Spinal Adjustment',
    activity_context: '',
    source: config?.sources[0] || 'Google',
    status: config?.statuses[0] || 'New Inquiry',
    estimated_value: 200,
    notes: '',
    next_follow_up_date: todayIso(),
    appointment_status: config?.appointmentStatuses[0] || 'Not Scheduled',
    patient_type: config?.patientTypes[0] || 'New Patient',
    appointment_request: '',
    offer_type: config?.offerTypes[0] || 'None',
    last_visit_date: '',
    expected_visit_frequency_days: null,
    assigned_follow_up_owner: '',
    follow_up_outcome: config?.followUpOutcomes[0] || 'Not Contacted',
  };
}

type InquiryFormProps = {
  config: AppConfig | null;
  onSubmit: (form: InquiryFormState) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
  submitLabel?: string;
};

export function InquiryForm({
  config,
  onSubmit,
  onCancel,
  autoFocus = false,
  submitLabel = 'Add Inquiry',
}: InquiryFormProps) {
  const [form, setForm] = useState<InquiryFormState>(() => emptyInquiryForm(config));
  const [submitting, setSubmitting] = useState(false);
  const servicesId = useId();

  useEffect(() => {
    if (config && !form.service_needed) setForm(emptyInquiryForm(config));
  }, [config]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm(emptyInquiryForm(config));
    } catch {
      // The caller owns the user-facing error message; keep the entered values.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inquiry-form" onSubmit={submit}>
      <label>
        Patient Name
        <input autoFocus={autoFocus} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
      </label>
      <label>
        Phone
        <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
      </label>
      <label>
        Email
        <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
      </label>
      <label>
        Requested Service
        <input value={form.service_needed} onChange={(event) => setForm({ ...form, service_needed: event.target.value })} list={servicesId} required />
        <datalist id={servicesId}>{config?.services.map((service) => <option value={service} key={service} />)}</datalist>
      </label>
      <label className="full">
        Activity / Movement Context
        <input value={form.activity_context} onChange={(event) => setForm({ ...form, activity_context: event.target.value })} placeholder="Example: Athlete; runner; return-to-sport goal" maxLength={500} />
      </label>
      <label>
        Inquiry Source
        <select value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value as InquirySource })}>
          {config?.sources.map((source) => <option key={source}>{source}</option>)}
        </select>
      </label>
      <label>
        Status
        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as InquiryStatus })}>
          {config?.statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>
      <label>
        Estimated Treatment Value
        <input type="number" min="0" value={form.estimated_value} onChange={(event) => setForm({ ...form, estimated_value: Number(event.target.value) })} />
      </label>
      <label>
        Next Follow-Up
        <input type="date" value={form.next_follow_up_date} onChange={(event) => setForm({ ...form, next_follow_up_date: event.target.value })} />
      </label>
      <div className="form-section-label full">
        <strong>Clinic Workflow</strong>
        <span>Optional details used for appointment tracking and patient reactivation.</span>
      </div>
      <label>
        Patient Type
        <select value={form.patient_type} onChange={(event) => setForm({ ...form, patient_type: event.target.value as PatientType })}>
          {(config?.patientTypes || ['New Patient']).map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label>
        Appointment Status
        <select value={form.appointment_status} onChange={(event) => setForm({ ...form, appointment_status: event.target.value as AppointmentStatus })}>
          {(config?.appointmentStatuses || ['Not Scheduled']).map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label>
        Requested Appointment
        <input value={form.appointment_request} onChange={(event) => setForm({ ...form, appointment_request: event.target.value })} placeholder="Example: Friday around 10 AM" />
      </label>
      <label>
        Offer Type
        <select value={form.offer_type} onChange={(event) => setForm({ ...form, offer_type: event.target.value as OfferType })}>
          {(config?.offerTypes || ['None']).map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label>
        Last Visit Date
        <input type="date" value={form.last_visit_date} onChange={(event) => setForm({ ...form, last_visit_date: event.target.value })} />
      </label>
      <label>
        Expected Visit Frequency
        <div className="input-with-suffix">
          <input min="1" type="number" value={form.expected_visit_frequency_days || ''} onChange={(event) => setForm({ ...form, expected_visit_frequency_days: event.target.value ? Number(event.target.value) : null })} />
          <span>days</span>
        </div>
      </label>
      <label>
        Follow-Up Owner
        <input value={form.assigned_follow_up_owner} onChange={(event) => setForm({ ...form, assigned_follow_up_owner: event.target.value })} placeholder="Front Desk, Doctor, or staff name" />
      </label>
      <label>
        Follow-Up Outcome
        <select value={form.follow_up_outcome} onChange={(event) => setForm({ ...form, follow_up_outcome: event.target.value as FollowUpOutcome })}>
          {(config?.followUpOutcomes || ['Not Contacted']).map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label className="full">
        Notes
        <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </label>
      <div className="inquiry-form-actions full">
        {onCancel && <button className="primary-button secondary" type="button" onClick={onCancel}>Cancel</button>}
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Adding...' : submitLabel}</button>
      </div>
    </form>
  );
}
