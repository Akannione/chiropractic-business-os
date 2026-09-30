import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['OpenAI secret key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['Stripe live secret', /\bsk_live_[A-Za-z0-9]{16,}\b/g],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{16,}\b/g],
];

const findings = [];
for (const file of files) {
  let stat;
  try {
    stat = statSync(file);
  } catch {
    continue;
  }
  if (!stat.isFile() || stat.size > 1_000_000) continue;

  const buffer = readFileSync(file);
  if (buffer.includes(0)) continue;
  const text = buffer.toString('utf8');

  for (const [label, pattern] of patterns) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) findings.push(`${file}: possible ${label}`);
  }

  const mongo = /mongodb\+srv:\/\/([^:\s/]+):([^@\s/]+)@/g;
  for (const match of text.matchAll(mongo)) {
    const password = match[2];
    const placeholder = /^(?:PASSWORD|PASS|REPLACE_ME|CHANGE_ME|YOUR_[A-Z0-9_]+|<[^>]+>|\$\{[^}]+\})$/i.test(password);
    if (!placeholder) findings.push(`${file}: possible MongoDB credential`);
  }
}

if (findings.length) {
  console.error('Tracked-secret scan failed. Remove or rotate the credential before continuing:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Tracked-secret scan passed across ${files.length} tracked files.`);
