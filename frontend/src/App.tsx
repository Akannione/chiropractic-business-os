import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarClock, Download, FileText, LayoutDashboard, Plus, RefreshCw, Users } from 'lucide-react';
import { api } from './services/api';
import { AppConfig, Inquiry, InquirySource, InquiryStatus, Kpis, WeeklySummary } from './types';
import { displayDate, money, percent, todayIso } from './utils/format';

type View = 'dashboard' | 'inquiries' | 'summary' | 'exports';

const emptyKpis: Kpis = {
  totalPatientInquiries: 0,
  newThisWeek: 0,
  activePatients: 0,
  followUpsNeeded: 0,
  followUpsNeededPercent: 0,
  overdueFollowUps: 0,
  estimatedTreatmentValue: 0,
  inquiryToPatientRate: 0,
  topInquirySource: 'None',
};

export function App() {
  const [view, setView] = useState<View>('dashboard');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [kpis, setKpis] = useState<Kpis>(emptyKpis);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setError('');
    const [nextConfig, nextInquiries, nextKpis, nextSummary] = await Promise.all([
      api.config(),
      api.inquiries(),
      api.kpis(),
      api.weeklySummary(),
    ]);
    setConfig(nextConfig);
    setInquiries(nextInquiries);
    setKpis(nextKpis);
    setSummary(nextSummary);
  }

  useEffect(() => {
    loadData()
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, []);

  async function refreshWithMessage(nextMessage: string) {
    await loadData();
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(''), 2800);
  }

  const overdue = useMemo(
    () =>
      inquiries.filter(
        (inquiry) =>
          inquiry.status !== 'Lost' &&
          inquiry.next_follow_up_date &&
          inquiry.next_follow_up_date < todayIso(),
      ),
    [inquiries],
  );

  const dueToday = useMemo(
    () =>
      inquiries.filter(
        (inquiry) =>
          inquiry.status !== 'Lost' &&
          inquiry.next_follow_up_date &&
          inquiry.next_follow_up_date === todayIso(),
      ),
    [inquiries],
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">OS</div>
          <div>
            <strong>Chiropractic</strong>
            <span>Business OS</span>
          </div>
        </div>
        <nav>
          <NavButton icon={<LayoutDashboard />} active={view === 'dashboard'} onClick={() => setView('dashboard')}>
            Dashboard
          </NavButton>
          <NavButton icon={<Users />} active={view === 'inquiries'} onClick={() => setView('inquiries')}>
            Patient Inquiries
          </NavButton>
          <NavButton icon={<FileText />} active={view === 'summary'} onClick={() => setView('summary')}>
            Weekly Summary
          </NavButton>
          <NavButton icon={<Download />} active={view === 'exports'} onClick={() => setView('exports')}>
            Exports
          </NavButton>
        </nav>
        {config?.demoMode && (
          <button
            className="ghost-button"
            onClick={async () => {
              await api.resetDemo();
              await refreshWithMessage('Demo data reset.');
            }}
          >
            <RefreshCw size={16} /> Reset demo data
          </button>
        )}
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h1>Chiropractic Business OS</h1>
            <p>Track patient inquiries, follow-ups, active patients, and estimated treatment value.</p>
          </div>
          <button className="primary-button" onClick={() => setView('inquiries')}>
            <Plus size={18} /> Add Inquiry
          </button>
        </header>

        {message && <div className="notice success">{message}</div>}
        {error && <div className="notice error">{error}</div>}
        {loading ? (
          <div className="empty-state">Loading practice dashboard...</div>
        ) : (
          <>
            {view === 'dashboard' && (
              <Dashboard kpis={kpis} config={config} inquiries={inquiries} overdue={overdue} dueToday={dueToday} />
            )}
            {view === 'inquiries' && (
              <Inquiries
                config={config}
                inquiries={inquiries}
                onChanged={refreshWithMessage}
                setError={setError}
              />
            )}
            {view === 'summary' && <WeeklySummaryPanel summary={summary} />}
            {view === 'exports' && <ExportsPanel inquiries={inquiries} />}
          </>
        )}
      </main>
    </div>
  );
}

