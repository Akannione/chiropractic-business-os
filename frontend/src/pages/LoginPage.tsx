import { useState } from 'react';
import type { FormEvent } from 'react';
import { api, setAuthToken } from '../services/api';

type LoginPageProps = {
  onLogin: () => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await api.login(password);
      setAuthToken(result.token);
      onLogin();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="public-page">
      <section className="public-card login-card">
        <div className="section-heading">
          <span className="eyebrow">Staff Access</span>
          <h1>CBOS</h1>
          <p>Sign in to view patient inquiries, follow-ups, reporting, and exports.</p>
        </div>
        {error && <div className="notice error">{error}</div>}
        <form className="inquiry-form public-form" onSubmit={submit}>
          <label className="full">
            Staff Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              required
            />
          </label>
          <button className="primary-button full" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="public-footnote">The public intake form remains available without staff login.</p>
      </section>
    </main>
  );
}
