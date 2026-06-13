import { BarChart3 } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import type { MonthlySummary } from '../types';
import { displayDate, money, percent } from '../utils/format';

export function MonthlySummaryPage({ summary }: { summary: MonthlySummary | null }) {
  if (!summary) return <div className="empty-state">No monthly data yet.</div>;

  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Monthly Owner Report</h2>
        <p>A simple month-to-date view of inquiries, patient conversion, follow-up pressure, and treatment value.</p>
      </div>
      <div className="summary-card">
        <BarChart3 />
        <div>
          <h3>
            {displayDate(summary.monthStart)} - {displayDate(summary.monthEnd)}
          </h3>
          <p>{summary.plainEnglishSummary}</p>
        </div>
      </div>
      <div className="kpi-grid small">
        <KpiCard label="Monthly Patient Inquiries" value={String(summary.totalPatientInquiries)} />
        <KpiCard label="Active Patients" value={String(summary.activePatients)} success />
        <KpiCard label="Follow-Ups Needed" value={String(summary.followUpsNeeded)} warning />
        <KpiCard label="Estimated Treatment Value" value={money(summary.estimatedTreatmentValue)} featured />
        <KpiCard label="Inquiry-to-Patient Rate" value={percent(summary.inquiryToPatientRate)} />
        <KpiCard label="Top Inquiry Source" value={summary.topInquirySource} />
      </div>
    </section>
  );
}
