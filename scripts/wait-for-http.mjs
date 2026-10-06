import { pathToFileURL } from 'node:url';

export async function waitForHttp(url, { timeoutMs = 30000, intervalMs = 1000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let reason = 'No response';
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(Math.max(1, Math.min(2000, deadline - Date.now()))),
        redirect: 'error',
      });
      await response.body?.cancel();
      if (response.ok) return;
      reason = `HTTP ${response.status}`;
    } catch (error) {
      reason = error.message;
    }
    const remaining = deadline - Date.now();
    if (remaining > 0) await new Promise(resolve => setTimeout(resolve, Math.min(intervalMs, remaining)));
  }
  throw new Error(`Service not ready within ${timeoutMs}ms: ${url} (${reason})`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const urls = process.argv.slice(2);
  if (!urls.length) {
    console.error('Usage: node scripts/wait-for-http.mjs URL [URL ...]');
    process.exitCode = 1;
  } else {
    try {
      for (const url of urls) {
        await waitForHttp(url);
        console.log(`Ready: ${url}`);
      }
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
