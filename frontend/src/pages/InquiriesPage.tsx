import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Panel } from '../components/Panel';
import { StatusChip } from '../components/StatusChip';
import { api } from '../services/api';
import type { AppConfig, Inquiry, InquirySource, InquiryStatus } from '../types';
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
