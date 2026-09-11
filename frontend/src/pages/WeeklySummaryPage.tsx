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
  if (!summary) {
    return (
      <section className="stack">
        <div className="section-heading">
          <h2>Weekly Owner Review</h2>
          <p>A simple weekly rhythm for reviewing inquiries, follow-ups, and patient conversion.</p>
        </div>
        <div className="empty-state">No weekly data yet. Add patient inquiries to build the review.</div>
      </section>
    );
  }

  const summaryText = buildSummaryText(summary);
  const downloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(summaryText)}`;
  const needsAttention = summary.followUpsNeeded > 0 || summary.overdueFollowUps > 0;

  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Weekly Owner Review</h2>
        <p>Use this once a week to check inquiry activity, follow-up pressure, and treatment value.</p>
      </div>
      <div className={`summary-card owner-review-card ${needsAttention ? 'attention' : 'clear'}`}>
        <Activity />
        <div>
          <h3>
            Week of {displayDate(summary.weekStart)} - {displayDate(summary.weekEnd)}
          </h3>
          <p>{summary.plainEnglishSummary}</p>
        </div>
      </div>
      <div className="owner-review-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Owner Action Plan</h3>
            <p>What to look at before the week ends.</p>
          </div>
          <div className="review-action-list">
            <div className={summary.overdueFollowUps ? 'review-action urgent' : 'review-action'}>
              <strong>{summary.overdueFollowUps ? 'Call overdue patients first' : 'No overdue follow-ups'}</strong>
              <span>
                {summary.overdueFollowUps
                  ? `${summary.overdueFollowUps} follow-up${summary.overdueFollowUps === 1 ? '' : 's'} are past due.`
                  : 'The urgent follow-up queue is clear.'}
              </span>
            </div>
            <div className={summary.followUpsNeeded ? 'review-action warning' : 'review-action'}>
              <strong>{summary.followUpsNeeded ? 'Work the follow-up queue' : 'Follow-up queue is clear'}</strong>
              <span>
                {summary.followUpsNeeded
                  ? `${summary.followUpsNeeded} patient inquir${summary.followUpsNeeded === 1 ? 'y' : 'ies'} need a next action.`
                  : 'No patient inquiries are marked as needing follow-up.'}
              </span>
            </div>
            <div className="review-action">
              <strong>Check new inquiry sources</strong>
              <span>{summary.topInquirySource} is currently the top inquiry source.</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h3>Weekly Review Checklist</h3>
            <p>A simple agenda for a front-desk or owner review.</p>
          </div>
          <ul className="checklist">
            <li>Review overdue follow-ups.</li>
            <li>Confirm every new inquiry has a next step.</li>
            <li>Update patients who scheduled or became active.</li>
            <li>Export the inquiry list if the owner wants a backup.</li>
          </ul>
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
        <KpiCard label="Total Patient Inquiries" value={String(summary.totalPatientInquiries)} help="All patient inquiries currently tracked." />
        <KpiCard label="New This Week" value={String(summary.newThisWeek)} help="New patient inquiries created since Monday." />
        <KpiCard label="Active Patients" value={String(summary.activePatients)} help="Patient inquiries currently marked Active Patient." success />
        <KpiCard label="Follow-Ups Needed" value={String(summary.followUpsNeeded)} help="Patients marked Follow-Up Needed or due today/past due." warning />
        <KpiCard label="Overdue Follow-Ups" value={String(summary.overdueFollowUps)} help="Follow-ups with a date before today." warning />
        <KpiCard label="Estimated Treatment Value" value={money(summary.estimatedTreatmentValue)} help="Potential treatment revenue from inquiries not marked Lost." featured />
        <KpiCard label="Inquiry-to-Patient Rate" value={percent(summary.inquiryToPatientRate)} help="The share of inquiries currently marked Active Patient." />
        <KpiCard label="Top Inquiry Source" value={summary.topInquirySource} help="The source generating the most inquiries." />
      </div>
    </section>
  );
}
