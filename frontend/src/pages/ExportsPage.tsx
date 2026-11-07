import { Download, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { api } from '../services/api';
import { captureTelemetry } from '../services/analytics';
import type { AppConfig, ImportBatch, ImportPreview, ImportResult } from '../types';
import { todayIso } from '../utils/format';

type ExportsPageProps = {
  config: AppConfig | null;
  /** Total inquiries available to export, from the paginated list endpoint. */
  inquiryTotal: number;
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

export const MAX_IMPORT_CSV_BYTES = 1_000_000;

export function importFileError(file: Pick<File, 'name' | 'size'>) {
  if (file.size > MAX_IMPORT_CSV_BYTES) {
    return `${file.name} is larger than the 1 MB import limit. Choose a smaller CSV.`;
  }
  return '';
}

export function ExportsPage({ config, inquiryTotal, onChanged, setError }: ExportsPageProps) {
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [demoImportConfirmed, setDemoImportConfirmed] = useState(false);
  const [importReadyConfirmed, setImportReadyConfirmed] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<ImportResult | null>(null);
  const [importHistory, setImportHistory] = useState<ImportBatch[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [confirmUndoBatchId, setConfirmUndoBatchId] = useState('');
  const [undoingBatchId, setUndoingBatchId] = useState('');
  const previewRows = useMemo(() => preview?.rows.slice(0, 8) || [], [preview]);

  async function refreshImportHistory() {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      setImportHistory(await api.importBatches());
    } catch (nextError) {
      setHistoryError((nextError as Error).message);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    void refreshImportHistory();
  }, []);

  async function handleFile(file: File | null) {
    setError('');
    setPreview(null);
    setCsvText('');
    setImportReadyConfirmed(false);
    setLastImportResult(null);
    if (!file) return;

    const validationError = importFileError(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const text = await file.text();
      setCsvText(text);
      const result = await api.previewImportCsv(text);
      setPreview(result);
      captureTelemetry('csv_import_previewed', { importable_rows: result.importableRows, error_count: result.errorRows });
    } catch (nextError) {
      setCsvText('');
      setError((nextError as Error).message);
    }
  }

  async function importCsv() {
    if (!csvText || !preview?.importableRows || !importReadyConfirmed || importing) return;
    setImporting(true);
    setError('');
    try {
      const result = await api.importCsv(csvText);
      captureTelemetry('csv_import_completed', { imported_rows: result.imported, skipped_duplicates: result.skippedDuplicates });
      setCsvText('');
      setPreview(null);
      setImportReadyConfirmed(false);
      setLastImportResult(result);
      await refreshImportHistory();
      const failedText = result.failed ? ` ${result.failed} row(s) could not be imported.` : '';
      await onChanged(
        `${result.imported} patient inquiries imported. ${result.skippedDuplicates} duplicate rows skipped.${failedText}`,
      );
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setImporting(false);
    }
  }

  async function undoBatch(batchId: string) {
    setUndoingBatchId(batchId);
    setError('');
    try {
      const result = await api.undoImportBatch(batchId);
      setConfirmUndoBatchId('');
      if (lastImportResult?.batchId === batchId) setLastImportResult(null);
      await refreshImportHistory();
      await onChanged(
        result.alreadyUndone
          ? 'This import was already undone.'
          : `Undo complete. ${result.deletedInquiries} imported patient inquiries removed.`,
      );
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setUndoingBatchId('');
    }
  }

  function downloadFailureReport(batch: Pick<ImportBatch, 'batchId' | 'errors'>) {
    if (!batch.errors.length) return;
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      'batch_id,error',
      ...batch.errors.map((error) => `${escapeCell(batch.batchId)},${escapeCell(error)}`),
    ].join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `cbos_import_failures_${batch.batchId}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async function downloadCsv() {
    setError('');
    try {
      const blob = await api.downloadExportCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patient_inquiries_${todayIso()}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  return (
    <section className="stack workspace-page exports-workspace">
      <PageHeader eyebrow="Data tools" title="Import & Export" description="Review CSVs before importing." />
      <div className="export-card">
        <Download />
        <div>
          <h3>Patient Inquiries CSV</h3>
          <p>{inquiryTotal ? `${inquiryTotal} patient inquiries ready to export.` : 'No export data yet.'}</p>
        </div>
        <button className="primary-button" type="button" onClick={downloadCsv}>
          Download CSV
        </button>
      </div>

      <div className="export-card import-card">
        <Download />
        <div>
          <h3>Import inquiries</h3>
          <ol className="import-steps" aria-label="CSV import progress">
            <li aria-current={!preview && !lastImportResult ? 'step' : undefined}>1. Choose CSV</li>
            <li aria-current={preview ? 'step' : undefined}>2. Review preview</li>
            <li aria-current={lastImportResult ? 'step' : undefined}>3. Results</li>
          </ol>
          <p>
            Preview first. Possible duplicates require matching name and contact detail.
          </p>
          {config?.demoMode && (
            <div id="demo-import-safety" className="notice demo-safety-notice" role="note" aria-label="Demo import safety notice">
              <strong>Demo mode — do not upload a real clinic export.</strong>
              <span> Use fabricated or explicitly deidentified CSV data only.</span>
              <label className="demo-safety-confirmation">
                <input
                  type="checkbox"
                  checked={demoImportConfirmed}
                  onChange={(event) => setDemoImportConfirmed(event.target.checked)}
                />
                I confirm this CSV contains only fabricated or deidentified data.
              </label>
            </div>
          )}
          <input
            accept=".csv,text/csv"
            aria-label="Choose patient inquiry CSV file"
            aria-describedby={config?.demoMode ? 'demo-import-safety' : undefined}
            type="file"
            disabled={Boolean(config?.demoMode && !demoImportConfirmed)}
            onChange={(event) => handleFile(event.target.files?.[0] || null)}
          />
        </div>
        <div className="import-stage-hint">{preview ? 'Review the preview below.' : 'Select a CSV to begin.'}</div>
      </div>

      {preview && (
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Import Preview</h3>
              <p>
                Review the file before import. Only rows marked Ready will be added.
              </p>
            </div>
          </div>
          <div className="kpi-grid small import-preview-metrics">
            <KpiCard label="Rows In File" value={String(preview.totalRows)} help="All rows found in the uploaded CSV." />
            <KpiCard label="Ready To Import" value={String(preview.importableRows)} help="Clean patient inquiry rows that can be imported." success />
            <KpiCard label="Possible Duplicates" value={String(preview.duplicateRows)} help="Rows matching a patient already on file." warning />
            <KpiCard label="Need Cleanup" value={String(preview.errorRows)} help="Rows missing required fields or valid dates." warning />
          </div>
          {previewRows.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Patient</th>
                    <th>Requested Service</th>
                    <th>Patient Type</th>
                    <th>Last Visit</th>
                    <th>Source</th>
                    <th>Preview Result</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr
                      className={
                        row.duplicate
                          ? 'import-row duplicate'
                          : row.errors.length
                            ? 'import-row error'
                            : 'import-row ready'
                      }
                      key={row.rowNumber}
                    >
                      <td>{row.rowNumber}</td>
                      <td>
                        {row.name}
                        <br />
                        <small>{row.email || row.phone}</small>
                      </td>
                      <td>{row.service_needed}</td>
                      <td>{row.patient_type}</td>
                      <td>{row.last_visit_date || 'Not provided'}</td>
                      <td>{row.source}</td>
                      <td>
                        <span
                          className={
                            row.duplicate
                              ? 'preview-pill duplicate'
                              : row.errors.length
                                ? 'preview-pill error'
                                : 'preview-pill ready'
                          }
                        >
                          {row.duplicate ? 'Duplicate' : row.errors.length ? 'Needs Cleanup' : 'Ready'}
                        </span>
                        {row.errors.length > 0 && <small>{row.errors.join(' ')}</small>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No importable rows were found in this CSV.</div>
          )}

          <details className="import-guidance-details">
            <summary>Import and recovery rules</summary>
            <p>Only Ready rows are imported. Likely duplicates are skipped. If a database write fails, other successful rows remain in the batch and the exception is recorded for recovery.</p>
          </details>
          <div className="import-final-confirmation">
            <label>
              <input type="checkbox" checked={importReadyConfirmed} onChange={(event) => setImportReadyConfirmed(event.target.checked)} />
              I reviewed the preview and confirm importing Ready rows only.
            </label>
            <button className="primary-button" type="button" disabled={!preview.importableRows || !importReadyConfirmed || importing} onClick={importCsv}>
              {importing ? 'Importing...' : 'Import Previewed Rows'}
            </button>
          </div>
        </div>
      )}

      {lastImportResult && (
        <div
          className={`notice ${lastImportResult.status === 'failed' ? 'error' : lastImportResult.status === 'partial' ? 'warning' : 'success'}`}
          role="status"
        >
          <strong>
            {lastImportResult.status === 'failed'
              ? 'Import failed.'
              : lastImportResult.status === 'partial'
                ? 'Import completed with exceptions.'
                : 'Import completed.'}
          </strong>
          <span>
            {' '}{lastImportResult.imported} imported, {lastImportResult.skippedDuplicates} duplicate(s) skipped,
            {' '}{lastImportResult.failed} failed. Batch {lastImportResult.batchId}.
          </span>
          {lastImportResult.errors.length > 0 && (
            <button
              type="button"
              onClick={() => downloadFailureReport({
                batchId: lastImportResult.batchId,
                errors: lastImportResult.errors,
              })}
            >
              Download failure report
            </button>
          )}
        </div>
      )}

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h3>Recent Imports</h3>
            <p>
              Undo removes only unchanged records created by that import.
            </p>
          </div>
          <button type="button" onClick={() => void refreshImportHistory()} disabled={historyLoading}>
            {historyLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {historyError ? (
          <div className="notice warning" role="status">
            Import history could not be loaded. {historyError}
          </div>
        ) : historyLoading && !importHistory.length ? (
          <div className="empty-state">Loading import history...</div>
        ) : importHistory.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Imported</th>
                  <th>Status</th>
                  <th>Outcome</th>
                  <th>Batch</th>
                  <th>Recovery</th>
                </tr>
              </thead>
              <tbody>
                {importHistory.map((batch) => (
                  <tr key={batch.batchId}>
                    <td>{new Date(batch.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`preview-pill ${batch.status === 'completed' ? 'ready' : batch.status === 'undone' ? 'duplicate' : 'error'}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td>
                      {batch.imported} imported · {batch.skippedDuplicates} duplicates · {batch.failed} failed
                      {batch.errors.length > 0 && (
                        <>
                          <br />
                          <button type="button" onClick={() => downloadFailureReport(batch)}>
                            Download failure report
                          </button>
                        </>
                      )}
                    </td>
                    <td><small>{batch.batchId}</small></td>
                    <td>
                      {batch.status === 'undone' ? (
                        <span>Undone</span>
                      ) : confirmUndoBatchId === batch.batchId ? (
                        <div className="workflow-actions">
                          <button
                            className="danger-action"
                            type="button"
                            disabled={undoingBatchId === batch.batchId}
                            onClick={() => void undoBatch(batch.batchId)}
                          >
                            {undoingBatchId === batch.batchId ? 'Undoing...' : 'Confirm undo'}
                          </button>
                          <button type="button" onClick={() => setConfirmUndoBatchId('')}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Undo import ${batch.batchId}`}
                          onClick={() => setConfirmUndoBatchId(batch.batchId)}
                        >
                          <RotateCcw size={16} aria-hidden="true" /> Undo import
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No CSV imports have been recorded yet.</div>
        )}
      </div>

      <details className="panel csv-mapping-details">
        <summary>CSV column mapping · accepted headers</summary>
        <div className="mapping-grid">
          <span>Patient Name: `name`, `patient_name`, `full_name`, `Patient Name`</span>
          <span>Phone: `phone`, `Phone`</span>
          <span>Email: `email`, `Email`</span>
          <span>Requested Service: `service_needed`, `requested_service`, `service`, `Requested Service`</span>
          <span>Activity Context: `activity_context`, `movement_context`, `movement_pattern`, `Activity Context`, `Movement Context`, `Movement Pattern`</span>
          <span>Source: `source`, `Source`, `inquiry_source`</span>
          <span>Notes: `notes`, `message`, `Message`, `Notes`</span>
          <span>Patient Type: `patient_type`, `Patient Type`</span>
          <span>Appointment Status: `appointment_status`, `Appointment Status`, `Was Appointment Scheduled`</span>
          <span>Requested Appointment: `appointment_request`, `requested_appointment`, `Requested Appointment`</span>
          <span>Offer Type: `offer_type`, `Offer Type`, `Promotion`</span>
          <span>Last Visit Date: `last_visit_date`, `Last Visit Date`</span>
          <span>Visit Frequency: `expected_visit_frequency_days`, `visit_frequency_days`, `Visit Frequency Days`</span>
          <span>Follow-Up Owner: `assigned_follow_up_owner`, `follow_up_owner`, `Assigned Follow-Up Owner`</span>
          <span>Follow-Up Outcome: `follow_up_outcome`, `Follow-Up Outcome`</span>
        </div>
      </details>



    </section>
  );
}
