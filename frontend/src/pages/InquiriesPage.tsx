import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Panel } from '../components/Panel';
import { StatusChip } from '../components/StatusChip';
import { api } from '../services/api';
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
import { displayDate, money, todayIso } from '../utils/format';

type InquiryFormState = {
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
};

type FollowUpFilter = 'All' | 'Needs Follow-Up' | 'Overdue' | 'Due Today';

type InquiriesPageProps = {
  config: AppConfig | null;
  inquiries: Inquiry[];
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

const emptyForm = (config: AppConfig | null): InquiryFormState => ({
  name: '',
  phone: '',
  email: '',
  service_needed: config?.services[0] || 'Spinal Adjustment',
  source: 'Google',
  status: 'New Inquiry',
  estimated_value: 200,
  notes: '',
  next_follow_up_date: todayIso(),
  appointment_status: 'Not Scheduled',
  patient_type: 'New Patient',
  appointment_request: '',
  offer_type: 'None',
  last_visit_date: '',
  expected_visit_frequency_days: null,
  assigned_follow_up_owner: '',
  follow_up_outcome: 'Not Contacted',
});

const formFromInquiry = (inquiry: Inquiry): InquiryFormState => ({
  name: inquiry.name,
  phone: inquiry.phone,
  email: inquiry.email,
  service_needed: inquiry.service_needed,
  source: inquiry.source,
  status: inquiry.status,
  estimated_value: inquiry.estimated_value,
  notes: inquiry.notes,
  next_follow_up_date: inquiry.next_follow_up_date || '',
  appointment_status: inquiry.appointment_status || 'Not Scheduled',
  patient_type: inquiry.patient_type || 'New Patient',
  appointment_request: inquiry.appointment_request || '',
  offer_type: inquiry.offer_type || 'None',
  last_visit_date: inquiry.last_visit_date || '',
  expected_visit_frequency_days: inquiry.expected_visit_frequency_days || null,
  assigned_follow_up_owner: inquiry.assigned_follow_up_owner || '',
  follow_up_outcome: inquiry.follow_up_outcome || 'Not Contacted',
});

function matchesFollowUpFilter(inquiry: Inquiry, filter: FollowUpFilter) {
  if (filter === 'All') return true;
  if (inquiry.status === 'Lost') return false;
  if (filter === 'Needs Follow-Up') {
    return inquiry.status === 'Follow-Up Needed' || Boolean(inquiry.next_follow_up_date && inquiry.next_follow_up_date <= todayIso());
  }
  if (filter === 'Overdue') return Boolean(inquiry.next_follow_up_date && inquiry.next_follow_up_date < todayIso());
  return inquiry.next_follow_up_date === todayIso();
}

export function InquiriesPage({ config, inquiries, onChanged, setError }: InquiriesPageProps) {
  const [form, setForm] = useState<InquiryFormState>(() => emptyForm(config));
  const [selectedId, setSelectedId] = useState('');
  const [detailForm, setDetailForm] = useState<InquiryFormState | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<InquirySource | 'All'>('All');
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter>('All');

  const selectedInquiry = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === selectedId) || inquiries[0] || null,
    [inquiries, selectedId],
  );

  useEffect(() => {
    if (!selectedInquiry) {
      setDetailForm(null);
      setSelectedId('');
      return;
    }
    setSelectedId(selectedInquiry.id);
    setDetailForm(formFromInquiry(selectedInquiry));
  }, [selectedInquiry?.id, inquiries]);

  const filteredInquiries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      const searchText = [inquiry.name, inquiry.phone, inquiry.email, inquiry.service_needed, inquiry.notes]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchText.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'All' || inquiry.status === statusFilter;
      const matchesSource = sourceFilter === 'All' || inquiry.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesSource && matchesFollowUpFilter(inquiry, followUpFilter);
    });
  }, [followUpFilter, inquiries, search, sourceFilter, statusFilter]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const created = await api.createInquiry(form);
      setSelectedId(created.id);
      setForm(emptyForm(config));
      await onChanged('Patient inquiry added.');
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  async function saveDetails(event: FormEvent) {
    event.preventDefault();
    if (!selectedInquiry || !detailForm) return;
    setError('');
    try {
      await api.updateInquiry(selectedInquiry.id, detailForm);
      await onChanged('Patient inquiry updated.');
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  async function quickStatus(status: InquiryStatus) {
    if (!selectedInquiry || !detailForm) return;
    const nextForm = { ...detailForm, status };
    setDetailForm(nextForm);
    setError('');
    try {
      await api.updateInquiry(selectedInquiry.id, nextForm);
      await onChanged(`Patient inquiry moved to ${status}.`);
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Patient Inquiries</h2>
        <p>Add inquiries, find the right patient quickly, and manage follow-up details in one place.</p>
      </div>

      <Panel title="Add Patient Inquiry" description="Use this for phone calls, walk-ins, or staff-entered inquiries.">
        <form className="inquiry-form" onSubmit={submit}>
          <label>
            Patient Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
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
            <input
              value={form.service_needed}
              onChange={(event) => setForm({ ...form, service_needed: event.target.value })}
              list="services"
              required
            />
            <datalist id="services">
              {config?.services.map((service) => <option value={service} key={service} />)}
            </datalist>
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
            <input
              type="number"
              min="0"
              value={form.estimated_value}
              onChange={(event) => setForm({ ...form, estimated_value: Number(event.target.value) })}
            />
          </label>
          <label>
            Next Follow-Up
            <input
              type="date"
              value={form.next_follow_up_date}
              onChange={(event) => setForm({ ...form, next_follow_up_date: event.target.value })}
            />
          </label>
          <div className="form-section-label full">
            <strong>Clinic Workflow</strong>
            <span>Optional details used for appointment tracking and patient reactivation.</span>
          </div>
          <label>
            Patient Type
            <select
              value={form.patient_type}
              onChange={(event) =>
                setForm({ ...form, patient_type: event.target.value as PatientType })
              }
            >
              {(config?.patientTypes || ['New Patient']).map((patientType) => (
                <option key={patientType}>{patientType}</option>
              ))}
            </select>
          </label>
          <label>
            Appointment Status
            <select
              value={form.appointment_status}
              onChange={(event) =>
                setForm({
                  ...form,
                  appointment_status: event.target.value as AppointmentStatus,
                })
              }
            >
              {(config?.appointmentStatuses || ['Not Scheduled']).map((appointmentStatus) => (
                <option key={appointmentStatus}>{appointmentStatus}</option>
              ))}
            </select>
          </label>
          <label>
            Requested Appointment
            <input
              value={form.appointment_request}
              onChange={(event) =>
                setForm({ ...form, appointment_request: event.target.value })
              }
              placeholder="Example: Friday around 10 AM"
            />
          </label>
          <label>
            Offer Type
            <select
              value={form.offer_type}
              onChange={(event) =>
                setForm({ ...form, offer_type: event.target.value as OfferType })
              }
            >
              {(config?.offerTypes || ['None']).map((offerType) => (
                <option key={offerType}>{offerType}</option>
              ))}
            </select>
          </label>
          <label>
            Last Visit Date
            <input
              type="date"
              value={form.last_visit_date}
              onChange={(event) => setForm({ ...form, last_visit_date: event.target.value })}
            />
          </label>
          <label>
            Expected Visit Frequency
            <div className="input-with-suffix">
              <input
                min="1"
                type="number"
                value={form.expected_visit_frequency_days || ''}
                onChange={(event) =>
                  setForm({
                    ...form,
                    expected_visit_frequency_days: event.target.value
                      ? Number(event.target.value)
                      : null,
                  })
                }
              />
              <span>days</span>
            </div>
          </label>
          <label>
            Follow-Up Owner
            <input
              value={form.assigned_follow_up_owner}
              onChange={(event) =>
                setForm({ ...form, assigned_follow_up_owner: event.target.value })
              }
              placeholder="Front Desk, Doctor, or staff name"
            />
          </label>
          <label>
            Follow-Up Outcome
            <select
              value={form.follow_up_outcome}
              onChange={(event) =>
                setForm({
                  ...form,
                  follow_up_outcome: event.target.value as FollowUpOutcome,
                })
              }
            >
              {(config?.followUpOutcomes || ['Not Contacted']).map((outcome) => (
                <option key={outcome}>{outcome}</option>
              ))}
            </select>
          </label>
          <label className="full">
            Notes
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>
          <button className="primary-button full" type="submit">
            Add Inquiry
          </button>
        </form>
      </Panel>

      <Panel title="Find Patient Inquiry" description="Search or filter before opening the inquiry details.">
        <div className="filter-grid">
          <label>
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, phone, email, service, or notes"
            />
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as InquiryStatus | 'All')}>
              <option>All</option>
              {config?.statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Source
            <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as InquirySource | 'All')}>
              <option>All</option>
              {config?.sources.map((source) => <option key={source}>{source}</option>)}
            </select>
          </label>
          <label>
            Follow-Up
            <select value={followUpFilter} onChange={(event) => setFollowUpFilter(event.target.value as FollowUpFilter)}>
              <option>All</option>
              <option>Needs Follow-Up</option>
              <option>Overdue</option>
              <option>Due Today</option>
            </select>
          </label>
        </div>
      </Panel>

      <div className="detail-grid">
        <Panel title={`Inquiry List (${filteredInquiries.length})`} description="Select a patient inquiry to review or update details.">
          {filteredInquiries.length ? (
            <div className="inquiry-list">
              {filteredInquiries.map((inquiry) => (
                <button
                  className={`inquiry-list-item ${selectedInquiry?.id === inquiry.id ? 'selected' : ''}`}
                  key={inquiry.id}
                  onClick={() => setSelectedId(inquiry.id)}
                  type="button"
                >
                  <div>
                    <strong>{inquiry.name}</strong>
                    <span>{inquiry.service_needed}</span>
                    <small>{inquiry.email} · {inquiry.phone}</small>
                  </div>
                  <div className="inquiry-list-meta">
                    <StatusChip status={inquiry.status} />
                    <span>{money(inquiry.estimated_value)}</span>
                    <small>{displayDate(inquiry.next_follow_up_date)}</small>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">No patient inquiries match these filters.</div>
          )}
        </Panel>

        <Panel title="Inquiry Details" description="Update contact information, notes, status, and follow-up timing.">
          {selectedInquiry && detailForm ? (
            <form className="inquiry-form detail-form" onSubmit={saveDetails}>
              <div className="detail-summary full">
                <div>
                  <strong>{selectedInquiry.name}</strong>
                  <span>Created {displayDate(selectedInquiry.created_at.slice(0, 10))}</span>
                </div>
                <StatusChip status={detailForm.status} />
              </div>

              <label>
                Patient Name
                <input value={detailForm.name} onChange={(event) => setDetailForm({ ...detailForm, name: event.target.value })} required />
              </label>
              <label>
                Phone
                <input value={detailForm.phone} onChange={(event) => setDetailForm({ ...detailForm, phone: event.target.value })} required />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={detailForm.email}
                  onChange={(event) => setDetailForm({ ...detailForm, email: event.target.value })}
                  required
                />
              </label>
              <label>
                Requested Service
                <input
                  value={detailForm.service_needed}
                  onChange={(event) => setDetailForm({ ...detailForm, service_needed: event.target.value })}
                  list="detail-services"
                  required
                />
                <datalist id="detail-services">
                  {config?.services.map((service) => <option value={service} key={service} />)}
                </datalist>
              </label>
              <label>
                Inquiry Source
                <select
                  value={detailForm.source}
                  onChange={(event) => setDetailForm({ ...detailForm, source: event.target.value as InquirySource })}
                >
                  {config?.sources.map((source) => <option key={source}>{source}</option>)}
                </select>
              </label>
              <label>
                Status
                <select
                  value={detailForm.status}
                  onChange={(event) => setDetailForm({ ...detailForm, status: event.target.value as InquiryStatus })}
                >
                  {config?.statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label>
                Estimated Treatment Value
                <input
                  type="number"
                  min="0"
                  value={detailForm.estimated_value}
                  onChange={(event) => setDetailForm({ ...detailForm, estimated_value: Number(event.target.value) })}
                />
              </label>
              <label>
                Next Follow-Up
                <input
                  type="date"
                  value={detailForm.next_follow_up_date}
                  onChange={(event) => setDetailForm({ ...detailForm, next_follow_up_date: event.target.value })}
                />
              </label>
              <div className="form-section-label full">
                <strong>Clinic Workflow</strong>
                <span>Appointment details and return timing used by the reactivation call list.</span>
              </div>
              <label>
                Patient Type
                <select
                  value={detailForm.patient_type}
                  onChange={(event) =>
                    setDetailForm({
                      ...detailForm,
                      patient_type: event.target.value as PatientType,
                    })
                  }
                >
                  {(config?.patientTypes || ['New Patient']).map((patientType) => (
                    <option key={patientType}>{patientType}</option>
                  ))}
                </select>
              </label>
              <label>
                Appointment Status
                <select
                  value={detailForm.appointment_status}
                  onChange={(event) =>
                    setDetailForm({
                      ...detailForm,
                      appointment_status: event.target.value as AppointmentStatus,
                    })
                  }
                >
                  {(config?.appointmentStatuses || ['Not Scheduled']).map((appointmentStatus) => (
                    <option key={appointmentStatus}>{appointmentStatus}</option>
                  ))}
                </select>
              </label>
              <label>
                Requested Appointment
                <input
                  value={detailForm.appointment_request}
                  onChange={(event) =>
                    setDetailForm({
                      ...detailForm,
                      appointment_request: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Offer Type
                <select
                  value={detailForm.offer_type}
                  onChange={(event) =>
                    setDetailForm({
                      ...detailForm,
                      offer_type: event.target.value as OfferType,
                    })
                  }
                >
                  {(config?.offerTypes || ['None']).map((offerType) => (
                    <option key={offerType}>{offerType}</option>
                  ))}
                </select>
              </label>
              <label>
                Last Visit Date
                <input
                  type="date"
                  value={detailForm.last_visit_date}
                  onChange={(event) =>
                    setDetailForm({ ...detailForm, last_visit_date: event.target.value })
                  }
                />
              </label>
              <label>
                Expected Visit Frequency
                <div className="input-with-suffix">
                  <input
                    min="1"
                    type="number"
                    value={detailForm.expected_visit_frequency_days || ''}
                    onChange={(event) =>
                      setDetailForm({
                        ...detailForm,
                        expected_visit_frequency_days: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                  />
                  <span>days</span>
                </div>
              </label>
              <label>
                Follow-Up Owner
                <input
                  value={detailForm.assigned_follow_up_owner}
                  onChange={(event) =>
                    setDetailForm({
                      ...detailForm,
                      assigned_follow_up_owner: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Follow-Up Outcome
                <select
                  value={detailForm.follow_up_outcome}
                  onChange={(event) =>
                    setDetailForm({
                      ...detailForm,
                      follow_up_outcome: event.target.value as FollowUpOutcome,
                    })
                  }
                >
                  {(config?.followUpOutcomes || ['Not Contacted']).map((outcome) => (
                    <option key={outcome}>{outcome}</option>
                  ))}
                </select>
              </label>
              <label className="full">
                Notes
                <textarea value={detailForm.notes} onChange={(event) => setDetailForm({ ...detailForm, notes: event.target.value })} />
              </label>

              <div className="quick-actions full">
                <button type="button" onClick={() => quickStatus('Follow-Up Needed')}>Needs Follow-Up</button>
                <button type="button" onClick={() => quickStatus('Consultation Scheduled')}>Consultation Scheduled</button>
                <button type="button" onClick={() => quickStatus('Active Patient')}>Active Patient</button>
                <button type="button" onClick={() => quickStatus('Lost')}>Lost</button>
              </div>

              <button className="primary-button full" type="submit">
                Save Inquiry Details
              </button>
            </form>
          ) : (
            <div className="empty-state">Select a patient inquiry to see details.</div>
          )}
        </Panel>
      </div>
    </section>
  );
}
