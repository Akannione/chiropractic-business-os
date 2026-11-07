import { BarChart3 } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import type { MonthlySummary } from '../types';
import { displayDate, money, percent } from '../utils/format';

export function MonthlySummaryPage({ summary }: { summary: MonthlySummary | null }) {
  if (!summary) {
    return <EmptyState title="No monthly report yet" description="Month-to-date performance will appear once CBOS has enough practice activity." />;
  }

  return (
    <section className="stack">
      <PageHeader
        eyebrow="Owner review"
        title="Monthly Owner Report"
        description="Month-to-date operational summary."
      />
      <div className="summary-card">
        <BarChart3 />
        <div>
          <h3>{displayDate(summary.monthStart)} - {displayDate(summary.monthEnd)}</h3>
          <p>{summary.plainEnglishSummary}</p>
        </div>
      </div>
      <div className="kpi-grid small">
        <KpiCard label="Monthly Patient Inquiries" value={String(summary.totalPatientInquiries)} />
        <KpiCard label="Active Patients" value={String(summary.activePatients)} success />
        <KpiCard label="Follow-Ups Needed" value={String(summary.followUpsNeeded)} warning />
        <KpiCard label="Estimated Opportunity Value" value={money(summary.estimatedTreatmentValue)} help="Potential value, not collected revenue." featured />
        <KpiCard label="Inquiry-to-Patient Rate" value={percent(summary.inquiryToPatientRate)} />
        <KpiCard label="Top Inquiry Source" value={summary.topInquirySource} />
      </div>
    </section>
  );
}
