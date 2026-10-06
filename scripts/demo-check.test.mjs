import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDemoResponses } from './demo-check.mjs';

const valid = () => ({ health: { ok: true }, config: { demoMode: true, statuses: ['New Inquiry'] }, auth: { authEnabled: false } });
test('accepts open fake-data demo', () => assert.match(validateDemoResponses(valid()), /no staff password/));
test('describes protected demo accurately', () => {
  const input = valid();
  input.auth.authEnabled = true;
  assert.match(validateDemoResponses(input), /login is required/);
});
for (const [name, mutate] of [
  ['unhealthy API', input => { input.health.ok = false; }],
  ['non-demo configuration', input => { input.config.demoMode = false; }],
  ['missing auth status', input => { input.auth = {}; }],
  ['empty statuses', input => { input.config.statuses = []; }],
]) {
  test(`rejects ${name}`, () => {
    const input = valid();
    mutate(input);
    assert.throws(() => validateDemoResponses(input));
  });
}
