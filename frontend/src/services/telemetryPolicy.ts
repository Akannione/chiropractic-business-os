import { viewPaths } from '../routing';

type Rule = (value: unknown) => boolean;
const oneOf = (...values: string[]): Rule => (value) => typeof value === 'string' && values.includes(value);
const count: Rule = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const schemas: Record<string, Record<string, Rule>> = {
  workspace_viewed: { workspace: oneOf(...Object.keys(viewPaths)) },
  inquiry_created: { entry_point: oneOf('staff_drawer') },
  follow_up_action_completed: { resulting_status: oneOf('New Inquiry', 'Consultation Scheduled', 'Active Patient', 'Lost', 'Follow-Up Needed') },
  intelligence_preview_completed: { source: oneOf('sample', 'upload'), files_received: count, recognized_reports: count, signals_found: count },
  csv_import_previewed: { importable_rows: count, error_count: count },
  csv_import_completed: { imported_rows: count, skipped_duplicates: count },
  duplicate_merge_completed: { records_merged: count },
  public_intake_submitted: {},
  demo_data_reset: {},
};

/** Drop unknown keys and invalid values, including free text in known keys. */
export function safeTelemetryProperties(event: string, properties: Record<string, unknown> = {}) {
  if (!Object.hasOwn(schemas, event)) return null;
  const result: Record<string, string | number | boolean> = {};
  for (const [key, rule] of Object.entries(schemas[event])) {
    const value = properties[key];
    if (Object.hasOwn(properties, key) && rule(value)) result[key] = value as string | number;
  }
  return result;
}

/** The SDK adds URL/referrer/super-properties even with autocapture off.
 * Rebuild the outbound properties so those values cannot bypass our contract.
 */
export function safeOutboundProperties(event: string, properties: Record<string, unknown>, token: string) {
  const result = safeTelemetryProperties(event, properties);
  if (!result) return null;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  for (const key of ['distinct_id', '$device_id', '$session_id', '$window_id']) {
    const value = properties[key];
    if (typeof value === 'string' && uuid.test(value)) result[key] = value;
  }
  // Anonymous SDK identity is required; never forward an identified user value.
  if (!result.distinct_id) return null;
  result.token = token;
  result.$process_person_profile = false;
  // Explicitly disable server-side GeoIP enrichment for every CBOS analytics event.
  // Approximate location is not needed to measure front-desk workflow adoption.
  result.$geoip_disable = true;
  return result;
}
