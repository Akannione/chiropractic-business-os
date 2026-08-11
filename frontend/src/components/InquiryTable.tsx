import type { Inquiry } from '../types';
import { displayDate, money } from '../utils/format';
import { StatusChip } from './StatusChip';

type InquiryTableProps = {
  inquiries: Inquiry[];
  compact?: boolean;
};

export function InquiryTable({ inquiries, compact = false }: InquiryTableProps) {
  if (!inquiries.length) return <div className="empty-state">No patient inquiries yet.</div>;

  return (
    <div className="table-wrap">
      <table className={compact ? 'table-compact' : undefined}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Requested Service</th>
            <th>Status</th>
            {!compact && <th>Source</th>}
            {!compact && <th>Value</th>}
            {!compact && <th>Next Follow-Up</th>}
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id}>
              <td>
                <strong>{inquiry.name}</strong>
                {!compact && <span>{inquiry.email}</span>}
              </td>
              <td>{inquiry.service_needed}</td>
              <td>
                <StatusChip status={inquiry.status} />
              </td>
              {!compact && <td>{inquiry.source}</td>}
              {!compact && <td>{money(inquiry.estimated_value)}</td>}
              {!compact && <td>{displayDate(inquiry.next_follow_up_date)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
