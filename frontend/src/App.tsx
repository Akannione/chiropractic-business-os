import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { useBusinessOsData } from './hooks/useBusinessOsData';
import { DashboardPage } from './pages/DashboardPage';
import { ExportsPage } from './pages/ExportsPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { LoginPage } from './pages/LoginPage';
import { ActivityPage } from './pages/ActivityPage';
import { MonthlySummaryPage } from './pages/MonthlySummaryPage';
import { PublicInquiryPage } from './pages/PublicInquiryPage';
import { SettingsPage } from './pages/SettingsPage';
import { WeeklySummaryPage } from './pages/WeeklySummaryPage';
import { api, clearAuthToken, getAuthToken } from './services/api';
import type { View } from './types';

export function App() {
  if (window.location.pathname === '/intake') {
    return <PublicInquiryPage />;
  }

  return <StaffGate />;
}

function StaffGate() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [authenticated, setAuthenticated] = useState(Boolean(getAuthToken()));
  const [error, setError] = useState('');

  useEffect(() => {
    api.authStatus()
      .then((status) => {
        setAuthRequired(status.authEnabled);
        if (!status.authEnabled) setAuthenticated(true);
      })
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setCheckingAuth(false));
  }, []);

  if (checkingAuth) return <div className="empty-state">Checking staff access...</div>;
  if (error) return <div className="notice error">{error}</div>;
  if (authRequired && !authenticated) return <LoginPage onLogin={() => setAuthenticated(true)} />;
  return <StaffApp onLogout={() => {
    clearAuthToken();
    setAuthenticated(false);
  }} />;
}

function StaffApp({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>('dashboard');
  const {
    activities,
    config,
    inquiries,
    kpis,
    monthlySummary,
    summary,
    message,
    error,
    loading,
    setError,
    refreshWithMessage,
  } = useBusinessOsData();

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
      onLogout={onLogout}
    >
      {view === 'dashboard' && (
        <DashboardPage
          kpis={kpis}
          config={config}
          inquiries={inquiries}
          onChanged={refreshWithMessage}
          setError={setError}
        />
      )}
      {view === 'inquiries' && (
        <InquiriesPage config={config} inquiries={inquiries} onChanged={refreshWithMessage} setError={setError} />
      )}
      {view === 'summary' && <WeeklySummaryPage summary={summary} />}
      {view === 'monthly' && <MonthlySummaryPage summary={monthlySummary} />}
      {view === 'activity' && <ActivityPage activities={activities} />}
      {view === 'exports' && <ExportsPage inquiries={inquiries} onChanged={refreshWithMessage} setError={setError} />}
      {view === 'settings' && <SettingsPage config={config} onChanged={refreshWithMessage} setError={setError} />}
      {view === 'public-intake' && <PublicInquiryPage config={config} />}
    </AppShell>
  );
}
