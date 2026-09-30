import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { InquiryDrawer } from './components/InquiryDrawer';
import { useBusinessOsData } from './hooks/useBusinessOsData';
import { DashboardPage } from './pages/DashboardPage';
import { DuplicatesPage } from './pages/DuplicatesPage';
import { ExportsPage } from './pages/ExportsPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { LoginPage } from './pages/LoginPage';
import { ActivityPage } from './pages/ActivityPage';
import { MonthlySummaryPage } from './pages/MonthlySummaryPage';
import { PipelinePage } from './pages/PipelinePage';
import { PublicInquiryPage } from './pages/PublicInquiryPage';
import { ReactivationsPage } from './pages/ReactivationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WeeklySummaryPage } from './pages/WeeklySummaryPage';
import { api, clearAuthToken, getAuthToken, setUnauthorizedHandler } from './services/api';
import type { View } from './types';
import { pathForView, viewFromPath } from './routing';

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
  const [loginNotice, setLoginNotice] = useState('');

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthenticated(false);
      setLoginNotice('Your staff session expired. Please sign in again.');
    });

    api.authStatus()
      .then(async (status) => {
        setAuthRequired(status.authEnabled);
        if (!status.authEnabled) {
          setAuthenticated(true);
          return;
        }
        if (!getAuthToken()) {
          setAuthenticated(false);
          return;
        }
        try {
          await api.verifyStaffSession();
          setAuthenticated(true);
        } catch {
          clearAuthToken();
          setAuthenticated(false);
          setLoginNotice('Your staff session expired. Please sign in again.');
        }
      })
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setCheckingAuth(false));

    return () => setUnauthorizedHandler(null);
  }, []);

  if (checkingAuth) return <div className="empty-state">Checking staff access...</div>;
  if (error) return <div className="notice error">{error}</div>;
  if (authRequired && !authenticated) {
    return (
      <LoginPage
        notice={loginNotice}
        onLogin={() => {
          setLoginNotice('');
          setAuthenticated(true);
        }}
      />
    );
  }
  return <StaffApp onLogout={() => {
    clearAuthToken();
    setAuthenticated(false);
  }} />;
}

function StaffApp({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>(() => viewFromPath(window.location.pathname));
  const [inquiryDrawerOpen, setInquiryDrawerOpen] = useState(false);
  const {
    activities,
    config,
    recentInquiries,
    followUps,
    inquiryTotal,
    kpis,
    monthlySummary,
    reactivations,
    summary,
    message,
    error,
    loading,
    setError,
    retryLoadData,
    refreshWithMessage,
  } = useBusinessOsData();

  useEffect(() => {
    const currentView = viewFromPath(window.location.pathname);
    const canonicalPath = pathForView(currentView);
    if (window.location.pathname !== canonicalPath) window.history.replaceState({}, '', canonicalPath);
    const onPopState = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const label = view === 'dashboard' ? 'Today' : view.replace(/-/g, ' ');
    document.title = `${label.replace(/\b\w/g, (letter) => letter.toUpperCase())} · CBOS`;
  }, [view]);

  function changeView(nextView: View) {
    const nextPath = pathForView(nextView);
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath);
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

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
      onViewChange={changeView}
      onAddInquiry={() => setInquiryDrawerOpen(true)}
      onDemoReset={resetDemoData}
      onRetry={retryLoadData}
      onLogout={onLogout}
    >
      {view === 'dashboard' && (
        <DashboardPage
          kpis={kpis}
          config={config}
          recentInquiries={recentInquiries}
          followUps={followUps}
          onChanged={refreshWithMessage}
          setError={setError}
        />
      )}
      {view === 'inquiries' && (
        <InquiriesPage config={config} onChanged={refreshWithMessage} setError={setError} />
      )}
      {view === 'pipeline' && (
        <PipelinePage config={config} onChanged={refreshWithMessage} setError={setError} />
      )}
      {view === 'reactivations' && (
        <ReactivationsPage
          config={config}
          queue={reactivations}
          onChanged={refreshWithMessage}
          setError={setError}
        />
      )}
      {view === 'summary' && <WeeklySummaryPage summary={summary} />}
      {view === 'monthly' && <MonthlySummaryPage summary={monthlySummary} />}
      {view === 'intelligence' && <IntelligencePage setError={setError} />}
      {view === 'activity' && <ActivityPage activities={activities} />}
      {view === 'duplicates' && (
        <DuplicatesPage onChanged={refreshWithMessage} setError={setError} />
      )}
      {view === 'exports' && <ExportsPage inquiryTotal={inquiryTotal} onChanged={refreshWithMessage} setError={setError} />}
      {view === 'settings' && <SettingsPage config={config} onChanged={refreshWithMessage} setError={setError} />}
      {view === 'public-intake' && <PublicInquiryPage config={config} />}
      {inquiryDrawerOpen && (
        <InquiryDrawer
          config={config}
          setError={setError}
          onClose={() => setInquiryDrawerOpen(false)}
          onCreated={() => refreshWithMessage('Patient inquiry added.')}
        />
      )}
    </AppShell>
  );
}
