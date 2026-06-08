import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../services/api';
import type { AppConfig, InquirySource, PublicInquiryInput } from '../types';

type PublicInquiryPageProps = {
  config?: AppConfig | null;
};

const allowedSources = new Set<InquirySource>(['Google', 'Referral', 'Insurance', 'Website', 'Phone Call']);

function getSourceFromUrl(): InquirySource {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source') as InquirySource | null;
  return source && allowedSources.has(source) ? source : 'Website';
}

export function PublicInquiryPage({ config }: PublicInquiryPageProps) {
  const source = useMemo(() => getSourceFromUrl(), []);
  const [pageConfig, setPageConfig] = useState<AppConfig | null>(config || null);
  const [form, setForm] = useState<PublicInquiryInput>({
    name: '',
    phone: '',
    email: '',
    service_needed: config?.services[0] || 'Spinal Adjustment',
    source,
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (pageConfig) return;
    api.config()
      .then(setPageConfig)
      .catch((nextError: Error) => setError(nextError.message));
  }, [pageConfig]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await api.createPublicInquiry(form);
      setMessage('Your inquiry was received. The practice team will follow up soon.');
      setForm({
        name: '',
        phone: '',
        email: '',
        service_needed: pageConfig?.services[0] || 'Spinal Adjustment',
        source,
        notes: '',
      });
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="public-page">
      <section className="public-card">
        <div className="section-heading">
          <span className="eyebrow">Chiropractic Business OS</span>
          <h1>Request a Chiropractic Follow-Up</h1>
          <p>
            Share your contact information and requested service. The practice team will receive your inquiry
            automatically and follow up as soon as possible.
          </p>
        </div>

        {message && <div className="notice success">{message}</div>}
        {error && <div className="notice error">{error}</div>}

        <form className="inquiry-form public-form" onSubmit={submit}>
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
              list="public-services"
              required
            />
            <datalist id="public-services">
              {pageConfig?.services.map((service) => <option value={service} key={service} />)}
            </datalist>
          </label>
          <label className="full">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Briefly describe the reason for your inquiry."
            />
          </label>
          <input type="hidden" value={form.source} />
          <button className="primary-button full" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Inquiry'}
          </button>
        </form>

        <p className="public-footnote">
          Source: {source}. This form does not schedule an appointment or replace clinical advice.
        </p>
      </section>
    </main>
  );
}
