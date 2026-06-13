import { api } from '../services/api';
import type { AppConfig } from '../types';

type SettingsPageProps = {
  config: AppConfig | null;
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

export function SettingsPage({ config, onChanged, setError }: SettingsPageProps) {
  async function sendDailySummary() {
    setError('');
    try {
      const result = await api.sendDailySummary();
      if (result.sent) {
        await onChanged(`Daily summary sent: ${result.overdue} overdue, ${result.dueToday} due today.`);
      } else {
        await onChanged(result.reason || 'Daily summary email is not configured.');
      }
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Practice Settings</h2>
        <p>Review the simple deployment settings that control practice name, demo mode, and notification behavior.</p>
      </div>
      <div className="settings-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Practice Configuration</h3>
            <p>These values are configured through backend environment variables for simple client deployments.</p>
          </div>
          <dl className="settings-list">
            <dt>Practice Name</dt>
            <dd>{config?.practiceName || 'Chiropractic Practice'}</dd>
            <dt>Demo Mode</dt>
            <dd>{config?.demoMode ? 'Enabled' : 'Disabled'}</dd>
            <dt>Requested Services</dt>
            <dd>{config?.services.join(', ')}</dd>
          </dl>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h3>Internal Follow-Up Email</h3>
            <p>Send a staff-only summary of overdue, due-today, and new patient inquiries.</p>
          </div>
          <button className="primary-button" type="button" onClick={sendDailySummary}>
            Send Daily Summary
          </button>
          <p className="public-footnote">
            Email sends only when SMTP and `INTERNAL_NOTIFICATION_EMAIL` are configured.
          </p>
        </div>
      </div>
    </section>
  );
}
