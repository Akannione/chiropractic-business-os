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
  recentInquiries: Inquiry[];
  followUps: Inquiry[];
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

function followUpTiming(nextFollowUpDate: string) {
  if (!nextFollowUpDate) return { label: 'No follow-up date', className: 'neutral' };
  const today = todayIso();
  if (nextFollowUpDate < today) return { label: 'Overdue', className: 'overdue' };
  if (nextFollowUpDate === today) return { label: 'Due today', className: 'due-today' };
  return { label: 'Upcoming', className: 'upcoming' };
}

export function DashboardPage({ kpis, config, recentInquiries, followUps, onChanged, setError }: DashboardPageProps) {
  const overdue = useMemo(
    () => followUps.filter((inquiry) => inquiry.next_follow_up_date && inquiry.next_follow_up_date < todayIso()),
    [followUps],
  );
  const dueToday = useMemo(
    () => followUps.filter((inquiry) => inquiry.next_follow_up_date && inquiry.next_follow_up_date === todayIso()),
    [followUps],
  );
  const todayQueue = useMemo(() => followUps.slice(0, 6), [followUps]);

  const dashboardFocus = useMemo(() => {
    if (kpis.overdueFollowUps > 0) {
      return {
        title: `${kpis.overdueFollowUps} overdue follow-up${kpis.overdueFollowUps === 1 ? '' : 's'} need attention`,
        detail: 'Start with opportunities whose follow-up date has already passed.',
        tone: 'urgent',
      };
    }
    if (dueToday.length > 0) {
      return {
        title: `${dueToday.length} follow-up${dueToday.length === 1 ? '' : 's'} due today`,
        detail: "Clear today's action queue before working future follow-ups.",
        tone: 'today',
      };
    }
    if (kpis.followUpsNeeded > 0) {
      return {
        title: `${kpis.followUpsNeeded} patient inquir${kpis.followUpsNeeded === 1 ? 'y' : 'ies'} need follow-up`,
        detail: 'Your action queue is active, but nothing is overdue right now.',
        tone: 'steady',
      };
    }
    return {
      title: 'Your immediate follow-up queue is clear',
      detail: 'New inquiries and future follow-ups will surface here when they need attention.',
      tone: 'clear',
    };
  }, [dueToday.length, kpis.followUpsNeeded, kpis.overdueFollowUps]);

  async function updateWorkflow(inquiry: Inquiry, status: InquiryStatus, nextFollowUpDate = inquiry.next_follow_up_date) {
    setError('');
    try {
      await api.updateInquiry(inquiry.id, { status, next_follow_up_date: nextFollowUpDate, notes: inquiry.notes });
      await onChanged(`${inquiry.name} moved to ${status}.`);
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <span className="eyebrow">Action Command Center</span>
        <h2>What needs attention today</h2>
        <p>CBOS surfaces missed follow-ups and opportunities so your team knows what to act on next.</p>
      </div>

      <div className={`command-panel ${dashboardFocus.tone}`}>
        <div>
          <span className="eyebrow">Highest priority</span>
          <h3>{dashboardFocus.title}</h3>
          <p>{dashboardFocus.detail}</p>
        </div>
        <div className="focus-metrics" aria-label="Today action focus">
          <div className="mini-metric urgent"><span>Overdue</span><strong>{kpis.overdueFollowUps}</strong></div>
          <div className="mini-metric today"><span>Due Today</span><strong>{dueToday.length}</strong></div>
          <div className="mini-metric value"><span>Opportunity Value</span><strong>{money(kpis.estimatedTreatmentValue)}</strong></div>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard label="Estimated Opportunity Value" value={money(kpis.estimatedTreatmentValue)} help={config?.kpiHelp.estimatedTreatmentValue} featured />
        <KpiCard label="Follow-Ups Needing Action" value={String(kpis.followUpsNeeded)} help={config?.kpiHelp.followUpsNeeded} warning />
        <KpiCard label="Overdue Follow-Ups" value={String(kpis.overdueFollowUps)} help={config?.kpiHelp.overdueFollowUps} warning />
        <KpiCard label="Active Patients" value={String(kpis.activePatients)} help={config?.kpiHelp.activePatients} success />
        <KpiCard label="Inquiry-to-Patient Rate" value={percent(kpis.inquiryToPatientRate)} help={config?.kpiHelp.conversionRate} />
        <KpiCard label="Total Patient Inquiries" value={String(kpis.totalPatientInquiries)} help="All patient inquiries currently stored in CBOS." />
        <KpiCard label="New This Week" value={String(kpis.newThisWeek)} help={config?.kpiHelp.newThisWeek} />
        <KpiCard label="Top Inquiry Source" value={kpis.topInquirySource} help={config?.kpiHelp.topInquirySource} />
      </div>

      <div className="dashboard-grid">
        <Panel title="Next Actions" description="Handle the most urgent opportunities first, then move them forward with one click.">
          {todayQueue.length ? (
            <div className="workflow-list">
              {todayQueue.map((inquiry) => {
                const timing = followUpTiming(inquiry.next_follow_up_date);
                return (
                  <div className={`workflow-item ${timing.className}`} key={inquiry.id}>
                    <div>
                      <strong>{inquiry.name}</strong>
                      <span>{inquiry.service_needed}</span>
                      {inquiry.activity_context && <small>{inquiry.activity_context}</small>}
                      <small>Follow-up: {displayDate(inquiry.next_follow_up_date)} · {inquiry.phone}</small>
                    </div>
                    <div className="workflow-status">
                      <span className={`urgency-label ${timing.className}`}>{timing.label}</span>
                      <StatusChip status={inquiry.status} />
                    </div>
                    <div className="workflow-actions" aria-label={`Update ${inquiry.name}`}>
                      <button type="button" onClick={() => updateWorkflow(inquiry, 'Consultation Scheduled', addDaysIso(1))}>Scheduled</button>
                      <button className="success-action" type="button" onClick={() => updateWorkflow(inquiry, 'Active Patient', '')}>Active</button>
                      <button type="button" onClick={() => updateWorkflow(inquiry, 'Follow-Up Needed', addDaysIso(1))}>Tomorrow</button>
                      <button className="danger-action" type="button" onClick={() => updateWorkflow(inquiry, 'Lost', '')}>Lost</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="empty-state">No urgent follow-ups due right now.</div>}
        </Panel>
        <Panel title="Recent Patient Inquiries" description="Supporting context for the latest inquiry activity.">
          <InquiryTable inquiries={recentInquiries} compact />
        </Panel>
        <Panel title="Attention Queue" description="Overdue and due-today work that should be handled first.">
          <FollowUpList title="Overdue" inquiries={overdue} variant="danger" />
          <FollowUpList title="Due Today" inquiries={dueToday} variant="warning" />
        </Panel>
      </div>
    </section>
  );
}
