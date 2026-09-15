import type { ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  Columns3,
  Copy,
  Download,
  FileText,
  Globe2,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings,
  Users,
} from 'lucide-react';
import type { AppConfig, View } from '../types';

type AppShellProps = {
  view: View;
  config: AppConfig | null;
  message: string;
  error: string;
  loading: boolean;
  onViewChange: (view: View) => void;
  onDemoReset: () => Promise<void>;
  onLogout: () => void;
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
  onLogout,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CB</div>
          <div>
            <strong>CBOS</strong>
            <span>Practice action & intelligence</span>
          </div>
        </div>

        <nav aria-label="CBOS navigation">
          <div className="nav-group">
            <span className="nav-group-label">Act</span>
            <NavButton icon={<LayoutDashboard />} active={view === 'dashboard'} onClick={() => onViewChange('dashboard')}>
              Today
            </NavButton>
            <NavButton icon={<Users />} active={view === 'inquiries'} onClick={() => onViewChange('inquiries')}>
              Patient Inquiries
            </NavButton>
            <NavButton
              icon={<RotateCcw />}
              active={view === 'reactivations'}
              onClick={() => onViewChange('reactivations')}
            >
              Reactivations
            </NavButton>
          </div>

          <div className="nav-group">
            <span className="nav-group-label">Review</span>
            <NavButton icon={<Columns3 />} active={view === 'pipeline'} onClick={() => onViewChange('pipeline')}>
              Pipeline
            </NavButton>
            <NavButton icon={<FileText />} active={view === 'summary'} onClick={() => onViewChange('summary')}>
              Owner Review
            </NavButton>
            <NavButton icon={<BarChart3 />} active={view === 'monthly'} onClick={() => onViewChange('monthly')}>
              Monthly Report
            </NavButton>
            <NavButton icon={<Activity />} active={view === 'activity'} onClick={() => onViewChange('activity')}>
              Activity
            </NavButton>
          </div>

          <div className="nav-group secondary-nav">
            <span className="nav-group-label">Tools</span>
            <NavButton icon={<Copy />} active={view === 'duplicates'} onClick={() => onViewChange('duplicates')}>
              Duplicates
            </NavButton>
            <NavButton icon={<Download />} active={view === 'exports'} onClick={() => onViewChange('exports')}>
              Import & Export
            </NavButton>
            <NavButton icon={<Globe2 />} active={view === 'public-intake'} onClick={() => onViewChange('public-intake')}>
              Public Intake
            </NavButton>
            <NavButton icon={<Settings />} active={view === 'settings'} onClick={() => onViewChange('settings')}>
              Settings
            </NavButton>
          </div>
        </nav>

        <div className="sidebar-actions">
          {config?.demoMode && (
            <button className="ghost-button" onClick={onDemoReset}>
              <RefreshCw size={16} /> Reset demo data
            </button>
          )}
          <button className="ghost-button" onClick={onLogout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h1>CBOS</h1>
            <p className="product-positioning">See what needs attention, what is being missed, and what your team should do next.</p>
          </div>
          <button className="primary-button" onClick={() => onViewChange('inquiries')}>
            <Plus size={18} /> Add Inquiry
          </button>
        </header>

        {message && <div className="notice success">{message}</div>}
        {error && <div className="notice error">{error}</div>}
        {loading ? <div className="empty-state">Loading practice priorities...</div> : children}
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
