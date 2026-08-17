import { FormEvent, useState } from 'react';

import { buttonPrimary, inputClass } from './ui';
import Field from './Field';

const DEMO_ACCOUNTS = [
  { email: 'alice@alpha.com', role: 'admin', tenant: 'Alpha Recruitment' },
  { email: 'carol@alpha.com', role: 'recruiter', tenant: 'Alpha Recruitment' },
  { email: 'dave@alpha.com', role: 'viewer', tenant: 'Alpha Recruitment' },
  { email: 'bob@beta.com', role: 'recruiter', tenant: 'Beta Recruitment' },
];

export default function LoginCard({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<string | void>;
}) {
  const [email, setEmail] = useState('alice@alpha.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const message = await onLogin(email, password);

    if (message) setError(message);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-semibold text-white shadow-sm">
            CC
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Compliance Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">Candidate &amp; compliance tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <Field label="Email">
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </Field>
          <Field label="Password">
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </Field>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button type="submit" disabled={loading} className={`${buttonPrimary} w-full`}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 rounded-xl bg-white/60 p-4 text-xs text-slate-500 ring-1 ring-slate-900/5">
          <p className="mb-2 font-medium text-slate-600">Demo accounts (password: Password123!)</p>
          <ul className="space-y-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email} className="flex items-center justify-between gap-2">
                <span>{account.email}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  {account.role} · {account.tenant}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
