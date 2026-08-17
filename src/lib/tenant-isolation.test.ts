import { describe, expect, it } from 'vitest';

import { GET as listCandidates } from '@/src/app/api/candidates/route';

import { authRequest, createTenant, createUser, tokenFor } from '../test/helpers';
import { prisma } from './db';

describe('tenant isolation', () => {
  it('ensures a tenant can only retrieve their own candidates at the data layer', async () => {
    const tenantA = await prisma.tenant.create({ data: { name: 'Tenant A' } });
    const tenantB = await prisma.tenant.create({ data: { name: 'Tenant B' } });

    await prisma.candidate.create({
      data: { tenantId: tenantA.id, name: 'Alice Candidate', email: 'alice@example.com', roleAppliedFor: 'Engineer' },
    });

    await prisma.candidate.create({
      data: { tenantId: tenantB.id, name: 'Bob Candidate', email: 'bob@example.com', roleAppliedFor: 'Analyst' },
    });

    const aCandidates = await prisma.candidate.findMany({ where: { tenantId: tenantA.id } });
    const bCandidates = await prisma.candidate.findMany({ where: { tenantId: tenantB.id } });

    expect(aCandidates).toHaveLength(1);
    expect(bCandidates).toHaveLength(1);
    expect(aCandidates[0].name).toBe('Alice Candidate');
    expect(bCandidates[0].name).toBe('Bob Candidate');
    expect(aCandidates[0].tenantId).not.toBe(bCandidates[0].tenantId);
  });

  it('rejects an API request whose X-Tenant-Id header does not match the caller', async () => {
    const tenantA = await createTenant('Tenant A');
    const tenantB = await createTenant('Tenant B');
    const { user } = await createUser({ tenantId: tenantA.id, role: 'admin' });

    const res = await listCandidates(
      authRequest('http://localhost/api/candidates', { token: tokenFor(user), tenantId: tenantB.id }),
    );

    expect(res.status).toBe(403);
  });

  it('allows an API request whose X-Tenant-Id header matches the caller', async () => {
    const tenant = await createTenant();
    const { user } = await createUser({ tenantId: tenant.id, role: 'admin' });

    const res = await listCandidates(
      authRequest('http://localhost/api/candidates', { token: tokenFor(user), tenantId: tenant.id }),
    );

    expect(res.status).toBe(200);
  });
});
