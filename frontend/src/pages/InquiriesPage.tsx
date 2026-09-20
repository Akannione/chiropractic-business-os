import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Panel } from '../components/Panel';
import { InquiryForm } from '../components/InquiryForm';
import { StatusChip } from '../components/StatusChip';
import { api } from '../services/api';
import type {
  AppConfig,
  AppointmentStatus,
  FollowUpFilter,
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
  activity_context: string;
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

type InquiriesPageProps = {
  config: AppConfig | null;
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

const PAGE_SIZE = 25;

/** Delay before a keystroke turns into a request. */
const SEARCH_DEBOUNCE_MS = 300;

const formFromInquiry = (inquiry: Inquiry): InquiryFormState => ({
  name: inquiry.name,
  phone: inquiry.phone,
  email: inquiry.email,
  service_needed: inquiry.service_needed,
  activity_context: inquiry.activity_context || '',
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

function followUpTiming(nextFollowUpDate: string) {
  if (!nextFollowUpDate) {
    return { label: 'No follow-up date', className: 'neutral' };
  }
  const today = todayIso();
  if (nextFollowUpDate < today) return { label: 'Overdue', className: 'overdue' };
  if (nextFollowUpDate === today) return { label: 'Due today', className: 'due-today' };
  return { label: 'Upcoming', className: 'upcoming' };
}

function needsAttention(inquiry: Inquiry) {
  return (
    inquiry.status === 'Follow-Up Needed' ||
    Boolean(inquiry.next_follow_up_date && inquiry.next_follow_up_date <= todayIso())
  );
}

export function InquiriesPage({ config, onChanged, setError }: InquiriesPageProps) {
  const [selectedId, setSelectedId] = useState('');
  const [detailForm, setDetailForm] = useState<InquiryFormState | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<InquirySource | 'All'>('All');
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter>('All');

  const [rows, setRows] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  // Searching is debounced so a request is not issued per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  // Any change to the filters invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sourceFilter, followUpFilter]);

  // Filtering and searching run in the database; this page holds one page of
  // results rather than the whole collection.
  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    api
      .inquiries({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        status: statusFilter,
        source: sourceFilter,
        followUp: followUpFilter,
      })
      .then((result) => {
        if (cancelled) return;
        setRows(result.rows);
        setTotal(result.total);
      })
      .catch((error: Error) => {
        if (!cancelled) setError(error.message);
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, statusFilter, sourceFilter, followUpFilter, reloadToken]);

  const selectedInquiry = useMemo(
    () => rows.find((inquiry) => inquiry.id === selectedId) || rows[0] || null,
    [rows, selectedId],
  );

  useEffect(() => {
    if (!selectedInquiry) {
      setDetailForm(null);
      setSelectedId('');
      return;
    }
    setSelectedId(selectedInquiry.id);
    setDetailForm(formFromInquiry(selectedInquiry));
  }, [selectedInquiry?.id, rows]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const selectedFollowUpTiming = detailForm
    ? followUpTiming(detailForm.next_follow_up_date)
    : null;

  /** Refetches the current page after a create or update. */
  async function reloadList(message: string) {
    setReloadToken((token) => token + 1);
    await onChanged(message);
  }

  async function saveDetails(event: FormEvent) {
    event.preventDefault();
    if (!selectedInquiry || !detailForm) return;
    setError('');
    try {
      await api.updateInquiry(selectedInquiry.id, detailForm);
      await reloadList('Patient inquiry updated.');
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
      await reloadList(`Patient inquiry moved to ${status}.`);
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  function showFollowUps() {
    setStatusFilter('All');
    setSourceFilter('All');
    setFollowUpFilter('Needs Follow-Up');
  }

  function showOverdue() {
    setStatusFilter('All');
    setSourceFilter('All');
    setFollowUpFilter('Overdue');
  }

  function showNewInquiries() {
    setStatusFilter('New Inquiry');
    setSourceFilter('All');
    setFollowUpFilter('All');
  }

  function showActivePatients() {
    setStatusFilter('Active Patient');
    setSourceFilter('All');
    setFollowUpFilter('All');
  }

  function clearFilters() {
    setSearch('');
    setStatusFilter('All');
    setSourceFilter('All');
    setFollowUpFilter('All');
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Patient Inquiries</h2>
        <p>Add inquiries, find the right patient quickly, and manage follow-up details in one place.</p>
      </div>

      <Panel title="Add Patient Inquiry" description="Use this for phone calls, walk-ins, or staff-entered inquiries.">
        <InquiryForm
          config={config}
          onSubmit={async (form) => {
            setError('');
            try {
              const created = await api.createInquiry(form);
              setSelectedId(created.id);
              await reloadList('Patient inquiry added.');
            } catch (nextError) {
              setError((nextError as Error).message);
              throw nextError;
            }
          }}
        />
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
        <div className="quick-filter-bar" aria-label="Common patient inquiry filters">
          <button type="button" onClick={showFollowUps}>
            Needs Follow-Up
          </button>
          <button type="button" onClick={showOverdue}>
            Overdue
          </button>
          <button type="button" onClick={showNewInquiries}>
            New Inquiries
          </button>
          <button type="button" onClick={showActivePatients}>
            Active Patients
          </button>
          <button type="button" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </Panel>

      <div className="detail-grid">
        <Panel title={`Inquiry List (${total})`} description="Select a patient inquiry to review or update details.">
          {rows.length ? (
            <div className="inquiry-list">
              {rows.map((inquiry) => {
                const timing = followUpTiming(inquiry.next_follow_up_date);
                return (
                  <button
                    className={`inquiry-list-item ${selectedInquiry?.id === inquiry.id ? 'selected' : ''} ${needsAttention(inquiry) ? 'needs-attention' : ''}`}
                    key={inquiry.id}
                    onClick={() => setSelectedId(inquiry.id)}
                    type="button"
                  >
                    <div>
                      <strong>{inquiry.name}</strong>
                      <span>{inquiry.service_needed}</span>
                      {inquiry.activity_context && <small>{inquiry.activity_context}</small>}
                      <small>{inquiry.email} · {inquiry.phone}</small>
                    </div>
                    <div className="inquiry-list-meta">
                      {timing.className !== 'neutral' && (
                        <span className={`urgency-label ${timing.className}`}>{timing.label}</span>
                      )}
                      <StatusChip status={inquiry.status} />
                      <span>{money(inquiry.estimated_value)}</span>
                      <small>Follow-up: {displayDate(inquiry.next_follow_up_date)}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              {listLoading ? 'Loading patient inquiries...' : 'No patient inquiries match these filters.'}
            </div>
          )}

          {pageCount > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={page <= 1 || listLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <span>
                Page {page} of {pageCount}
              </span>
              <button
                type="button"
                disabled={page >= pageCount || listLoading}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                Next
              </button>
            </div>
          )}
        </Panel>

        <div className="sticky-detail">
          <Panel
            title={selectedInquiry ? `Work ${selectedInquiry.name}` : 'Inquiry Details'}
            description="Update the patient record, follow-up timing, and next workflow step."
          >
            {selectedInquiry && detailForm ? (
              <form className="inquiry-form detail-form" onSubmit={saveDetails}>
                <div className="detail-summary full">
                  <div>
                    <strong>{selectedInquiry.name}</strong>
                    <span>Created {displayDate(selectedInquiry.created_at.slice(0, 10))}</span>
                  </div>
                  <StatusChip status={detailForm.status} />
                </div>

                <div className="detail-insight-grid full">
                  <div className={`detail-insight ${selectedFollowUpTiming?.className || ''}`}>
                    <span>Follow-Up</span>
                    <strong>{displayDate(detailForm.next_follow_up_date)}</strong>
                    <small>{selectedFollowUpTiming?.label}</small>
                  </div>
                  <div className="detail-insight">
                    <span>Treatment Value</span>
                    <strong>{money(detailForm.estimated_value)}</strong>
                    <small>Estimated patient opportunity</small>
                  </div>
                  <div className="detail-insight">
                    <span>Owner</span>
                    <strong>{detailForm.assigned_follow_up_owner || 'Unassigned'}</strong>
                    <small>{detailForm.follow_up_outcome}</small>
                  </div>
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
              <label className="full">
                Activity / Movement Context
                <input
                  value={detailForm.activity_context}
                  onChange={(event) =>
                    setDetailForm({ ...detailForm, activity_context: event.target.value })
                  }
                  placeholder="Example: Desk worker; neck mobility goal"
                  maxLength={500}
                />
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
                <button className="success-action" type="button" onClick={() => quickStatus('Active Patient')}>Active Patient</button>
                <button className="danger-action" type="button" onClick={() => quickStatus('Lost')}>Lost</button>
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
      </div>
    </section>
  );
}
