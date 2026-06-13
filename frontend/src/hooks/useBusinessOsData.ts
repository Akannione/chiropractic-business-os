import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Activity, AppConfig, Inquiry, Kpis, MonthlySummary, WeeklySummary } from '../types';

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

export function useBusinessOsData() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [kpis, setKpis] = useState<Kpis>(emptyKpis);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setError('');
    const [nextConfig, nextInquiries, nextActivities, nextKpis, nextSummary, nextMonthlySummary] = await Promise.all([
      api.config(),
      api.inquiries(),
      api.activities(),
      api.kpis(),
      api.weeklySummary(),
      api.monthlySummary(),
    ]);
    setConfig(nextConfig);
    setInquiries(nextInquiries);
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
    inquiries,
    activities,
    kpis,
    summary,
    monthlySummary,
    message,
    error,
    loading,
    setError,
    refreshWithMessage,
  };
}
