import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state-card">
      <span className="empty-state-icon"><Inbox size={20} /></span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
