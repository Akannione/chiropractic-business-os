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

function isCbosPreviewHostname(hostname: string) {
  return hostname.startsWith('businessos') && hostname.endsWith('-tobi-oniyide-s-projects.vercel.app');
}

const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
const API_BASE_URL = isCbosPreviewHostname(currentHostname)
  ? '/api'
  : viteEnv.VITE_API_BASE_URL || (viteEnv.DEV ? 'http://localhost:4000/api' : '/api');
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
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: mergeHeaders(path, options),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Request failed.' }));
    if (response.status === 401 && token && !publicPaths.has(path)) {
      clearAuthToken();
      unauthorizedHandler?.();
    }
    throw new Error(body.message || 'Request failed.');
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
  sendDailySummary: () => request<ReminderResult>('/reminders/daily-summary', { method: 'POST' }),
  resetDemo: () => request<{ inserted: number }>('/demo/reset', { method: 'POST' }),
  downloadExportCsv: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/exports/inquiries.csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (response.status === 401 && token) {
      clearAuthToken();
      unauthorizedHandler?.();
      throw new Error('Staff login is required.');
    }
    if (!response.ok) throw new Error('CSV export failed.');
    return response.blob();
  },
  exportUrl: `${API_BASE_URL}/exports/inquiries.csv`,
};
