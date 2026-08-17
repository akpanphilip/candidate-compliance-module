import type { Candidate, ComplianceDocument, Role } from '@/src/lib/api-client';
import { canDelete, canWrite } from '@/src/lib/permissions';

import StatusBadge from './StatusBadge';
import { buttonDanger, buttonPrimary, buttonSecondary } from './ui';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export default function CandidateDrawer({
  candidate,
  role,
  onClose,
  onEditCandidate,
  onDeleteCandidate,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
}: {
  candidate: Candidate;
  role: Role;
  onClose: () => void;
  onEditCandidate: () => void;
  onDeleteCandidate: () => void;
  onAddDocument: () => void;
  onEditDocument: (document: ComplianceDocument) => void;
  onDeleteDocument: (document: ComplianceDocument) => void;
}) {
  const documents = candidate.documents ?? [];

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40">
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{candidate.name}</h2>
            <p className="text-sm text-slate-500">{candidate.email}</p>
            <p className="text-sm text-slate-500">{candidate.roleAppliedFor}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {canWrite(role) ? (
          <div className="flex gap-2 border-b border-slate-100 px-6 py-3">
            <button onClick={onEditCandidate} className={buttonSecondary}>
              Edit candidate
            </button>
            {canDelete(role) ? (
              <button onClick={onDeleteCandidate} className={buttonDanger}>
                Delete candidate
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Compliance documents</h3>
            {canWrite(role) ? (
              <button onClick={onAddDocument} className={buttonPrimary}>
                + Add document
              </button>
            ) : null}
          </div>

          {documents.length === 0 ? (
            <p className="text-sm text-slate-500">No documents on file.</p>
          ) : (
            <ul className="space-y-3">
              {documents.map((document) => (
                <li key={document.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{document.type}</p>
                      <p className="text-sm text-slate-500">
                        Issued {formatDate(document.issueDate)} · Expires {formatDate(document.expiryDate)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{document.status}</p>
                    </div>
                    <StatusBadge expiryDate={document.expiryDate} />
                  </div>

                  {canWrite(role) ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => onEditDocument(document)}
                        className="text-sm font-medium text-brand-700 hover:text-brand-800"
                      >
                        Edit
                      </button>
                      {canDelete(role) ? (
                        <button
                          onClick={() => onDeleteDocument(document)}
                          className="text-sm font-medium text-rose-600 hover:text-rose-700"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
