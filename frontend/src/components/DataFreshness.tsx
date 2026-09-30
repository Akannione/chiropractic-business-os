import { Clock3 } from 'lucide-react';

type DataFreshnessProps = {
  label?: string;
  detail?: string;
  tone?: 'fresh' | 'stale' | 'unknown';
};

export function DataFreshness({ label = 'Current session', detail = 'Updated from CBOS data', tone = 'fresh' }: DataFreshnessProps) {
  return (
    <span className={`data-freshness ${tone}`} title={detail}>
      <Clock3 size={13} />
      <span>{label}</span>
    </span>
  );
}
