import { withRequestTimeout } from './requestTimeout';
import {
  Activity,
  AppConfig,
  AuthStatus,
  DuplicateGroups,
  ImportPreview,
  ImportResult,
  IntelligencePreview,
  Inquiry,
  InquiryPage,
  InquiryQuery,
  Kpis,
  LoginResult,
  MergeResult,
  MonthlySummary,
  PublicInquiryInput,
  ReactivationQueue,
  ReminderResult,
  WeeklySummary,
} from '../types';

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> }).env || {};

export function isCbosPreviewHostname(hostname: string) {
  return hostname.startsWith('businessos') && hostname.endsWith('-tobi-oniyide-s-projects.vercel.app');
}

export function resolveApiBaseUrl(
  environment: Record<string, string | boolean | undefined> = viteEnv,
  hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : '',
) {
  if (isCbosPreviewHostname(hostname)) return '/api';
  const configured = String(environment.VITE_API_BASE_URL || '');
  // Local Vite traffic uses its proxy, independent of the frontend's port.
  if (environment.DEV) {
    if (!configured || configured === '/api') return '/api';
    try {
      if (['localhost', '127.0.0.1', '[::1]'].includes(new URL(configured).hostname)) return '/api';
    } catch {
      // Keep intentional relative configuration unchanged.
    }
  }
  return configured || '/api';
}

const API_BASE_URL = resolveApiBaseUrl();
const isPreviewRuntime = isCbosPreviewHostname(
  typeof window !== 'undefined' && window.location ? window.location.hostname : '',
);
const authTokenKey = 'business-os-auth-token';
const publicPaths = new Set(['/auth/status', '/auth/login', '/config', '/public/inquiries']);
let unauthorizedHandler: (() => void) | null = null;

export function getAuthToken() {
  return window.sessionStorage.getItem(authTokenKey) || '';
}

export function setAuthToken(token: string) {
  // Keep the temporary shared-password session scoped to this browser tab.
  // Clear the legacy persistent token if a user upgrades from an older build.
  window.localStorage.removeItem(authTokenKey);
  window.sessionStorage.setItem(authTokenKey, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(authTokenKey);
  window.sessionStorage.removeItem(authTokenKey);
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function mergeHeaders(path: string, options?: RequestInit) {
  const token = getAuthToken();
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const optionHeaders = new Headers(options?.headers);
  optionHeaders.forEach((value, key) => headers.set(key, value));

  if (options?.body instanceof FormData) headers.delete('Content-Type');
  if (!options?.body && !optionHeaders.has('Content-Type')) headers.delete('Content-Type');
  if (publicPaths.has(path)) headers.delete('Authorization');

  return headers;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  return withRequestTimeout((signal) => requestWithSignal<T>(path, { ...options, signal }));
}

async function requestWithSignal<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: mergeHeaders(path, options),
    });
  } catch {
    throw new Error(
      isPreviewRuntime
        ? 'Unable to reach CBOS API (network error).'
        : 'CBOS is temporarily unavailable.',
    );
  }
  if (!response.ok) {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const body = isJson
      ? await response.json().catch(() => ({ message: '' })) as { message?: string }
      : { message: '' };
    if (response.status === 401 && token && !publicPaths.has(path)) {
      clearAuthToken();
      unauthorizedHandler?.();
    }
    throw new Error(
      body.message
        || (isPreviewRuntime
          ? `Unable to reach CBOS API (HTTP ${response.status}).`
          : 'CBOS is temporarily unavailable.'),
    );
  }
  return response.json() as Promise<T>;
}

export const api = {
  authStatus: () => request<AuthStatus>('/auth/status'),
  login: (password: string) =>
    request<LoginResult>('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  config: () => request<AppConfig>('/config'),
  verifyStaffSession: () => request<InquiryPage>('/inquiries?pageSize=1'),
  inquiries: (query: InquiryQuery = {}) => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));
    if (query.search?.trim()) params.set('search', query.search.trim());
    if (query.status && query.status !== 'All') params.set('status', query.status);
    if (query.source && query.source !== 'All') params.set('source', query.source);
    if (query.followUp && query.followUp !== 'All') params.set('followUp', query.followUp);
    const suffix = params.toString();
    return request<InquiryPage>(`/inquiries${suffix ? `?${suffix}` : ''}`);
  },
  duplicates: () => request<DuplicateGroups>('/duplicates'),
  mergeInquiries: (targetId: string, sourceId: string) =>
    request<MergeResult>(`/inquiries/${targetId}/merge`, {
      method: 'POST',
      body: JSON.stringify({ sourceId }),
    }),
  reactivations: () => request<ReactivationQueue>('/reactivations'),
  activities: () => request<Activity[]>('/activities'),
  kpis: () => request<Kpis>('/kpis'),
  weeklySummary: () => request<WeeklySummary>('/weekly-summary'),
  monthlySummary: () => request<MonthlySummary>('/monthly-summary'),
  createInquiry: (payload: Partial<Inquiry>) =>
    request<Inquiry>('/inquiries', { method: 'POST', body: JSON.stringify(payload) }),
  createPublicInquiry: (payload: PublicInquiryInput) =>
    request<Inquiry>('/public/inquiries', { method: 'POST', body: JSON.stringify(payload) }),
  updateInquiry: (id: string, payload: Partial<Inquiry>) =>
    request<Inquiry>(`/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  previewImportCsv: (csvText: string) =>
    request<ImportPreview>('/imports/inquiries.csv/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csvText,
    }),
  importCsv: (csvText: string) =>
    request<ImportResult>('/imports/inquiries.csv', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csvText,
    }),
  previewIntelligence: (files: Array<{ name: string; csvText: string }>) =>
    request<IntelligencePreview>('/intelligence/preview', {
      method: 'POST',
      body: JSON.stringify({ files }),
    }),
  sendDailySummary: () => request<ReminderResult>('/reminders/daily-summary', { method: 'POST' }),
  resetDemo: () => request<{ inserted: number }>('/demo/reset', { method: 'POST' }),
  downloadExportCsv: async () => {
    return withRequestTimeout(async (signal) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/exports/inquiries.csv`, {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status === 401 && token) {
        clearAuthToken();
        unauthorizedHandler?.();
        throw new Error('Staff login is required.');
      }
      if (!response.ok) throw new Error('CSV export failed.');
      return await response.blob();
    });
  },
  exportUrl: `${API_BASE_URL}/exports/inquiries.csv`,
};
