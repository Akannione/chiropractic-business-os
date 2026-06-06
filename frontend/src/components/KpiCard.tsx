type KpiCardProps = {
  label: string;
  value: string;
  help?: string;
  featured?: boolean;
  warning?: boolean;
  success?: boolean;
};

export function KpiCard({ label, value, help, featured, warning, success }: KpiCardProps) {
  return (
    <article className={`kpi-card ${featured ? 'featured' : ''} ${warning ? 'warning' : ''} ${success ? 'success' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {help && <small>{help}</small>}
    </article>
  );
}
