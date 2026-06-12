import { formatDate } from '../utils/date.js';

export function serializeInquiry(inquiry: any) {
  return {
    ...inquiry,
    id: String(inquiry.id || inquiry._id),
    next_follow_up_date: formatDate(inquiry.next_follow_up_date),
    created_at: inquiry.created_at?.toISOString?.() || inquiry.created_at,
    updated_at: inquiry.updated_at?.toISOString?.() || inquiry.updated_at,
  };
}
