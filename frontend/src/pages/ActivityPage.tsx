import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import type { Activity } from '../types';

export function ActivityPage({ activities }: { activities: Activity[] }) {
  return (
    <section className="stack workspace-page activity-workspace">
      <PageHeader
        eyebrow="Audit trail"
        title="Activity History"
        description="Review recent inquiry changes, imports, and follow-up updates without guessing what happened."
      />
      <div className="panel">
        {activities.length ? (
          <div className="activity-list">
            {activities.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <div>
                  <strong>{activity.action}</strong>
                  <span>{activity.patient_name || 'Practice activity'}</span>
                  <p>{activity.detail}</p>
                </div>
                <small>{new Date(activity.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No activity yet"
            description="Changes, imports, and follow-up updates will appear here as your team uses CBOS."
          />
        )}
      </div>
    </section>
  );
}
