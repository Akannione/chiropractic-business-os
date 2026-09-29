import { CheckCircle2, FileSearch, Lightbulb, ShieldCheck, Upload } from 'lucide-react';
import { useState } from 'react';
import { KpiCard } from '../components/KpiCard';
import { api } from '../services/api';
import type { IntelligencePreview, IntelligenceSignal } from '../types';

type IntelligencePageProps = { setError: (message: string) => void };

const syntheticFiles = [
  { name: 'Appointments Export.csv', csvText: ['Patient,Appointment Date,Status,Provider','Demo Patient A,2026-09-10,Completed,Dr. Demo','Demo Patient B,2026-09-11,Cancelled,Dr. Demo','Demo Patient C,2026-09-12,No Show,Dr. Demo'].join('\n') },
  { name: 'Accounts Receivable Export.csv', csvText: ['Account,Patient,Outstanding Balance,Aging Days','D-100,Demo Patient A,0,0','D-101,Demo Patient B,425,31','D-102,Demo Patient C,180,62'].join('\n') },
  { name: 'Provider Hours Scheduled Booked Export.csv', csvText: ['Provider,Scheduled Hours,Booked Hours','Dr. Demo,40,29','Dr. Sample,32,28'].join('\n') },
  { name: 'Referral Sources Export.csv', csvText: ['Referral Source,Patient Count','Google,12','Referral,8','Website,6'].join('\n') },
  { name: 'Sales Export.csv', csvText: ['Date,Transaction,Amount','2026-09-01,Synthetic Sale 1,240','2026-09-02,Synthetic Sale 2,180'].join('\n') },
  { name: 'Adjustments Export.csv', csvText: ['Date,Adjustment Reason,Amount','2026-09-03,Synthetic adjustment,-25'].join('\n') },
  { name: 'Jane Payments Payouts Report.csv', csvText: ['Date,Payout,Amount','2026-09-04,Synthetic payout,375'].join('\n') },
  { name: 'Packages Care Plans Export.csv', csvText: ['Patient,Care Plan,Remaining Visits','Demo Patient A,Wellness 12,4'].join('\n') },
  { name: 'Bank transactions export.csv', csvText: ['Date,Description,Amount','2026-09-05,Synthetic rent,-1200'].join('\n') },
];

