"use client";

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Candidate = {
  id: string;
  name: string;
  email: string;
  roleAppliedFor: string;
};

type LoginForm = {
  email: string;
  tenantId: string;
};

const STORAGE_KEY = 'e3os-token';
const STORAGE_TENANT = 'e3os-tenant';

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState('tenant-1');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [candidateForm, setCandidateForm] = useState({ name: '', email: '', roleAppliedFor: '' });
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: 'alice@alpha.com', tenantId: 'tenant-1' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY);
    const savedTenant = localStorage.getItem(STORAGE_TENANT);

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedTenant) {
      setTenantId(savedTenant);
      setLoginForm((prev) => ({ ...prev, tenantId: savedTenant }));
    }
  }, []);

  const loadCandidates = useCallback(async () => {
    if (!token) return;

    const res = await fetch('/api/candidates', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
      },
    });

    const data = await res.json();
    if (res.ok) setCandidates(data);
  }, [tenantId, token]);

  const loadExpiringSoon = useCallback(async () => {
    if (!token) return;

    const res = await fetch('/api/documents/expiring-soon', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
      },
    });

    const data = await res.json();
    if (res.ok) setExpiringSoon(data);
  }, [tenantId, token]);

  useEffect(() => {
    if (token) {
      loadCandidates();
      loadExpiringSoon();
    }
  }, [loadCandidates, loadExpiringSoon, token]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem(STORAGE_KEY, data.token);
      localStorage.setItem(STORAGE_TENANT, loginForm.tenantId);
      setToken(data.token);
      setTenantId(loginForm.tenantId);
      setLoading(false);
    } catch {
      setError('Unable to login');
      setLoading(false);
    }
  }

  async function submitCandidate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
      },
      body: JSON.stringify(candidateForm),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    setCandidateForm({ name: '', email: '', roleAppliedFor: '' });
    await loadCandidates();
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TENANT);
    setToken(null);
    setCandidates([]);
    setExpiringSoon([]);
  }

  if (!token) {
    return (
      <main style={{ maxWidth: 420, margin: '60px auto', padding: 20, fontFamily: 'sans-serif' }}>
        <h1>E3OS Login</h1>
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
          <input
            value={loginForm.email}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
            style={{ padding: 10 }}
          />
          <input
            value={loginForm.tenantId}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, tenantId: e.target.value }))}
            placeholder="Tenant ID"
            style={{ padding: 10 }}
          />
          <button type="submit" disabled={loading} style={{ padding: '10px 16px', cursor: 'pointer' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        </form>

        <p style={{ color: '#475569', marginTop: 18 }}>
          Try: alice@alpha.com / tenant-1 or bob@beta.com / tenant-2
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>Candidate compliance</h1>
          <p>Tenant: {tenantId}</p>
        </div>
        <button onClick={logout} style={{ padding: '8px 12px', cursor: 'pointer' }}>Logout</button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        <div>
          <form onSubmit={submitCandidate} style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
            <input
              placeholder="Candidate name"
              value={candidateForm.name}
              onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
              style={{ padding: 10 }}
            />
            <input
              placeholder="Email"
              type="email"
              value={candidateForm.email}
              onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
              style={{ padding: 10 }}
            />
            <input
              placeholder="Role applied for"
              value={candidateForm.roleAppliedFor}
              onChange={(e) => setCandidateForm({ ...candidateForm, roleAppliedFor: e.target.value })}
              style={{ padding: 10 }}
            />
            <button type="submit" disabled={loading} style={{ padding: '10px 16px', cursor: 'pointer' }}>
              {loading ? 'Saving...' : 'Add candidate'}
            </button>
            {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
          </form>

          <h2>Candidates</h2>
          {candidates.length === 0 ? (
            <p>No candidates found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
              {candidates.map((candidate) => (
                <li key={candidate.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
                  <strong>{candidate.name}</strong>
                  <div>{candidate.email}</div>
                  <div>{candidate.roleAppliedFor}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside>
          <h2>Expiring soon</h2>
          {expiringSoon.length === 0 ? (
            <p>No documents expiring in the next 30 days.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
              {expiringSoon.map((doc: any) => (
                <li key={doc.id} style={{ border: '1px solid #ddd', padding: 10, borderRadius: 8 }}>
                  <strong>{doc.type}</strong>
                  <div>{doc.candidate?.name}</div>
                  <div>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </main>
  );
}
