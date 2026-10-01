const REQUEST_TIMEOUT_MS = 30_000;

/** Keep the deadline active through body consumption, not just response headers. */
export async function withRequestTimeout<T>(
  action: (signal: AbortSignal) => Promise<T>,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await action(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('The request took too long. Check whether your changes were saved before trying again.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
