import { CalendarClock } from 'lucide-react';
import type { Inquiry } from '../types';
import { displayDate } from '../utils/format';

type FollowUpListProps = {
  title: string;
  inquiries: Inquiry[];
  variant: 'danger' | 'warning';
};

export function FollowUpList({ title, inquiries, variant }: FollowUpListProps) {
  return (
    <div className="followup-block">
      <h4>{title}</h4>
      {inquiries.length ? (
        inquiries.slice(0, 6).map((inquiry) => (
          <div className={`followup-row ${variant}`} key={inquiry.id}>
            <CalendarClock size={16} />
            <div>
              <strong>{inquiry.name}</strong>
              <span>
                {inquiry.service_needed} · {displayDate(inquiry.next_follow_up_date)}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-inline">No follow-ups in this group.</div>
      )}
    </div>
  );
}
