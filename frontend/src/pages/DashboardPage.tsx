import { useMemo } from 'react';
import { FollowUpList } from '../components/FollowUpList';
import { InquiryTable } from '../components/InquiryTable';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import { StatusChip } from '../components/StatusChip';
import { api } from '../services/api';
import type { AppConfig, Inquiry, InquiryStatus, Kpis } from '../types';
import { addDaysIso, displayDate, money, percent, todayIso } from '../utils/format';

type DashboardPageProps = {
  kpis: Kpis;
  config: AppConfig | null;
  inquiries: Inquiry[];
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

export function DashboardPage({ kpis, config, inquiries, onChanged, setError }: DashboardPageProps) {
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

  const todayQueue = useMemo(
    () =>
      inquiries
        .filter(
          (inquiry) =>
            inquiry.status !== 'Lost' &&
            (inquiry.status === 'Follow-Up Needed' ||
              Boolean(inquiry.next_follow_up_date && inquiry.next_follow_up_date <= todayIso())),
        )
        .slice(0, 6),
    [inquiries],
  );

  async function updateWorkflow(inquiry: Inquiry, status: InquiryStatus, nextFollowUpDate = inquiry.next_follow_up_date) {
    setError('');
    try {
      await api.updateInquiry(inquiry.id, {
        status,
        next_follow_up_date: nextFollowUpDate,
        notes: inquiry.notes,
      });
      await onChanged(`${inquiry.name} moved to ${status}.`);
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Practice Performance Dashboard</h2>
        <p>See the most important follow-up and patient inquiry signals in under 30 seconds.</p>
      </div>
      <div className="kpi-grid">
        <KpiCard
          label="Estimated Treatment Value"
          value={money(kpis.estimatedTreatmentValue)}
          help={config?.kpiHelp.estimatedTreatmentValue}
          featured
        />
        <KpiCard label="Follow-Ups Needed" value={String(kpis.followUpsNeeded)} help={config?.kpiHelp.followUpsNeeded} warning />
        <KpiCard label="Active Patients" value={String(kpis.activePatients)} help={config?.kpiHelp.activePatients} success />
        <KpiCard label="Inquiry-to-Patient Rate" value={percent(kpis.inquiryToPatientRate)} help={config?.kpiHelp.conversionRate} />
        <KpiCard label="New This Week" value={String(kpis.newThisWeek)} help={config?.kpiHelp.newThisWeek} />
        <KpiCard label="Top Inquiry Source" value={kpis.topInquirySource} help={config?.kpiHelp.topInquirySource} />
      </div>

      <div className="dashboard-grid">
        <Panel
          title="Today's Follow-Up Workflow"
          description="Handle the most urgent patient inquiries first, then move them forward with one click."
        >
          {todayQueue.length ? (
            <div className="workflow-list">
              {todayQueue.map((inquiry) => (
                <div className="workflow-item" key={inquiry.id}>
                  <div>
                    <strong>{inquiry.name}</strong>
                    <span>{inquiry.service_needed}</span>
                    <small>
                      Follow-up: {displayDate(inquiry.next_follow_up_date)} · {inquiry.phone}
                    </small>
                  </div>
                  <StatusChip status={inquiry.status} />
                  <div className="workflow-actions">
                    <button type="button" onClick={() => updateWorkflow(inquiry, 'Consultation Scheduled', addDaysIso(1))}>
                      Scheduled
                    </button>
                    <button type="button" onClick={() => updateWorkflow(inquiry, 'Active Patient', '')}>
                      Active
                    </button>
                    <button type="button" onClick={() => updateWorkflow(inquiry, 'Follow-Up Needed', addDaysIso(1))}>
                      Tomorrow
                    </button>
                    <button type="button" onClick={() => updateWorkflow(inquiry, 'Lost', '')}>
                      Lost
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No urgent follow-ups due right now.</div>
          )}
        </Panel>
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
