import { safeTelemetryProperties, safeOutboundProperties } from './telemetryPolicy';

const DEFAULT_POSTHOG_KEY = 'phc_sN4egUctDKmLqLnvqm6HmJ8oPkdyFynAb7XfHWv2WqNC';
type SafeProperties = Record<string, string | number | boolean | null | undefined>;
type PendingEvent = { event: string; properties: SafeProperties };

let initialized = false;
let enabled = false;
let client: typeof import('posthog-js').default | null = null;
const pending: PendingEvent[] = [];

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // Keep automated/local traffic out of product analytics.
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || navigator.webdriver) return;

  const key = import.meta.env.VITE_POSTHOG_KEY || DEFAULT_POSTHOG_KEY;
  if (!key) return;
  enabled = true;

  // Analytics is deliberately lazy-loaded so instrumentation never blocks the
  // front-desk application bundle or its first render.
  void import('posthog-js').then(({ default: posthog }) => {
    client = posthog;
    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_exceptions: false,
      capture_performance: false,
      disable_surveys: true,
      disable_external_dependency_loading: true,
      advanced_disable_flags: true,
      disable_session_recording: true,
      person_profiles: 'never',
      persistence: 'memory',
      before_send: (event) => {
        if (!event) return null;
        const properties = safeOutboundProperties(event.event, event.properties, key);
        return properties ? { ...event, properties } : null;
      },
    });
    pending.splice(0).forEach(({ event, properties }) => posthog.capture(event, properties));
  }).catch(() => {
    enabled = false;
    pending.length = 0;
  });
}

export function captureTelemetry(event: string, properties: SafeProperties = {}) {
  if (!enabled) return;
  const safeProperties = safeTelemetryProperties(event, properties);
  if (!safeProperties) return;
  // Callers may only send low-cardinality workflow metadata. Never pass names,
  // contact details, notes, free text, CSV contents, record IDs, or source rows.
  if (client) {
    client.capture(event, safeProperties);
    return;
  }
  if (pending.length < 100) pending.push({ event, properties: safeProperties });
}
