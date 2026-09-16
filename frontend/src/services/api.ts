import {
  Activity,
  AppConfig,
  AuthStatus,
  DuplicateGroups,
  ImportPreview,
  ImportResult,
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

export function resolveApiBaseUrl(
  environment: Record<string, string | boolean | undefined> = viteEnv,
  hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : '',
) {
  // Git-linked branch previews run on account-scoped Vercel hostnames. Route
  // those requests through the frontend deployment itself so the browser sees
  // a same-origin /api request; Vercel proxies it to the CBOS API. Production
  // keeps its explicit API URL and its strict production CORS policy.
  const isCbosVercelPreview =
    hostname.startsWith('businessos') &&
    hostname.endsWith('-tobi-oniyide-s-projects.vercel.app');

  if (isCbosVercelPreview) return '/api';
  return environment.VITE_API_BASE_URL || (environment.DEV ? 'http://localhost:4000/api' : '/api');
}

const API_BASE_URL = resolveApiBaseUrl();
const authTokenKey = 'business-os-auth-token';
const publicPaths = new Set(['/auth/status', '/auth/login', '/config', '/public/inquiries']);
let unauthorizedHandler: (() => void) | null = null;

export function getAuthToken() {
  return window.localStorage.getItem(authTokenKey) || '';
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(authTokenKey, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(authTokenKey);
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: mergeHeaders(path, options),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: `Request failed (${response.status})` }));
    if (response.status === 401 && !publicPaths.has(path)) {
      clearAuthToken();
      unauthorizedHandler?.();
    }
    throw new Error(body.message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function toQueryString(params: InquiryQuery = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'All') return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const api = {
  authStatus: () => request<AuthStatus>('/auth/status'),
  login: (password: string) =>
    request<LoginResult>('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  verifyStaffSession: () => request<{ ok: boolean }>('/auth/verify'),
  config: () => request<AppConfig>('/config'),
  kpis: () => request<Kpis>('/kpis'),
  inquiries: (params: InquiryQuery = {}) => request<InquiryPage>(`/inquiries${toQueryString(params)}`),
  inquiry: (id: string) => request<Inquiry>(`/inquiries/${id}`),
  createInquiry: (input: Partial<Inquiry>) =>
    request<Inquiry>('/inquiries', { method: 'POST', body: JSON.stringify(input) }),
  createPublicInquiry: (input: PublicInquiryInput) =>
    request<Inquiry>('/public/inquiries', { method: 'POST', body: JSON.stringify(input) }),
  updateInquiry: (id: string, input: Partial<Inquiry>) =>
    request<Inquiry>(`/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteInquiry: (id: string) => request<{ ok: boolean }>(`/inquiries/${id}`, { method: 'DELETE' }),
  followUps: () => request<Inquiry[]>('/follow-ups'),
  reactivations: () => request<ReactivationQueue>('/reactivations'),
  weeklySummary: () => request<WeeklySummary>('/summary/weekly'),
  monthlySummary: () => request<MonthlySummary>('/summary/monthly'),
  activities: () => request<Activity[]>('/activity'),
  duplicates: () => request<DuplicateGroups>('/duplicates'),
  mergeDuplicates: (ids: string[]) =>
    request<MergeResult>('/duplicates/merge', { method: 'POST', body: JSON.stringify({ ids }) }),
  resetDemo: () => request<{ message: string }>('/demo/reset', { method: 'POST' }),
  sendReminder: (id: string) => request<ReminderResult>(`/inquiries/${id}/reminder`, { method: 'POST' }),
  previewImportCsv: (csv: string) =>
    request<ImportPreview>('/imports/inquiries/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    }),
  importCsv: (csv: string) =>
    request<ImportResult>('/imports/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    }),
};
