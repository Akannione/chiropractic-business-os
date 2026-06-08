import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { useBusinessOsData } from './hooks/useBusinessOsData';
import { DashboardPage } from './pages/DashboardPage';
import { ExportsPage } from './pages/ExportsPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { PublicInquiryPage } from './pages/PublicInquiryPage';
import { WeeklySummaryPage } from './pages/WeeklySummaryPage';
import { api } from './services/api';
import type { View } from './types';

export function App() {
  if (window.location.pathname === '/intake') {
    return <PublicInquiryPage />;
  }

  return <StaffApp />;
}

function StaffApp() {
  const [view, setView] = useState<View>('dashboard');
  const { config, inquiries, kpis, summary, message, error, loading, setError, refreshWithMessage } = useBusinessOsData();

  async function resetDemoData() {
    await api.resetDemo();
    await refreshWithMessage('Demo data reset.');
  }

  return (
    <AppShell
      view={view}
      config={config}
      message={message}
      error={error}
      loading={loading}
      onViewChange={setView}
      onDemoReset={resetDemoData}
    >
      {view === 'dashboard' && <DashboardPage kpis={kpis} config={config} inquiries={inquiries} />}
      {view === 'inquiries' && (
        <InquiriesPage config={config} inquiries={inquiries} onChanged={refreshWithMessage} setError={setError} />
      )}
      {view === 'summary' && <WeeklySummaryPage summary={summary} />}
      {view === 'exports' && <ExportsPage inquiries={inquiries} />}
      {view === 'public-intake' && <PublicInquiryPage config={config} />}
    </AppShell>
  );
}
