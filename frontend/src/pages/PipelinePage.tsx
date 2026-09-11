import { ArrowRight, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Panel } from '../components/Panel';
import { StatusChip } from '../components/StatusChip';
import { api } from '../services/api';
import type { AppConfig, Inquiry, InquiryStatus } from '../types';
import { displayDate, money } from '../utils/format';

type PipelinePageProps = {
  config: AppConfig | null;
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

const BOARD_PAGE_SIZE = 100;

function openPipelineValue(inquiries: Inquiry[]) {
  return inquiries
    .filter((inquiry) => inquiry.status !== 'Lost')
    .reduce((total, inquiry) => total + Number(inquiry.estimated_value || 0), 0);
}

export function PipelinePage({ config, onChanged, setError }: PipelinePageProps) {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  const statuses = useMemo<InquiryStatus[]>(
    () =>
      config?.statuses || [
        'New Inquiry',
        'Consultation Scheduled',
        'Active Patient',
        'Lost',
        'Follow-Up Needed',
      ],
    [config],
  );

  const grouped = useMemo(
    () =>
      statuses.map((status) => {
        const inquiries = rows.filter((inquiry) => inquiry.status === status);
        return {
          status,
          inquiries,
          value: openPipelineValue(inquiries),
        };
      }),
    [rows, statuses],
  );

  async function loadBoard() {
    setLoading(true);
    setError('');
    try {
      const result = await api.inquiries({ pageSize: BOARD_PAGE_SIZE });
      setRows(result.rows);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBoard();
  }, []);

  async function moveInquiry(inquiry: Inquiry, status: InquiryStatus) {
    if (status === inquiry.status) return;
    setUpdatingId(inquiry.id);
    setError('');
    try {
      await api.updateInquiry(inquiry.id, { status });
      await loadBoard();
      await onChanged(`${inquiry.name} moved to ${status}.`);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <section className="stack">
      <div className="section-heading section-heading-row">
        <div>
          <h2>Patient Pipeline Board</h2>
          <p>
            See every inquiry by current status and move patients forward without
            digging through a table.
          </p>
        </div>
        <button className="primary-button secondary" type="button" onClick={loadBoard}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <Panel
        title="Pipeline Overview"
        description="A simple board for reviewing where patient inquiries stand today."
      >
        {loading ? (
          <div className="empty-state">Loading patient pipeline...</div>
        ) : rows.length ? (
          <div className="pipeline-board" aria-label="Patient inquiry pipeline board">
            {grouped.map((column) => (
              <section className="pipeline-column" key={column.status}>
                <div className="pipeline-column-heading">
                  <div>
                    <StatusChip status={column.status} />
                    <span>
                      {column.inquiries.length} {column.inquiries.length === 1 ? 'inquiry' : 'inquiries'}
                    </span>
                  </div>
                  <strong>{money(column.value)}</strong>
                </div>
                <div className="pipeline-cards">
                  {column.inquiries.length ? (
                    column.inquiries.map((inquiry) => (
                      <article className="pipeline-card" key={inquiry.id}>
                        <div className="pipeline-card-head">
                          <strong>{inquiry.name}</strong>
                          <span>{money(inquiry.estimated_value)}</span>
                        </div>
                        <p>{inquiry.service_needed}</p>
                        {inquiry.activity_context && <small>{inquiry.activity_context}</small>}
                        <small>Follow-up: {displayDate(inquiry.next_follow_up_date)}</small>
                        <label>
                          Move To
                          <select
                            disabled={updatingId === inquiry.id}
                            value={inquiry.status}
                            onChange={(event) =>
                              void moveInquiry(inquiry, event.target.value as InquiryStatus)
                            }
                          >
                            {statuses.map((status) => (
                              <option key={status}>{status}</option>
                            ))}
                          </select>
                        </label>
                      </article>
                    ))
                  ) : (
                    <div className="empty-inline">No patients in this stage.</div>
                  )}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            No patient inquiries yet. Add an inquiry or reset demo data to populate the board.
          </div>
        )}
      </Panel>

      <div className="notice">
        <strong>How to use this board:</strong> start on the left, work unresolved
        inquiries, and move each patient toward scheduled, active, follow-up, or lost.
        <ArrowRight size={15} />
      </div>
    </section>
  );
}