function NavButton({
  icon,
  active,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

function Dashboard({
  kpis,
  config,
  inquiries,
  overdue,
  dueToday,
}: {
  kpis: Kpis;
  config: AppConfig | null;
  inquiries: Inquiry[];
  overdue: Inquiry[];
  dueToday: Inquiry[];
}) {
  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Practice Performance Dashboard</h2>
        <p>See the most important follow-up and patient inquiry signals in under 30 seconds.</p>
      </div>
      <div className="kpi-grid">
        <KpiCard label="Estimated Treatment Value" value={money(kpis.estimatedTreatmentValue)} help={config?.kpiHelp.estimatedTreatmentValue} featured />
        <KpiCard label="Follow-Ups Needed" value={String(kpis.followUpsNeeded)} help={config?.kpiHelp.followUpsNeeded} warning />
        <KpiCard label="Active Patients" value={String(kpis.activePatients)} help={config?.kpiHelp.activePatients} success />
        <KpiCard label="Inquiry-to-Patient Rate" value={percent(kpis.inquiryToPatientRate)} help={config?.kpiHelp.conversionRate} />
        <KpiCard label="New This Week" value={String(kpis.newThisWeek)} help={config?.kpiHelp.newThisWeek} />
        <KpiCard label="Top Inquiry Source" value={kpis.topInquirySource} help={config?.kpiHelp.topInquirySource} />
      </div>

      <div className="dashboard-grid">
        <Panel title="Recent Patient Inquiries" description="Latest inquiry activity and current status.">
          <InquiryTable inquiries={inquiries.slice(0, 8)} compact />
        </Panel>
        <Panel title="Follow-Up Focus" description="Overdue and due-today follow-ups to handle first.">
          <FollowUpList title="Overdue" inquiries={overdue} variant="danger" />
          <FollowUpList title="Due Today" inquiries={dueToday} variant="warning" />
        </Panel>
      </div>
    </section>
  );
}

function KpiCard({
  label,
  value,
  help,
  featured,
  warning,
  success,
}: {
  label: string;
  value: string;
  help?: string;
  featured?: boolean;
  warning?: boolean;
  success?: boolean;
}) {
  return (
    <article className={`kpi-card ${featured ? 'featured' : ''} ${warning ? 'warning' : ''} ${success ? 'success' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{help}</small>
    </article>
  );
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

function InquiryTable({ inquiries, compact = false }: { inquiries: Inquiry[]; compact?: boolean }) {
  if (!inquiries.length) return <div className="empty-state">No patient inquiries yet.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Requested Service</th>
            <th>Status</th>
            {!compact && <th>Source</th>}
            <th>Value</th>
            <th>Next Follow-Up</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id}>
              <td>
                <strong>{inquiry.name}</strong>
                <span>{inquiry.email}</span>
              </td>
              <td>{inquiry.service_needed}</td>
              <td>
                <StatusChip status={inquiry.status} />
              </td>
              {!compact && <td>{inquiry.source}</td>}
              <td>{money(inquiry.estimated_value)}</td>
              <td>{displayDate(inquiry.next_follow_up_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusChip({ status }: { status: InquiryStatus }) {
  return <span className={`status-chip ${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>;
}

function FollowUpList({ title, inquiries, variant }: { title: string; inquiries: Inquiry[]; variant: string }) {
  return (
    <div className="followup-block">
      <h4>{title}</h4>
      {inquiries.length ? (
        inquiries.slice(0, 6).map((inquiry) => (
          <div className={`followup-row ${variant}`} key={inquiry.id}>
            <CalendarClock size={16} />
            <div>
              <strong>{inquiry.name}</strong>
              <span>
                {inquiry.service_needed} · {displayDate(inquiry.next_follow_up_date)}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-inline">No follow-ups in this group.</div>
      )}
    </div>
  );
}

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

function Inquiries({
  config,
  inquiries,
  onChanged,
  setError,
}: {
  config: AppConfig | null;
  inquiries: Inquiry[];
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
}) {
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

  async function submit(event: React.FormEvent) {
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
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              Requested Service
              <input value={form.service_needed} onChange={(e) => setForm({ ...form, service_needed: e.target.value })} list="services" required />
              <datalist id="services">{config?.services.map((service) => <option value={service} key={service} />)}</datalist>
            </label>
            <label>
              Inquiry Source
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as InquirySource })}>
                {config?.sources.map((source) => <option key={source}>{source}</option>)}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InquiryStatus })}>
                {config?.statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label>
              Estimated Treatment Value
              <input type="number" min="0" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: Number(e.target.value) })} />
            </label>
            <label>
              Next Follow-Up
              <input type="date" value={form.next_follow_up_date} onChange={(e) => setForm({ ...form, next_follow_up_date: e.target.value })} />
            </label>
            <label className="full">
              Notes
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
            <button className="primary-button full" type="submit">Add Inquiry</button>
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
                      <select value={inquiry.status} onChange={(e) => updateStatus(inquiry, e.target.value as InquiryStatus)}>
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

function WeeklySummaryPanel({ summary }: { summary: WeeklySummary | null }) {
  if (!summary) return <div className="empty-state">No weekly data yet.</div>;
  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Weekly Practice Summary</h2>
        <p>Owner-ready snapshot for inquiry activity, follow-up pressure, and treatment value.</p>
      </div>
      <div className="summary-card">
        <Activity />
        <div>
          <h3>
            Week of {displayDate(summary.weekStart)} - {displayDate(summary.weekEnd)}
          </h3>
          <p>{summary.plainEnglishSummary}</p>
        </div>
      </div>
      <div className="kpi-grid small">
        <KpiCard label="Total Patient Inquiries" value={String(summary.totalPatientInquiries)} />
        <KpiCard label="New This Week" value={String(summary.newThisWeek)} />
        <KpiCard label="Follow-Ups Needed" value={String(summary.followUpsNeeded)} warning />
        <KpiCard label="Estimated Treatment Value" value={money(summary.estimatedTreatmentValue)} featured />
      </div>
    </section>
  );
}

function ExportsPanel({ inquiries }: { inquiries: Inquiry[] }) {
  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Exports</h2>
        <p>Download practice-facing CSV files for review, backup, or handoff.</p>
      </div>
      <div className="export-card">
        <Download />
        <div>
          <h3>Patient Inquiries CSV</h3>
          <p>{inquiries.length ? `${inquiries.length} patient inquiries ready to export.` : 'No export data yet.'}</p>
        </div>
        <a className="primary-button" href={api.exportUrl}>Download CSV</a>
      </div>
    </section>
  );
}
