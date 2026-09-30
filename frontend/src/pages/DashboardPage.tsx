import { useMemo } from 'react';
import { ArrowRight, CalendarClock, CheckCircle2, Sparkles, TrendingUp, UsersRound } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { InquiryTable } from '../components/InquiryTable';
import { DataFreshness } from '../components/DataFreshness';
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
  const overdue = useMemo(() => followUps.filter((item) => item.next_follow_up_date && item.next_follow_up_date < todayIso()), [followUps]);
  const dueToday = useMemo(() => followUps.filter((item) => item.next_follow_up_date === todayIso()), [followUps]);
  const todayQueue = useMemo(() => followUps.slice(0, 5), [followUps]);

  const dashboardFocus = useMemo(() => {
    if (kpis.overdueFollowUps > 0) return { title: `${kpis.overdueFollowUps} follow-up${kpis.overdueFollowUps === 1 ? '' : 's'} need you`, detail: 'Start with the people who have already waited past their follow-up date.', tone: 'urgent' };
    if (dueToday.length > 0) return { title: `${dueToday.length} follow-up${dueToday.length === 1 ? '' : 's'} due today`, detail: "Clear today's queue before working future opportunities.", tone: 'today' };
    if (kpis.followUpsNeeded > 0) return { title: `${kpis.followUpsNeeded} patient inquir${kpis.followUpsNeeded === 1 ? 'y' : 'ies'} ready for follow-up`, detail: 'Your queue is active and nothing is overdue.', tone: 'steady' };
    return { title: 'You are caught up', detail: 'New inquiries and future follow-ups will surface here when they need attention.', tone: 'clear' };
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
    <section className="stack today-workspace">
      <div className="today-welcome">
        <div><span className="eyebrow">Front desk command center</span><h2>Good to see you.</h2><p>Your practice, distilled into the few things worth your attention.</p></div>
        <DataFreshness />
      </div>

      <section className={`today-hero ${dashboardFocus.tone}`}>
        <div className="ambient-orb orb-one" aria-hidden="true" />
        <div className="ambient-orb orb-two" aria-hidden="true" />
        <div className="today-hero-copy">
          <span className="hero-kicker"><Sparkles size={14} /> CBOS Focus</span>
          <h3>{dashboardFocus.title}</h3>
          <p>{dashboardFocus.detail}</p>
          {todayQueue.length > 0 && <a className="hero-action" href="#today-actions">Start with next action <ArrowRight size={16} /></a>}
        </div>
        <div className="today-glance" aria-label="Practice at a glance">
          <div><span>Overdue</span><strong>{kpis.overdueFollowUps}</strong><small>needs attention</small></div>
          <div><span>Today</span><strong>{dueToday.length}</strong><small>due now</small></div>
          <div className="glance-value"><span>Opportunity</span><strong>{money(kpis.estimatedTreatmentValue)}</strong><small>estimated value</small></div>
        </div>
      </section>

      <div className="insight-strip" aria-label="Practice highlights">
        <article><span className="insight-icon green"><TrendingUp size={18} /></span><div><small>Conversion</small><strong>{percent(kpis.inquiryToPatientRate)}</strong><p>Inquiry to active patient</p></div></article>
        <article><span className="insight-icon blue"><UsersRound size={18} /></span><div><small>Active patients</small><strong>{kpis.activePatients}</strong><p>{kpis.totalPatientInquiries} total inquiries</p></div></article>
        <article><span className="insight-icon amber"><CalendarClock size={18} /></span><div><small>New this week</small><strong>{kpis.newThisWeek}</strong><p>Top source: {kpis.topInquirySource}</p></div></article>
      </div>
      <div className="today-layout" id="today-actions">
        <section className="glass-panel action-queue-panel">
          <div className="panel-heading modern-heading">
            <div><span className="eyebrow">Priority queue</span><h3>Next actions</h3><p>One clear decision at a time. Handle the first item and keep moving.</p></div>
            <span className="queue-count">{todayQueue.length}</span>
          </div>
          {todayQueue.length ? (
            <div className="modern-action-list">
              {todayQueue.map((inquiry, index) => {
                const timing = followUpTiming(inquiry.next_follow_up_date);
                return (
                  <article className={`modern-action-card ${timing.className}`} key={inquiry.id}>
                    <span className="action-index">{index + 1}</span>
                    <div className="action-person">
                      <strong>{inquiry.name}</strong>
                      <span>{inquiry.service_needed}</span>
                      <small>{displayDate(inquiry.next_follow_up_date)} · {inquiry.phone}</small>
                    </div>
                    <div className="action-state"><span className={`urgency-label ${timing.className}`}>{timing.label}</span><StatusChip status={inquiry.status} /></div>
                    <div className="action-buttons">
                      <button className="action-primary" type="button" onClick={() => updateWorkflow(inquiry, 'Consultation Scheduled', addDaysIso(1))}>Scheduled</button>
                      <button type="button" onClick={() => updateWorkflow(inquiry, 'Active Patient', '')}><CheckCircle2 size={14} /> Active</button>
                      <button type="button" onClick={() => updateWorkflow(inquiry, 'Follow-Up Needed', addDaysIso(1))}>Tomorrow</button>
                      <button className="quiet-danger" type="button" onClick={() => updateWorkflow(inquiry, 'Lost', '')}>Lost</button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <EmptyState title="Nothing urgent right now" description="Your immediate follow-up queue is clear. CBOS will surface the next item when it needs attention." />}
        </section>

        <aside className="today-side-stack">
          <section className="glass-panel pulse-card">
            <span className="eyebrow">Practice pulse</span>
            <h3>{kpis.followUpsNeeded ? 'There is work to recover.' : 'Your queue is healthy.'}</h3>
            <p>{kpis.followUpsNeeded ? `${kpis.followUpsNeeded} follow-ups represent ${money(kpis.estimatedTreatmentValue)} in estimated opportunity.` : 'No immediate follow-up pressure is showing in CBOS.'}</p>
            <div className="pulse-meter"><span style={{ width: `${Math.min(100, kpis.followUpsNeeded * 12)}%` }} /></div>
            <small>Operational signal, not a clinical recommendation.</small>
          </section>

          <section className="glass-panel recent-card">
            <div className="panel-heading modern-heading"><div><span className="eyebrow">Latest</span><h3>Recent inquiries</h3></div></div>
            <InquiryTable inquiries={recentInquiries.slice(0, 4)} compact />
          </section>
        </aside>
      </div>
    </section>
  );
}
