import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import { api } from '../services/api';
import type {
  AppConfig,
  FollowUpOutcome,
  ReactivationQueue,
  ReactivationRow,
  ReactivationStatus,
} from '../types';
import { displayDate } from '../utils/format';

type ReactivationsPageProps = {
  config: AppConfig | null;
  queue: ReactivationQueue;
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

type FollowUpForm = {
  assigned_follow_up_owner: string;
  follow_up_outcome: FollowUpOutcome;
  next_follow_up_date: string;
  last_visit_date: string;
  expected_visit_frequency_days: number;
  notes: string;
};

type QueueFilter = 'All' | ReactivationStatus;

function formFromRow(row: ReactivationRow): FollowUpForm {
  return {
    assigned_follow_up_owner: row.assigned_follow_up_owner,
    follow_up_outcome: row.follow_up_outcome,
    next_follow_up_date: row.next_follow_up_date,
    last_visit_date: row.last_visit_date,
    expected_visit_frequency_days: row.expected_visit_frequency_days,
    notes: row.notes,
  };
}

export function ReactivationsPage({
  config,
  queue,
  onChanged,
  setError,
}: ReactivationsPageProps) {
  const [filter, setFilter] = useState<QueueFilter>('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState<FollowUpForm | null>(null);

  const owners = useMemo(
    () =>
      Array.from(
        new Set(queue.rows.map((row) => row.assigned_follow_up_owner).filter(Boolean)),
      ).sort(),
    [queue.rows],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return queue.rows.filter((row) => {
      const matchesFilter = filter === 'All' || row.reactivation_status === filter;
      const matchesOwner =
        ownerFilter === 'All' || row.assigned_follow_up_owner === ownerFilter;
      const searchText = [row.name, row.phone, row.email, row.service_needed, row.notes]
        .join(' ')
        .toLowerCase();
      return (
        matchesFilter &&
        matchesOwner &&
        (!normalizedSearch || searchText.includes(normalizedSearch))
      );
    });
  }, [filter, ownerFilter, queue.rows, search]);

  const selectedRow = useMemo(
    () => queue.rows.find((row) => row.id === selectedId) || filteredRows[0] || null,
    [filteredRows, queue.rows, selectedId],
  );

  useEffect(() => {
    if (!selectedRow) {
      setSelectedId('');
      setForm(null);
      return;
    }
    setSelectedId(selectedRow.id);
    setForm(formFromRow(selectedRow));
  }, [selectedRow?.id, queue.rows]);

  async function saveFollowUp(event: FormEvent) {
    event.preventDefault();
    if (!selectedRow || !form) return;
    setError('');
    try {
      await api.updateInquiry(selectedRow.id, form);
      await onChanged('Reactivation follow-up updated.');
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Patient Reactivations</h2>
        <p>
          See patients whose expected return date is overdue, due today, or coming up,
          then record the follow-up result.
        </p>
      </div>

      <div className="kpi-grid small">
        <KpiCard
          label="Overdue"
          value={String(queue.overdue)}
          help="Patients past their expected return date."
          warning
        />
        <KpiCard
          label="Due Today"
          value={String(queue.dueToday)}
          help="Patients whose expected return date is today."
          featured
        />
        <KpiCard
          label="Upcoming"
          value={String(queue.upcoming)}
          help="Patients approaching their expected return date."
        />
        <KpiCard
          label="Queue Total"
          value={String(queue.rows.length)}
          help="Patients with enough visit information to calculate a return date."
          success
        />
      </div>

      <Panel
        title="Call List"
        description="Start with overdue patients. Use filters to assign and work the list with your team."
      >
        <div className="filter-grid reactivation-filters">
          <label>
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Patient, phone, service, or notes"
            />
          </label>
          <label>
            Timing
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as QueueFilter)}
            >
              <option>All</option>
              <option>Overdue</option>
              <option>Due Today</option>
              <option>Upcoming</option>
            </select>
          </label>
          <label>
            Follow-Up Owner
            <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
              <option>All</option>
              {owners.map((owner) => <option key={owner}>{owner}</option>)}
            </select>
          </label>
        </div>

        {filteredRows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Return Timing</th>
                  <th>Last Visit</th>
                  <th>Expected Every</th>
                  <th>Owner</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    className={`reactivation-row ${selectedRow?.id === row.id ? 'selected' : ''}`}
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td>
                      <strong>{row.name}</strong>
                      <span>{row.phone}</span>
                    </td>
                    <td>
                      <span className={`urgency-label ${row.reactivation_status.toLowerCase().replace(' ', '-')}`}>
                        {row.reactivation_status}
                      </span>
                      <small>
                        {row.days_overdue
                          ? `${row.days_overdue} days overdue`
                          : displayDate(row.next_reactivation_date)}
                      </small>
                    </td>
                    <td>{displayDate(row.last_visit_date)}</td>
                    <td>{row.expected_visit_frequency_days} days</td>
                    <td>{row.assigned_follow_up_owner || 'Unassigned'}</td>
                    <td>{row.follow_up_outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No patients match these reactivation filters. Add a last visit date and expected
            visit frequency in Patient Inquiries to place someone in this queue.
          </div>
        )}
      </Panel>

      <Panel
        title={selectedRow ? `Follow Up With ${selectedRow.name}` : 'Follow-Up Details'}
        description="Record ownership, outcome, and the next action without changing the practice's EHR or schedule."
      >
        {selectedRow && form ? (
          <form className="inquiry-form" onSubmit={saveFollowUp}>
            <div className="detail-summary full">
              <div>
                <strong>{selectedRow.phone}</strong>
                <span>{selectedRow.email} · {selectedRow.service_needed}</span>
              </div>
              <span className={`urgency-label ${selectedRow.reactivation_status.toLowerCase().replace(' ', '-')}`}>
                {selectedRow.reactivation_status}
              </span>
            </div>
            <label>
              Follow-Up Owner
              <input
                value={form.assigned_follow_up_owner}
                onChange={(event) =>
                  setForm({ ...form, assigned_follow_up_owner: event.target.value })
                }
                placeholder="Front Desk, Doctor, or staff name"
              />
            </label>
            <label>
              Follow-Up Outcome
              <select
                value={form.follow_up_outcome}
                onChange={(event) =>
                  setForm({
                    ...form,
                    follow_up_outcome: event.target.value as FollowUpOutcome,
                  })
                }
              >
                {(config?.followUpOutcomes || ['Not Contacted']).map((outcome) => (
                  <option key={outcome}>{outcome}</option>
                ))}
              </select>
            </label>
            <label>
              Last Visit Date
              <input
                type="date"
                value={form.last_visit_date}
                onChange={(event) => setForm({ ...form, last_visit_date: event.target.value })}
              />
            </label>
            <label>
              Expected Visit Frequency
              <div className="input-with-suffix">
                <input
                  min="1"
                  type="number"
                  value={form.expected_visit_frequency_days}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      expected_visit_frequency_days: Number(event.target.value),
                    })
                  }
                />
                <span>days</span>
              </div>
            </label>
            <label>
              Next Follow-Up Date
              <input
                type="date"
                value={form.next_follow_up_date}
                onChange={(event) =>
                  setForm({ ...form, next_follow_up_date: event.target.value })
                }
              />
            </label>
            <label className="full">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </label>
            <button className="primary-button full" type="submit">
              Save Follow-Up
            </button>
          </form>
        ) : (
          <div className="empty-state">Select a patient from the call list to update follow-up details.</div>
        )}
      </Panel>
    </section>
  );
}
