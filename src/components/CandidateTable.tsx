import type { Candidate, Role } from '@/src/lib/api-client';
import { canWrite } from '@/src/lib/permissions';

import { buttonPrimary } from './ui';

export default function CandidateTable({
  candidates,
  role,
  onSelect,
  onAdd,
}: {
  candidates: Candidate[];
  role: Role;
  onSelect: (candidate: Candidate) => void;
  onAdd: () => void;
}) {
  return (
    <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Candidates</h2>
          <p className="text-sm text-slate-500">{candidates.length} in this tenant</p>
        </div>
        {canWrite(role) ? (
          <button onClick={onAdd} className={buttonPrimary}>
            + Add candidate
          </button>
        ) : null}
      </div>

      {candidates.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">No candidates yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role applied for</th>
                <th className="px-5 py-3 font-medium">Documents</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  onClick={() => onSelect(candidate)}
                  className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-medium text-slate-900">{candidate.name}</td>
                  <td className="px-5 py-3 text-slate-600">{candidate.email}</td>
                  <td className="px-5 py-3 text-slate-600">{candidate.roleAppliedFor}</td>
                  <td className="px-5 py-3 text-slate-600">{candidate.documents?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
