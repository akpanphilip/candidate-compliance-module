'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import AppShell from '@/src/components/AppShell';
import CandidateDrawer from '@/src/components/CandidateDrawer';
import CandidateForm from '@/src/components/CandidateForm';
import CandidateTable from '@/src/components/CandidateTable';
import ConfirmDialog from '@/src/components/ConfirmDialog';
import DocumentForm from '@/src/components/DocumentForm';
import ExpiringSoonPanel from '@/src/components/ExpiringSoonPanel';
import LoginCard from '@/src/components/LoginCard';
import Modal from '@/src/components/Modal';
import {
  ApiError,
  type AuthUser,
  type Candidate,
  type ComplianceDocument,
  type ExpiringDocument,
  createApiClient,
  login as loginRequest,
} from '@/src/lib/api-client';

const STORAGE_TOKEN = 'e3os-token';
const STORAGE_USER = 'e3os-user';

type DeleteTarget = { kind: 'candidate' | 'document'; id: string; label: string };

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<ExpiringDocument[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ComplianceDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [dashboardError, setDashboardError] = useState('');

  const api = useMemo(() => (token && user ? createApiClient(token, user.tenantId) : null), [token, user]);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_TOKEN);
    const savedUser = localStorage.getItem(STORAGE_USER);

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (!api) return;

    try {
      const [candidateList, expiring] = await Promise.all([api.listCandidates(), api.expiringSoon()]);
      setCandidates(candidateList);
      setExpiringSoon(expiring);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
      }
    }
  }, [api]);

  useEffect(() => {
    if (api) refreshAll();
  }, [api, refreshAll]);

  function logout() {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setToken(null);
    setUser(null);
    setCandidates([]);
    setExpiringSoon([]);
    setSelectedCandidate(null);
  }

  async function handleLogin(email: string, password: string) {
    try {
      const { token: newToken, user: newUser } = await loginRequest(email, password);
      localStorage.setItem(STORAGE_TOKEN, newToken);
      localStorage.setItem(STORAGE_USER, JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      return error instanceof ApiError ? error.message : 'Unable to sign in';
    }
  }

  async function openCandidate(candidate: Candidate) {
    if (!api) return;

    try {
      const fresh = await api.getCandidate(candidate.id);
      setSelectedCandidate(fresh);
    } catch {
      setSelectedCandidate(candidate);
    }
  }

  async function refreshSelectedCandidate(id: string) {
    if (!api) return;
    const fresh = await api.getCandidate(id);
    setSelectedCandidate(fresh);
  }

  async function handleAddCandidate(data: { name: string; email: string; roleAppliedFor: string }) {
    if (!api) return;

    try {
      await api.createCandidate(data);
      setShowAddCandidate(false);
      await refreshAll();
    } catch (error) {
      return error instanceof ApiError ? error.message : 'Something went wrong';
    }
  }

  async function handleEditCandidate(data: { name: string; email: string; roleAppliedFor: string }) {
    if (!api || !editingCandidate) return;

    try {
      await api.updateCandidate(editingCandidate.id, data);
      setEditingCandidate(null);
      await refreshAll();
      await refreshSelectedCandidate(editingCandidate.id);
    } catch (error) {
      return error instanceof ApiError ? error.message : 'Something went wrong';
    }
  }

  async function handleAddDocument(data: { type: string; issueDate: string; expiryDate: string; status: string }) {
    if (!api || !selectedCandidate) return;

    try {
      await api.addDocument(selectedCandidate.id, data);
      setShowAddDocument(false);
      await refreshAll();
      await refreshSelectedCandidate(selectedCandidate.id);
    } catch (error) {
      return error instanceof ApiError ? error.message : 'Something went wrong';
    }
  }

  async function handleEditDocument(data: { type: string; issueDate: string; expiryDate: string; status: string }) {
    if (!api || !editingDocument || !selectedCandidate) return;

    try {
      await api.updateDocument(editingDocument.id, data);
      setEditingDocument(null);
      await refreshAll();
      await refreshSelectedCandidate(selectedCandidate.id);
    } catch (error) {
      return error instanceof ApiError ? error.message : 'Something went wrong';
    }
  }

  async function handleConfirmDelete() {
    if (!api || !deleteTarget) return;
    setDashboardError('');

    try {
      if (deleteTarget.kind === 'candidate') {
        await api.deleteCandidate(deleteTarget.id);
        setSelectedCandidate(null);
      } else {
        await api.deleteDocument(deleteTarget.id);
        if (selectedCandidate) await refreshSelectedCandidate(selectedCandidate.id);
      }

      setDeleteTarget(null);
      await refreshAll();
    } catch (error) {
      setDeleteTarget(null);
      setDashboardError(error instanceof ApiError ? error.message : 'Something went wrong');
    }
  }

  if (!user || !token) {
    return <LoginCard onLogin={handleLogin} />;
  }

  return (
    <AppShell user={user} onLogout={logout}>
      {dashboardError ? (
        <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
          {dashboardError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CandidateTable
            candidates={candidates}
            role={user.role}
            onSelect={openCandidate}
            onAdd={() => setShowAddCandidate(true)}
          />
        </div>
        <ExpiringSoonPanel documents={expiringSoon} />
      </div>

      {showAddCandidate ? (
        <Modal title="Add candidate" onClose={() => setShowAddCandidate(false)}>
          <CandidateForm onSubmit={handleAddCandidate} onCancel={() => setShowAddCandidate(false)} />
        </Modal>
      ) : null}

      {editingCandidate ? (
        <Modal title="Edit candidate" onClose={() => setEditingCandidate(null)}>
          <CandidateForm
            initial={editingCandidate}
            onSubmit={handleEditCandidate}
            onCancel={() => setEditingCandidate(null)}
          />
        </Modal>
      ) : null}

      {showAddDocument ? (
        <Modal title="Add compliance document" onClose={() => setShowAddDocument(false)}>
          <DocumentForm onSubmit={handleAddDocument} onCancel={() => setShowAddDocument(false)} />
        </Modal>
      ) : null}

      {editingDocument ? (
        <Modal title="Edit compliance document" onClose={() => setEditingDocument(null)}>
          <DocumentForm
            initial={editingDocument}
            onSubmit={handleEditDocument}
            onCancel={() => setEditingDocument(null)}
          />
        </Modal>
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title={`Delete ${deleteTarget.kind}`}
          message={`Are you sure you want to delete "${deleteTarget.label}"? This cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}

      {selectedCandidate ? (
        <CandidateDrawer
          candidate={selectedCandidate}
          role={user.role}
          onClose={() => setSelectedCandidate(null)}
          onEditCandidate={() => setEditingCandidate(selectedCandidate)}
          onDeleteCandidate={() =>
            setDeleteTarget({ kind: 'candidate', id: selectedCandidate.id, label: selectedCandidate.name })
          }
          onAddDocument={() => setShowAddDocument(true)}
          onEditDocument={(document) => setEditingDocument(document)}
          onDeleteDocument={(document) =>
            setDeleteTarget({ kind: 'document', id: document.id, label: document.type })
          }
        />
      ) : null}
    </AppShell>
  );
}
