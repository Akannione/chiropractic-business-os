import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(repoRoot, 'frontend/dist');
const html = readFileSync(resolve(distRoot, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/g)].map((match) => match[1]);

assert.equal(scripts.length, 1, 'CBOS should ship one critical entry module.');
assert.ok(!html.includes('modulepreload'), 'Lazy analytics/vendor chunks must not be module-preloaded into the critical path.');

const entryPath = resolve(distRoot, scripts[0].replace(/^\//, ''));
const entryBytes = statSync(entryPath).size;
const maxEntryBytes = 350 * 1024;
assert.ok(
  entryBytes <= maxEntryBytes,
  `Critical frontend JS grew to ${entryBytes} bytes; budget is ${maxEntryBytes}. Keep analytics/large optional code lazy-loaded.`,
);

console.log(`Frontend bundle budget passed: critical JS ${entryBytes} bytes / ${maxEntryBytes} max.`);
