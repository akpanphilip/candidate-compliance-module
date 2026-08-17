import { FormEvent, useState } from 'react';

import type { Candidate } from '@/src/lib/api-client';

import Field from './Field';
import { buttonPrimary, buttonSecondary, inputClass } from './ui';

export default function CandidateForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Pick<Candidate, 'name' | 'email' | 'roleAppliedFor'>;
  onSubmit: (data: { name: string; email: string; roleAppliedFor: string }) => Promise<string | void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [roleAppliedFor, setRoleAppliedFor] = useState(initial?.roleAppliedFor ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const message = await onSubmit({ name, email, roleAppliedFor });

    if (message) setError(message);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full name">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Email">
        <input
          className={inputClass}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>
      <Field label="Role applied for">
        <input
          className={inputClass}
          value={roleAppliedFor}
          onChange={(e) => setRoleAppliedFor(e.target.value)}
          required
        />
      </Field>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className={buttonSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={loading} className={buttonPrimary}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
