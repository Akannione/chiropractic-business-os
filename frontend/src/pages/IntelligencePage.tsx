import { FileSearch, Lightbulb, Upload } from 'lucide-react';
import { useState } from 'react';
import { KpiCard } from '../components/KpiCard';
import { api } from '../services/api';
import type { IntelligencePreview, IntelligenceSignal } from '../types';

type IntelligencePageProps = {
  setError: (message: string) => void;
};

const syntheticFiles = [
  {
    name: 'Appointments Export.csv',
    csvText: [
      'Patient,Appointment Date,Status,Provider',
      'Demo Patient A,2026-09-10,Completed,Dr. Demo',
      'Demo Patient B,2026-09-11,Cancelled,Dr. Demo',
      'Demo Patient C,2026-09-12,No Show,Dr. Demo',
    ].join('\n'),
  },
  {
    name: 'Accounts Receivable Export.csv',
    csvText: [
      'Account,Patient,Outstanding Balance,Aging Days',
      'D-100,Demo Patient A,0,0',
      'D-101,Demo Patient B,425,31',
      'D-102,Demo Patient C,180,62',
    ].join('\n'),
  },
  {
    name: 'Provider Hours Scheduled Booked Export.csv',
    csvText: [
      'Provider,Scheduled Hours,Booked Hours',
      'Dr. Demo,40,29',
      'Dr. Sample,32,28',
    ].join('\n'),
  },
];

function displaySignalValue(signal: IntelligenceSignal) {
  if (signal.unit === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(signal.value);
  }
  if (signal.unit === 'percent') return `${signal.value}%`;
  return String(signal.value);
}

export function IntelligencePage({ setError }: IntelligencePageProps) {
  const [preview, setPreview] = useState<IntelligencePreview | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  async function analyze(files: Array<{ name: string; csvText: string }>) {
    setAnalyzing(true);
    setError('');
    try {
      setPreview(await api.previewIntelligence(files));
      setSelectedNames(files.map((file) => file.name));
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }
  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList).slice(0, 12);
    const payload = await Promise.all(files.map(async (file) => ({
      name: file.name,
      csvText: await file.text(),
    })));
    await analyze(payload);
  }

  return (
    <section className="stack">
      <div className="section-heading intelligence-heading">
        <div>
          <h2>Practice Intelligence</h2>
          <p>
            Preview operational exports together, recognize report types, and surface review signals
            before building any source-specific integration.
          </p>
        </div>
        <button className="ghost-action" type="button" disabled={analyzing} onClick={() => analyze(syntheticFiles)}>
          <Lightbulb size={18} /> Run Synthetic Demo
        </button>
      </div>

      <div className="panel intelligence-upload">
        <div>
          <FileSearch size={28} />
          <h3>Analyze clinic exports</h3>
          <p>
            Select multiple CSV files. This preview does not write back to an EHR and does not import
            rows into CBOS.
          </p>
        </div>
        <label className="primary-button intelligence-file-label">
          <Upload size={18} />
          {analyzing ? 'Analyzing...' : 'Choose CSV Files'}
          <input
            hidden
            multiple
            accept=".csv,text/csv"
            type="file"
            disabled={analyzing}
            onChange={(event) => handleFiles(event.target.files)}
          />
        </label>
      </div>

      {selectedNames.length > 0 && (
        <div className="intelligence-file-list" aria-label="Selected intelligence files">
          {selectedNames.map((name) => <span key={name}>{name}</span>)}
        </div>
      )}

      {preview && (
        <>
          <div className="kpi-grid small">
            <KpiCard label="Files Received" value={String(preview.summary.filesReceived)} help="CSV files included in this preview." />
            <KpiCard label="Recognized Reports" value={String(preview.summary.recognizedReports)} help="Files matching a known operational report pattern." success />
            <KpiCard label="Rows Reviewed" value={String(preview.summary.totalRows)} help="Rows examined without importing them." />
            <KpiCard label="Signals Found" value={String(preview.summary.signalsFound)} help="Operational review signals supported by detected columns." warning={preview.summary.signalsFound > 0} />
          </div>
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Report Recognition</h3>
                <p>Classification is based on file names and detected headers. Unknown files stay unknown.</p>
              </div>
            </div>
            <div className="intelligence-report-grid">
              {preview.files.map((file) => (
                <article className={`intelligence-report-card ${file.recognized ? 'recognized' : 'unknown'}`} key={file.fileName}>
                  <div>
                    <strong>{file.fileName}</strong>
                    <span>{file.reportLabel}</span>
                  </div>
                  <div className="intelligence-report-meta">
                    <span>{file.rowCount} rows</span>
                    <span>{file.recognized ? `${file.confidence}% match` : 'Needs mapping'}</span>
                  </div>
                  <small>{file.headers.slice(0, 6).join(' · ') || 'No headers detected'}</small>
                  {file.warnings.map((warning) => <small key={warning}>{warning}</small>)}
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Operational Signals</h3>
                <p>Only signals directly supported by detected report columns appear here.</p>
              </div>
            </div>
            {preview.signals.length ? (
              <div className="intelligence-signal-grid">
                {preview.signals.map((signal) => (
                  <article className={`intelligence-signal-card ${signal.severity}`} key={signal.key}>
                    <div>
                      <span>{signal.source}</span>
                      <strong>{signal.title}</strong>
                    </div>
                    <b>{displaySignalValue(signal)}</b>
                    <p>{signal.detail}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">No supported operational signals were found in these files.</div>
            )}
          </div>

          <div className="notice import-guidance">
            <strong>Boundary:</strong> {preview.boundary} Use synthetic or manually reviewed de-identified
            samples only; real patient data remains blocked.
          </div>
        </>
      )}
    </section>
  );
}
