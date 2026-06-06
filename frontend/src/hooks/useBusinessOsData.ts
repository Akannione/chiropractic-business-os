import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AppConfig, Inquiry, Kpis, WeeklySummary } from '../types';

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
  const [kpis, setKpis] = useState<Kpis>(emptyKpis);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setError('');
    const [nextConfig, nextInquiries, nextKpis, nextSummary] = await Promise.all([
      api.config(),
      api.inquiries(),
      api.kpis(),
      api.weeklySummary(),
    ]);
    setConfig(nextConfig);
    setInquiries(nextInquiries);
    setKpis(nextKpis);
    setSummary(nextSummary);
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
    kpis,
    summary,
    message,
    error,
    loading,
    setError,
    refreshWithMessage,
  };
}
