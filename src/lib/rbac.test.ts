import { describe, expect, it } from 'vitest';

import { DELETE as deleteCandidate } from '@/src/app/api/candidates/[id]/route';
import { GET as listCandidates, POST as createCandidate } from '@/src/app/api/candidates/route';

import { authRequest, createTenant, createUser, tokenFor } from '../test/helpers';
import { prisma } from './db';

describe('role-based access control', () => {
  it('allows a recruiter to create a candidate', async () => {
    const tenant = await createTenant();
    const { user } = await createUser({ tenantId: tenant.id, role: 'recruiter' });

    const res = await createCandidate(
      authRequest('http://localhost/api/candidates', {
        method: 'POST',
        token: tokenFor(user),
        tenantId: tenant.id,
        body: { name: 'Test Candidate', email: 'candidate@example.com', roleAppliedFor: 'Engineer' },
      }),
    );

    expect(res.status).toBe(201);
  });

  it('forbids a viewer from creating a candidate', async () => {
    const tenant = await createTenant();
    const { user } = await createUser({ tenantId: tenant.id, role: 'viewer' });

    const res = await createCandidate(
      authRequest('http://localhost/api/candidates', {
        method: 'POST',
        token: tokenFor(user),
        tenantId: tenant.id,
        body: { name: 'Test Candidate', email: 'candidate@example.com', roleAppliedFor: 'Engineer' },
      }),
    );

    expect(res.status).toBe(403);
  });

  it('allows a viewer to list candidates', async () => {
    const tenant = await createTenant();
    const { user } = await createUser({ tenantId: tenant.id, role: 'viewer' });

    const res = await listCandidates(
      authRequest('http://localhost/api/candidates', { token: tokenFor(user), tenantId: tenant.id }),
    );

    expect(res.status).toBe(200);
  });

  it('forbids a recruiter from deleting a candidate', async () => {
    const tenant = await createTenant();
    const { user: recruiter } = await createUser({ tenantId: tenant.id, role: 'recruiter' });
    const candidate = await prisma.candidate.create({
      data: { tenantId: tenant.id, name: 'Test', email: 'test@example.com', roleAppliedFor: 'Engineer' },
    });

    const res = await deleteCandidate(
      authRequest(`http://localhost/api/candidates/${candidate.id}`, {
        method: 'DELETE',
        token: tokenFor(recruiter),
        tenantId: tenant.id,
      }),
      { params: { id: candidate.id } },
    );

    expect(res.status).toBe(403);
  });

  it('allows an admin to delete a candidate', async () => {
    const tenant = await createTenant();
    const { user: admin } = await createUser({ tenantId: tenant.id, role: 'admin' });
    const candidate = await prisma.candidate.create({
      data: { tenantId: tenant.id, name: 'Test', email: 'test2@example.com', roleAppliedFor: 'Engineer' },
    });

    const res = await deleteCandidate(
      authRequest(`http://localhost/api/candidates/${candidate.id}`, {
        method: 'DELETE',
        token: tokenFor(admin),
        tenantId: tenant.id,
      }),
      { params: { id: candidate.id } },
    );

    expect(res.status).toBe(204);
  });
});
