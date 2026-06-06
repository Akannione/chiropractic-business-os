import { Download } from 'lucide-react';
import { api } from '../services/api';
import type { Inquiry } from '../types';

export function ExportsPage({ inquiries }: { inquiries: Inquiry[] }) {
  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Exports</h2>
        <p>Download practice-facing CSV files for review, backup, or handoff.</p>
      </div>
      <div className="export-card">
        <Download />
        <div>
          <h3>Patient Inquiries CSV</h3>
          <p>{inquiries.length ? `${inquiries.length} patient inquiries ready to export.` : 'No export data yet.'}</p>
        </div>
        <a className="primary-button" href={api.exportUrl}>
          Download CSV
        </a>
      </div>
    </section>
  );
}
