import { Activity } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import type { WeeklySummary } from '../types';
import { displayDate, money } from '../utils/format';

export function WeeklySummaryPage({ summary }: { summary: WeeklySummary | null }) {
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