function displaySignalValue(signal: IntelligenceSignal) {
  if (signal.unit === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(signal.value);
  if (signal.unit === 'percent') return `${signal.value}%`;
  return String(signal.value);
}

export function IntelligencePage({ setError }: IntelligencePageProps) {
  const [preview, setPreview] = useState<IntelligencePreview | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  async function analyze(files: Array<{ name: string; csvText: string }>) {
    setAnalyzing(true); setError('');
    try { setPreview(await api.previewIntelligence(files)); setSelectedNames(files.map((file) => file.name)); }
    catch (error) { setError((error as Error).message); }
    finally { setAnalyzing(false); }
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList).slice(0, 12);
    const oversized = files.find((file) => file.size > 500_000);
    if (oversized) { setError(`${oversized.name} is larger than the 500 KB preview limit.`); return; }
    if (files.reduce((sum, file) => sum + file.size, 0) > 900_000) { setError('The selected files exceed the 900 KB combined preview limit. Analyze a smaller batch.'); return; }
    await analyze(await Promise.all(files.map(async (file) => ({ name: file.name, csvText: await file.text() }))));
  }

  return (
    <section className="stack intelligence-workspace">
      <div className="section-heading intelligence-heading">
        <div>
          <h2>Practice Intelligence</h2>
          <p>Turn clinic exports into clear operational signals — without replacing your EHR.</p>
        </div>
        <span className="intelligence-preview-badge"><ShieldCheck size={14} /> Preview · no data saved</span>
      </div>

      <div className="panel intelligence-upload intelligence-start-card">
        <div className="intelligence-start-copy">
          <FileSearch size={30} />
          <div>
            <h3>Start with your clinic exports</h3>
            <p>Choose the CSV reports you already download. CBOS identifies the reports first, then shows only signals supported by the data.</p>
          </div>
        </div>
        <div className="intelligence-start-actions">
          <button className="ghost-action" type="button" disabled={analyzing} onClick={() => analyze(syntheticFiles)}>
            <Lightbulb size={18} /> Try sample data
          </button>
          <label className="primary-button intelligence-file-label">
            <Upload size={18} /> {analyzing ? 'Analyzing...' : 'Choose CSV files'}
            <input hidden multiple accept=".csv,text/csv" type="file" disabled={analyzing} onChange={(event) => handleFiles(event.target.files)} />
          </label>
        </div>
        <div className="intelligence-steps" aria-label="Intelligence preview steps">
          {['Select exports', 'Confirm matches', 'Review signals'].map((step, index) => (
            <div key={step}><b>{index + 1}</b><span>{step}</span></div>
          ))}
        </div>
      </div>

      {selectedNames.length > 0 && <div className="intelligence-file-list" aria-label="Selected intelligence files">{selectedNames.map((name) => <span key={name}>{name}</span>)}</div>}

      {preview && <>
        <div className="kpi-grid small intelligence-summary">
          <KpiCard label="Reports Recognized" value={`${preview.summary.recognizedReports}/${preview.summary.filesReceived}`} help="Files matching a known operational report pattern." success />
          <KpiCard label="Rows Reviewed" value={String(preview.summary.totalRows)} help="Rows examined without importing them." />
          <KpiCard label="Signals Found" value={String(preview.summary.signalsFound)} help="Operational review signals supported by detected columns." warning={preview.summary.signalsFound > 0} />
          <KpiCard label="Need Mapping" value={String(preview.summary.unrecognizedReports)} help="Files CBOS intentionally left unmapped." warning={preview.summary.unrecognizedReports > 0} />
        </div>

        <div className="intelligence-results-layout">
          <div className="panel">
            <div className="panel-heading"><div><h3>Report matches</h3><p>Confirm what CBOS recognized before reviewing any insight.</p></div></div>
            <div className="intelligence-report-list">
              {preview.files.map((file) => <article className={`intelligence-report-row ${file.recognized ? 'recognized' : 'unknown'}`} key={file.fileName}>
                <div className="intelligence-report-name"><strong>{file.fileName}</strong><small>{file.rowCount} rows · {file.evidenceCoverage} evidence coverage</small></div>
                <span className="intelligence-match-chip">{file.recognized ? <><CheckCircle2 size={14} /> {file.reportLabel} · {file.confidence}%</> : 'Needs mapping'}</span>
                <details><summary>View evidence</summary><small>{file.mappedEvidence.length ? file.mappedEvidence.join(' · ') : 'No reliable mapping evidence found.'}{file.duplicateRows ? ` · ${file.duplicateRows} repeated row(s)` : ''}</small></details>
              </article>)}
            </div>
          </div>

          <aside className="panel intelligence-attention-panel">
            <div className="panel-heading"><div><h3>What needs attention</h3><p>Review signals, not automated decisions.</p></div></div>
            {preview.signals.length ? <div className="intelligence-signal-list">{preview.signals.map((signal) => <article className={`intelligence-signal-card ${signal.severity}`} key={signal.key}>
              <span>{signal.source}</span><b>{displaySignalValue(signal)}</b><strong>{signal.title}</strong><p>{signal.detail}</p>
            </article>)}</div> : <div className="empty-state">No supported operational signals were found in these files.</div>}
          </aside>
        </div>

        <div className="notice import-guidance intelligence-safety-note"><ShieldCheck size={18} /><span><strong>Safe preview:</strong> {preview.boundary} Use synthetic or manually reviewed de-identified samples only.</span></div>
      </>}
    </section>
  );
}
