import type { ExpiringDocument } from '@/src/lib/api-client';

function daysUntil(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ExpiringSoonPanel({ documents }: { documents: ExpiringDocument[] }) {
  return (
    <aside className="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Expiring soon</h2>
        <p className="text-sm text-slate-500">Within the next 30 days</p>
      </div>

      {documents.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">Nothing expiring soon.</p>
      ) : (
        <ul className="divide-y divide-slate-50">
          {documents.map((document) => (
            <li key={document.id} className="px-5 py-3">
              <p className="text-sm font-medium text-slate-900">{document.type}</p>
              <p className="text-sm text-slate-500">{document.candidate.name}</p>
              <span className="mt-1 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                {daysUntil(document.expiryDate)} day{daysUntil(document.expiryDate) === 1 ? '' : 's'} left
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
