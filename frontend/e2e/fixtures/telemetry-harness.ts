import posthog from 'posthog-js';
import { initAnalytics } from '../../src/services/analytics';

export async function captureWithSdk() {
  initAnalytics();
  for (let attempt = 0; attempt < 100 && !posthog.__loaded; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  if (!posthog.__loaded) throw new Error('Analytics SDK did not initialize');
  posthog.register({ unexpected_super_property: 'PRIVATE_SENTINEL' });
  const captured = posthog.capture('workspace_viewed', { workspace: 'inquiries', name: 'PRIVATE_SENTINEL' });
  const rejected = posthog.capture('unapproved_event', { name: 'PRIVATE_SENTINEL' });
  return { captured, rejected: rejected ?? null };
}
