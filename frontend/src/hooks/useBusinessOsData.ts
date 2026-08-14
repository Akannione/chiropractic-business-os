import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type {
  Activity,
  AppConfig,
  Inquiry,
  Kpis,
  MonthlySummary,
  ReactivationQueue,
  WeeklySummary,
} from '../types';

const emptyKpis: Kpis = {
  totalPatientInquiries: 0,
  newThisWeek: 0,
  activePatients: 0,
  followUpsNeeded: 0,
  followUpsNeededPercent: 0,
  overdueFollowUps: 0,
  estimatedTreatmentValue: 0,
  inquiryToPatientRate: 0,
  topInquirySource: 'None',
};

/** How many recent inquiries the dashboard panel shows. */
const RECENT_INQUIRY_COUNT = 8;

/**
 * Upper bound on the dashboard's follow-up queue. The overdue, due-today, and
 * workflow lists are all derived from this one bounded read.
 */
const FOLLOW_UP_QUEUE_LIMIT = 50;

export function useBusinessOsData() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [followUps, setFollowUps] = useState<Inquiry[]>([]);
  const [inquiryTotal, setInquiryTotal] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [kpis, setKpis] = useState<Kpis>(emptyKpis);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [reactivations, setReactivations] = useState<ReactivationQueue>({
    rows: [],
    overdue: 0,
    dueToday: 0,
    upcoming: 0,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setError('');
    // Two bounded reads replace what used to be the whole collection. The
    // dashboard only ever showed the eight most recent inquiries and the
    // follow-up queue, so it no longer downloads a clinic's entire history to
    // render them. The Inquiries page fetches its own page as filters change.
    const [
      nextConfig,
      nextRecent,
      nextFollowUps,
      nextReactivations,
      nextActivities,
      nextKpis,
      nextSummary,
      nextMonthlySummary,
    ] = await Promise.all([
      api.config(),
      api.inquiries({ pageSize: RECENT_INQUIRY_COUNT }),
      api.inquiries({ followUp: 'Needs Follow-Up', pageSize: FOLLOW_UP_QUEUE_LIMIT }),
      api.reactivations(),
      api.activities(),
      api.kpis(),
      api.weeklySummary(),
      api.monthlySummary(),
    ]);
    setConfig(nextConfig);
    setRecentInquiries(nextRecent.rows);
    setInquiryTotal(nextRecent.total);
    setFollowUps(nextFollowUps.rows);
    setReactivations(nextReactivations);
    setActivities(nextActivities);
    setKpis(nextKpis);
    setSummary(nextSummary);
    setMonthlySummary(nextMonthlySummary);
  }

  useEffect(() => {
    loadData()
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, []);

  async function refreshWithMessage(nextMessage: string) {
    await loadData();
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(''), 2800);
  }

  return {
    config,
    recentInquiries,
    followUps,
    inquiryTotal,
    activities,
    kpis,
    summary,
    monthlySummary,
    reactivations,
    message,
    error,
    loading,
    setError,
    refreshWithMessage,
  };
}
