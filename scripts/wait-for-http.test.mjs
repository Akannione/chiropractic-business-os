import { createServer } from 'node:http';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import test from 'node:test';
import { waitForHttp } from './wait-for-http.mjs';

async function withServer(handler, run) {
  const server = createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

test('accepts a ready service', async () => {
  await withServer((req, res) => res.end('ok'), url => waitForHttp(url));
});

test('retries a starting service', async () => {
  let attempts = 0;
  await withServer((req, res) => {
    res.statusCode = ++attempts < 3 ? 503 : 200;
    res.end();
  }, url => waitForHttp(url, { timeoutMs: 2000, intervalMs: 10 }));
  assert.equal(attempts, 3);
});

test('rejects a service that never becomes ready', async () => {
  await withServer((req, res) => {
    res.statusCode = 503;
    res.end();
  }, url => assert.rejects(waitForHttp(url, { timeoutMs: 100, intervalMs: 10 }), /Service not ready.*HTTP 503/));
});

test('bounds a request that never responds', async () => {
  await withServer(() => {}, url => assert.rejects(
    waitForHttp(url, { timeoutMs: 100, intervalMs: 10 }), /Service not ready/));
});
