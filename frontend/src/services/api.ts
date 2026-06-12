import { AppConfig, ImportPreview, ImportResult, Inquiry, Kpis, PublicInquiryInput, WeeklySummary } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Request failed.' }));
    throw new Error(body.message || 'Request failed.');
  }
  return response.json() as Promise<T>;
}

export const api = {
  config: () => request<AppConfig>('/config'),
  inquiries: () => request<Inquiry[]>('/inquiries'),
  kpis: () => request<Kpis>('/kpis'),
  weeklySummary: () => request<WeeklySummary>('/weekly-summary'),
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
  resetDemo: () => request<{ inserted: number }>('/demo/reset', { method: 'POST' }),
  exportUrl: `${API_BASE_URL}/exports/inquiries.csv`,
};
