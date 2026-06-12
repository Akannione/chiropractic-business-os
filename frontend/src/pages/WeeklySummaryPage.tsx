import { Activity } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import type { WeeklySummary } from '../types';
import { displayDate, money, percent } from '../utils/format';

function buildSummaryText(summary: WeeklySummary) {
  return [
    'Weekly Practice Summary',
    `Week: ${displayDate(summary.weekStart)} - ${displayDate(summary.weekEnd)}`,
    '',
    `Total Patient Inquiries: ${summary.totalPatientInquiries}`,
    `New This Week: ${summary.newThisWeek}`,
    `Active Patients: ${summary.activePatients}`,
    `Follow-Ups Needed: ${summary.followUpsNeeded}`,
    `Overdue Follow-Ups: ${summary.overdueFollowUps}`,
    `Estimated Treatment Value: ${money(summary.estimatedTreatmentValue)}`,
    `Inquiry-to-Patient Rate: ${percent(summary.inquiryToPatientRate)}`,
    `Top Inquiry Source: ${summary.topInquirySource}`,
    '',
    summary.plainEnglishSummary,
  ].join('\n');
}

export function WeeklySummaryPage({ summary }: { summary: WeeklySummary | null }) {
  if (!summary) return <div className="empty-state">No weekly data yet.</div>;

  const summaryText = buildSummaryText(summary);
  const downloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(summaryText)}`;

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
      <div className="summary-actions">
        <button type="button" onClick={() => window.print()}>
          Print Summary
        </button>
        <a href={downloadHref} download={`weekly_practice_summary_${summary.weekStart}.txt`}>
          Download Text Summary
        </a>
      </div>
      <div className="kpi-grid small">
        <KpiCard label="Total Patient Inquiries" value={String(summary.totalPatientInquiries)} />
        <KpiCard label="New This Week" value={String(summary.newThisWeek)} />
        <KpiCard label="Active Patients" value={String(summary.activePatients)} success />
        <KpiCard label="Follow-Ups Needed" value={String(summary.followUpsNeeded)} warning />
        <KpiCard label="Overdue Follow-Ups" value={String(summary.overdueFollowUps)} warning />
        <KpiCard label="Estimated Treatment Value" value={money(summary.estimatedTreatmentValue)} featured />
        <KpiCard label="Inquiry-to-Patient Rate" value={percent(summary.inquiryToPatientRate)} />
        <KpiCard label="Top Inquiry Source" value={summary.topInquirySource} />
      </div>
    </section>
  );
}
