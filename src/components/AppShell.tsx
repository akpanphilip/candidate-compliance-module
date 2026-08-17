import { ReactNode } from 'react';

import type { AuthUser } from '@/src/lib/api-client';

export default function AppShell({ user, onLogout, children }: { user: AuthUser; onLogout: () => void; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white">
              E3
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Candidate Compliance</p>
              <p className="text-xs text-slate-500">{user.tenantName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium capitalize text-brand-700 ring-1 ring-inset ring-brand-600/20">
                {user.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
