import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import type { Kpis } from '../types';
import { money, percent } from '../utils/format';

/** Read-only operational snapshot using the same validated KPIs as owner reporting. */
export function PerformancePage({ kpis }: { kpis: Kpis }) {
  return (
    <section className="stack workspace-page performance-workspace">
      <PageHeader eyebrow="Owner performance" title="Practice Performance" description="A quick view of your inquiry and follow-up results." />
      <div className="kpi-grid small">
        <KpiCard label="Total Patient Inquiries" value={String(kpis.totalPatientInquiries)} help="All inquiries currently tracked, not a weekly count." />
        <KpiCard label="Active Patients" value={String(kpis.activePatients)} help="Inquiries marked Active Patient." success />
        <KpiCard label="Inquiry-to-Patient Rate" value={percent(kpis.inquiryToPatientRate)} help="Share of all tracked inquiries marked Active Patient." />
        <KpiCard label="Overdue Follow-Ups" value={String(kpis.overdueFollowUps)} help="Follow-ups past their recorded date. Lost inquiries excluded." warning />
        <KpiCard label="Follow-Ups Needed" value={String(kpis.followUpsNeeded)} help="Records flagged or scheduled for follow-up." warning />
        <KpiCard label="New This Week" value={String(kpis.newThisWeek)} help="Inquiries created since the current practice week began." />
        <KpiCard label="Top Inquiry Source" value={kpis.topInquirySource} help="Most frequent source in the currently tracked records." />
        <KpiCard label="Estimated Opportunity Value" value={money(kpis.estimatedTreatmentValue)} help="Potential treatment value of non-Lost inquiries. Not earned or collected revenue." featured />
      </div>
      <section className="panel performance-next-step">
        <h3>Where to focus</h3>
        <p>
          {kpis.overdueFollowUps
            ? String(kpis.overdueFollowUps) + ' overdue follow-up' + (kpis.overdueFollowUps === 1 ? '' : 's') + ' need attention before reviewing overall conversion.'
            : 'Your overdue follow-up queue is clear. Review the latest inquiry outcomes and sources.'}
        </p>
        <div className="summary-actions">
          <a className="report-switch-link" href="/">Work follow-ups</a>
          <a className="report-switch-link" href="/owner-review">Read weekly report</a>
        </div>
      </section>
    </section>
  );
}
