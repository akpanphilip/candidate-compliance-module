import { FormEvent, useState } from 'react';

import type { ComplianceDocument } from '@/src/lib/api-client';

import Field from './Field';
import { buttonPrimary, buttonSecondary, inputClass } from './ui';

function toDateInputValue(value?: string) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

const STATUS_OPTIONS = ['active', 'pending-renewal', 'revoked'];

export default function DocumentForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Pick<ComplianceDocument, 'type' | 'issueDate' | 'expiryDate' | 'status'>;
  onSubmit: (data: { type: string; issueDate: string; expiryDate: string; status: string }) => Promise<string | void>;
  onCancel: () => void;
}) {
  const [type, setType] = useState(initial?.type ?? '');
  const [issueDate, setIssueDate] = useState(toDateInputValue(initial?.issueDate) || toDateInputValue(new Date().toISOString()));
  const [expiryDate, setExpiryDate] = useState(toDateInputValue(initial?.expiryDate));
  const [status, setStatus] = useState(initial?.status ?? STATUS_OPTIONS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const message = await onSubmit({ type, issueDate, expiryDate, status });

    if (message) setError(message);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Document type">
        <input
          className={inputClass}
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g. Right-to-Work"
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Issue date">
          <input
            className={inputClass}
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </Field>
        <Field label="Expiry date">
          <input
            className={inputClass}
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </Field>
      </div>
      <Field label="Status">
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
