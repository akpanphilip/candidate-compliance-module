export type Role = 'admin' | 'recruiter' | 'viewer';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
  tenantName: string;
};

export type ComplianceDocument = {
  id: string;
  candidateId: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  status: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  roleAppliedFor: string;
  documents?: ComplianceDocument[];
};

export type ExpiringDocument = ComplianceDocument & { candidate: Candidate };

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
};

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.error ?? 'Login failed', res.status);
  }

  return data as { token: string; user: AuthUser };
}

export function createApiClient(token: string, tenantId: string) {
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const res = await fetch(path, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 204) {
      return undefined as T;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(data.error ?? 'Request failed', res.status);
    }

    return data as T;
  }

  return {
    listCandidates: () => request<Candidate[]>('/api/candidates'),
    getCandidate: (id: string) => request<Candidate>(`/api/candidates/${id}`),
    createCandidate: (data: { name: string; email: string; roleAppliedFor: string }) =>
      request<Candidate>('/api/candidates', { method: 'POST', body: data }),
    updateCandidate: (id: string, data: Partial<{ name: string; email: string; roleAppliedFor: string }>) =>
      request<Candidate>(`/api/candidates/${id}`, { method: 'PATCH', body: data }),
    deleteCandidate: (id: string) => request<void>(`/api/candidates/${id}`, { method: 'DELETE' }),
    addDocument: (
      candidateId: string,
      data: { type: string; issueDate: string; expiryDate: string; status: string },
    ) => request<ComplianceDocument>(`/api/candidates/${candidateId}`, { method: 'POST', body: data }),
    updateDocument: (
      id: string,
      data: Partial<{ type: string; issueDate: string; expiryDate: string; status: string }>,
    ) => request<ComplianceDocument>(`/api/documents/${id}`, { method: 'PATCH', body: data }),
    deleteDocument: (id: string) => request<void>(`/api/documents/${id}`, { method: 'DELETE' }),
    expiringSoon: () => request<ExpiringDocument[]>('/api/documents/expiring-soon'),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
