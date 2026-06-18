import {
  Activity,
  AppConfig,
  AuthStatus,
  ImportPreview,
  ImportResult,
  Inquiry,
  Kpis,
  LoginResult,
  MonthlySummary,
  PublicInquiryInput,
  ReminderResult,
  WeeklySummary,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '');
const authTokenKey = 'business-os-auth-token';

export function getAuthToken() {
  return window.localStorage.getItem(authTokenKey) || '';
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(authTokenKey, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(authTokenKey);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Production API URL is not configured. Set VITE_API_BASE_URL to the deployed backend URL.');
  }
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Request failed.' }));
    throw new Error(body.message || 'Request failed.');
  }
  return response.json() as Promise<T>;
}

export const api = {
  authStatus: () => request<AuthStatus>('/auth/status'),
  login: (password: string) =>
    request<LoginResult>('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  config: () => request<AppConfig>('/config'),
  inquiries: () => request<Inquiry[]>('/inquiries'),
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
    if (!API_BASE_URL) {
      throw new Error('Production API URL is not configured. Set VITE_API_BASE_URL to the deployed backend URL.');
    }
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/exports/inquiries.csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('CSV export failed.');
    return response.blob();
  },
  exportUrl: `${API_BASE_URL}/exports/inquiries.csv`,
};
