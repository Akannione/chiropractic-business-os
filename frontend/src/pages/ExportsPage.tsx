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
        <a className="primary-button" href={api.exportUrl}>
          Download CSV
        </a>
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
