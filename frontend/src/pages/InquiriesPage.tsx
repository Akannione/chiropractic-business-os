import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel } from '../components/Panel';
import { api } from '../services/api';
import type { AppConfig, Inquiry, InquirySource, InquiryStatus } from '../types';
import { money, todayIso } from '../utils/format';

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

type InquiriesPageProps = {
  config: AppConfig | null;
  inquiries: Inquiry[];
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

export function InquiriesPage({ config, inquiries, onChanged, setError }: InquiriesPageProps) {
  const [form, setForm] = useState<InquiryFormState>({
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

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await api.createInquiry(form);
      setForm({ ...form, name: '', phone: '', email: '', notes: '' });
      await onChanged('Patient inquiry added.');
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  async function updateStatus(inquiry: Inquiry, status: InquiryStatus) {
    setError('');
    try {
      await api.updateInquiry(inquiry.id, {
        status,
        notes: inquiry.notes,
        next_follow_up_date: inquiry.next_follow_up_date,
      });
      await onChanged('Patient inquiry updated.');
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Patient Inquiries</h2>
        <p>Add new patient inquiries and keep status, notes, and follow-up timing visible.</p>
      </div>
      <div className="form-grid">
        <Panel title="Add Patient Inquiry" description="Required fields are patient name, phone, email, and requested service.">
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
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
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
        <Panel title="Inquiry List" description="Use the quick status selector during demos or daily practice review.">
          <div className="table-wrap">
            <table>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td>
                      <strong>{inquiry.name}</strong>
                      <span>{inquiry.service_needed}</span>
                    </td>
                    <td>{money(inquiry.estimated_value)}</td>
                    <td>
                      <select value={inquiry.status} onChange={(event) => updateStatus(inquiry, event.target.value as InquiryStatus)}>
                        {config?.statuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </section>
  );
}
