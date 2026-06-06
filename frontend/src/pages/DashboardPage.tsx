import { useMemo } from 'react';
import { FollowUpList } from '../components/FollowUpList';
import { InquiryTable } from '../components/InquiryTable';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import type { AppConfig, Inquiry, Kpis } from '../types';
import { money, percent, todayIso } from '../utils/format';

type DashboardPageProps = {
  kpis: Kpis;
  config: AppConfig | null;
  inquiries: Inquiry[];
};

export function DashboardPage({ kpis, config, inquiries }: DashboardPageProps) {
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
