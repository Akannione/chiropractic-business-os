import type { ReactNode } from 'react';
import { Download, FileText, LayoutDashboard, Plus, RefreshCw, Users } from 'lucide-react';
import type { AppConfig, View } from '../types';

type AppShellProps = {
  view: View;
  config: AppConfig | null;
  message: string;
  error: string;
  loading: boolean;
  onViewChange: (view: View) => void;
  onDemoReset: () => Promise<void>;
  children: ReactNode;
};

export function AppShell({
  view,
  config,
  message,
  error,
  loading,
  onViewChange,
  onDemoReset,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">OS</div>
          <div>
            <strong>Chiropractic</strong>
            <span>Business OS</span>
          </div>
        </div>
        <nav>
          <NavButton icon={<LayoutDashboard />} active={view === 'dashboard'} onClick={() => onViewChange('dashboard')}>
            Dashboard
          </NavButton>
          <NavButton icon={<Users />} active={view === 'inquiries'} onClick={() => onViewChange('inquiries')}>
            Patient Inquiries
          </NavButton>
          <NavButton icon={<FileText />} active={view === 'summary'} onClick={() => onViewChange('summary')}>
            Weekly Summary
          </NavButton>
          <NavButton icon={<Download />} active={view === 'exports'} onClick={() => onViewChange('exports')}>
            Exports
          </NavButton>
        </nav>
        {config?.demoMode && (
          <button className="ghost-button" onClick={onDemoReset}>
            <RefreshCw size={16} /> Reset demo data
          </button>
        )}
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h1>Chiropractic Business OS</h1>
            <p>Track patient inquiries, follow-ups, active patients, and estimated treatment value.</p>
          </div>
          <button className="primary-button" onClick={() => onViewChange('inquiries')}>
            <Plus size={18} /> Add Inquiry
          </button>
        </header>

        {message && <div className="notice success">{message}</div>}
        {error && <div className="notice error">{error}</div>}
        {loading ? <div className="empty-state">Loading practice dashboard...</div> : children}
      </main>
    </div>
  );
}

type NavButtonProps = {
  icon: ReactNode;
  active: boolean;
  children: ReactNode;
  onClick: () => void;
};

function NavButton({ icon, active, children, onClick }: NavButtonProps) {
  return (
    <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}
