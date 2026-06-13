import type { Activity } from '../types';

export function ActivityPage({ activities }: { activities: Activity[] }) {
  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Activity History</h2>
        <p>Review recent inquiry changes, imports, and follow-up updates without guessing what happened.</p>
      </div>
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
          <div className="empty-state">No activity has been recorded yet.</div>
        )}
      </div>
    </section>
  );
}
