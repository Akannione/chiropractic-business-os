import type { InquiryStatus } from '../types';

export function StatusChip({ status }: { status: InquiryStatus }) {
  return <span className={`status-chip ${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>;
}
