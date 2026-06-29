import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '../services/api';
import type { ImportPreview, Inquiry } from '../types';

type ExportsPageProps = {
  inquiries: Inquiry[];
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

export function ExportsPage({ inquiries, onChanged, setError }: ExportsPageProps) {
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const previewRows = useMemo(() => preview?.rows.slice(0, 8) || [], [preview]);

  async function handleFile(file: File | null) {
    setError('');
    setPreview(null);
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    try {
      setPreview(await api.previewImportCsv(text));
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  async function importCsv() {
    if (!csvText || !preview?.importableRows) return;
    setImporting(true);
    setError('');
    try {
      const result = await api.importCsv(csvText);
      setCsvText('');
      setPreview(null);
      await onChanged(
        `${result.imported} patient inquiries imported. ${result.skippedDuplicates} duplicate rows skipped.`,
      );
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setImporting(false);
    }
  }

  async function downloadCsv() {
    setError('');
    try {
      const blob = await api.downloadExportCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patient_inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Exports</h2>
        <p>Download practice-facing CSV files or import an existing inquiry list without creating duplicates.</p>
      </div>
      <div className="export-card">
        <Download />
        <div>
          <h3>Patient Inquiries CSV</h3>
          <p>{inquiries.length ? `${inquiries.length} patient inquiries ready to export.` : 'No export data yet.'}</p>
        </div>
        <button className="primary-button" type="button" onClick={downloadCsv}>
          Download CSV
        </button>
      </div>

      <div className="export-card import-card">
        <Download />
        <div>
          <h3>Import Existing Patient Inquiries</h3>
          <p>
            Upload a CSV to preview rows first. Duplicate emails or phone numbers are skipped during import.
          </p>
          <input
            accept=".csv,text/csv"
            type="file"
            onChange={(event) => handleFile(event.target.files?.[0] || null)}
          />
        </div>
        <button
          className="primary-button"
          type="button"
          disabled={!preview?.importableRows || importing}
          onClick={importCsv}
        >
          {importing ? 'Importing...' : 'Import Previewed Rows'}
        </button>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <h3>CSV Column Mapping</h3>
          <p>Rename client spreadsheet columns to one of these accepted headers before uploading.</p>
        </div>
        <div className="mapping-grid">
          <span>Patient Name: `name`, `patient_name`, `full_name`, `Patient Name`</span>
          <span>Phone: `phone`, `Phone`</span>
          <span>Email: `email`, `Email`</span>
          <span>Requested Service: `service_needed`, `requested_service`, `service`, `Requested Service`</span>
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
      </div>

      {preview && (
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Import Preview</h3>
              <p>
                {preview.importableRows} ready, {preview.duplicateRows} duplicates, {preview.errorRows} rows need cleanup.
              </p>
            </div>
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={row.rowNumber}>
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
                        {row.duplicate
                          ? 'Duplicate'
                          : row.errors.length
                            ? row.errors.join(' ')
                            : 'Ready'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No importable rows were found in this CSV.</div>
          )}
        </div>
      )}
    </section>
  );
}
