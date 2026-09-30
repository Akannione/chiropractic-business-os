import type { View } from './types';

export const viewPaths: Record<View, string> = {
  dashboard: '/',
  inquiries: '/inquiries',
  reactivations: '/reactivations',
  pipeline: '/pipeline',
  summary: '/owner-review',
  intelligence: '/intelligence',
  monthly: '/monthly-report',
  activity: '/activity',
  duplicates: '/duplicates',
  exports: '/import-export',
  'public-intake': '/intake',
  settings: '/settings',
};

const pathViews = new Map(Object.entries(viewPaths).map(([view, path]) => [path, view as View]));

export function viewFromPath(pathname: string): View {
  const normalized = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
  return pathViews.get(normalized) || 'dashboard';
}

export function pathForView(view: View) {
  return viewPaths[view];
}
