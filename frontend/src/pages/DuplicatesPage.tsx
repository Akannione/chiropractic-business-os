import { useEffect, useState } from 'react';
import { Panel } from '../components/Panel';
import { StatusChip } from '../components/StatusChip';
import { api } from '../services/api';
import type { Inquiry } from '../types';
import { displayDate, money } from '../utils/format';

type DuplicatesPageProps = {
  onChanged: (message: string) => Promise<void>;
  setError: (message: string) => void;
};

/** Fields worth comparing when deciding which record to keep. */
const COMPARED_FIELDS: { label: string; read: (inquiry: Inquiry) => string }[] = [
  { label: 'Phone', read: (i) => i.phone || '—' },
  { label: 'Email', read: (i) => i.email || '—' },
  { label: 'Requested Service', read: (i) => i.service_needed || '—' },
  { label: 'Source', read: (i) => i.source || '—' },
  { label: 'Estimated Value', read: (i) => money(i.estimated_value) },
  { label: 'Next Follow-Up', read: (i) => displayDate(i.next_follow_up_date) || '—' },
  { label: 'Last Visit', read: (i) => displayDate(i.last_visit_date) || '—' },
  { label: 'Follow-Up Owner', read: (i) => i.assigned_follow_up_owner || '—' },
  { label: 'Notes', read: (i) => i.notes || '—' },
];

export function DuplicatesPage({ onChanged, setError }: DuplicatesPageProps) {
  const [groups, setGroups] = useState<Inquiry[][]>([]);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState('');
  const [confirming, setConfirming] = useState('');

  async function load() {
    setLoading(true);
    try {
      const result = await api.duplicates();
      setGroups(result.groups);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /** Folds every other record in the group into the one staff chose to keep. */
  async function merge(group: Inquiry[], keep: Inquiry) {
    setError('');
    setMerging(keep.id);
    try {
      for (const other of group.filter((inquiry) => inquiry.id !== keep.id)) {
        await api.mergeInquiries(keep.id, other.id);
      }
      await load();
      await onChanged(`Merged into ${keep.name}.`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setMerging('');
      setConfirming('');
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Possible Duplicates</h2>
        <p>
          Patients who appear more than once, usually because the intake form was submitted twice.
          People who share a phone number or email but have different names are treated as a
          household, not a duplicate, and are not listed here.
        </p>
      </div>

      {loading ? (
        <div className="empty-state">Checking for duplicates...</div>
      ) : !groups.length ? (
        <div className="empty-state">No duplicate patient inquiries found.</div>
      ) : (
        groups.map((group) => (
          <Panel
            key={group.map((inquiry) => inquiry.id).join('-')}
            title={group[0].name}
            description={`${group.length} records look like the same patient. Choose the one to keep; the others are merged into it.`}
          >
            <div className="duplicate-grid">
              {group.map((inquiry) => (
                <div className="duplicate-card" key={inquiry.id}>
                  <div className="duplicate-card-head">
                    <StatusChip status={inquiry.status} />
                    <small>Added {displayDate(inquiry.created_at?.slice(0, 10))}</small>
                  </div>

                  <dl className="duplicate-fields">
                    {COMPARED_FIELDS.map((field) => {
                      const value = field.read(inquiry);
                      // Flag values that differ across the group so staff can
                      // see what a merge would have to reconcile.
                      const differs = group.some((other) => field.read(other) !== value);
                      return (
                        <div key={field.label} className={differs ? 'duplicate-field differs' : 'duplicate-field'}>
                          <dt>{field.label}</dt>
                          <dd>{value}</dd>
                        </div>
                      );
                    })}
                  </dl>

                  {confirming === inquiry.id ? (
                    <div className="duplicate-confirm">
                      <p>
                        Keep this record and permanently delete the other
                        {group.length > 2 ? ' records' : ' record'}? Details missing here are copied
                        across first, and the notes and history of both are kept.
                      </p>
                      <div className="duplicate-actions">
                        <button
                          type="button"
                          className="danger"
                          disabled={Boolean(merging)}
                          onClick={() => merge(group, inquiry)}
                        >
                          {merging === inquiry.id ? 'Merging...' : 'Yes, merge'}
                        </button>
                        <button type="button" onClick={() => setConfirming('')} disabled={Boolean(merging)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={Boolean(merging)}
                      onClick={() => setConfirming(inquiry.id)}
                    >
                      Keep this one
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        ))
      )}
    </section>
  );
}
