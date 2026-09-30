import { useState, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  Columns3,
  Copy,
  Download,
  FileText,
  Globe2,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings,
  Users,
  X,
} from 'lucide-react';
import type { AppConfig, View } from '../types';

type AppShellProps = {
  view: View;
  config: AppConfig | null;
  message: string;
  error: string;
  loading: boolean;
  onViewChange: (view: View) => void;
  onAddInquiry: () => void;
  onDemoReset: () => Promise<void>;
  onLogout: () => void;
  children: ReactNode;
};
const navigation: Array<{ label: string; secondary?: boolean; items: Array<{ view: View; label: string; icon: ReactNode }> }> = [
  {
    label: 'Act',
    items: [
      { view: 'dashboard', label: 'Today', icon: <LayoutDashboard /> },
      { view: 'inquiries', label: 'Patient Inquiries', icon: <Users /> },
      { view: 'reactivations', label: 'Reactivations', icon: <RotateCcw /> },
    ],
  },
  {
    label: 'Review',
    items: [
      { view: 'pipeline', label: 'Pipeline', icon: <Columns3 /> },
      { view: 'summary', label: 'Owner Review', icon: <FileText /> },
      { view: 'intelligence', label: 'Intelligence', icon: <Lightbulb /> },
      { view: 'monthly', label: 'Monthly Report', icon: <BarChart3 /> },
      { view: 'activity', label: 'Activity', icon: <Activity /> },
    ],
  },
  {
    label: 'Tools',
    secondary: true,
    items: [
      { view: 'duplicates', label: 'Duplicates', icon: <Copy /> },
      { view: 'exports', label: 'Import & Export', icon: <Download /> },
      { view: 'public-intake', label: 'Public Intake', icon: <Globe2 /> },
      { view: 'settings', label: 'Settings', icon: <Settings /> },
    ],
  },
];
export function AppShell(props: AppShellProps) {
  const { view, config, message, error, loading, onViewChange, onAddInquiry, onDemoReset, onLogout, children } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const activeItem = navigation.flatMap((group) => group.items).find((item) => item.view === view);

  function changeView(nextView: View) {
    onViewChange(nextView);
    setMobileOpen(false);
  }

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark">CB</div>
            <div className="brand-copy"><strong>CBOS</strong><span>Practice action & intelligence</span></div>
          </div>
          <button className="sidebar-icon-button mobile-nav-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X /></button>
        </div>

        <nav aria-label="CBOS navigation">
          {navigation.map((group) => (
            <div className={`nav-group ${group.secondary ? 'secondary-nav' : ''}`} key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              {group.items.map((item) => (
                <NavButton key={item.view} icon={item.icon} active={view === item.view} onClick={() => changeView(item.view)}>
                  {item.label}
                </NavButton>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-actions">
          {config?.demoMode && <button className="ghost-button" onClick={onDemoReset}><RefreshCw size={16} /><span>Reset demo data</span></button>}
          <button className="ghost-button" onClick={onLogout}><LogOut size={16} /><span>Sign out</span></button>
          <button className="ghost-button sidebar-collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}<span>{collapsed ? 'Expand menu' : 'Collapse menu'}</span>
          </button>
        </div>
      </aside>

      <main className="content" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <div className="topbar-title">
            <button className="mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
            <div><span className="topbar-context">{config?.practiceName || 'CBOS'} · Front desk</span><h1>{activeItem?.label || 'Workspace'}</h1><p className="product-positioning">{view === 'dashboard' ? 'Your operational home for today.' : 'See what needs attention, what is being missed, and what your team should do next.'}</p></div>
          </div>
          <button id="add-inquiry-button" className="primary-button" onClick={onAddInquiry}><Plus size={18} /> Add Inquiry</button>
        </header>

        {message && <div className="notice success" role="status" aria-live="polite">{message}</div>}
        {error && <div className="notice error" role="alert">{error}</div>}
        {loading ? <div className="empty-state">Loading practice priorities...</div> : children}
      </main>
    </div>
  );
}

type NavButtonProps = { icon: ReactNode; active: boolean; children: ReactNode; onClick: () => void };

function NavButton({ icon, active, children, onClick }: NavButtonProps) {
  return <button className={`nav-button ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined} onClick={onClick}>{icon}<span>{children}</span></button>;
}
