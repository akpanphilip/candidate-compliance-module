import { describe, expect, it } from 'vitest';
import { prisma } from './db';

describe('tenant isolation', () => {
  it('ensures a tenant can only retrieve their own candidates', async () => {
    const tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A' },
    });

    const tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B' },
    });

    await prisma.candidate.create({
      data: {
        tenantId: tenantA.id,
        name: 'Alice Candidate',
        email: 'alice@example.com',
        roleAppliedFor: 'Engineer',
      },
    });

    await prisma.candidate.create({
      data: {
        tenantId: tenantB.id,
        name: 'Bob Candidate',
        email: 'bob@example.com',
        roleAppliedFor: 'Analyst',
      },
    });

    const aCandidates = await prisma.candidate.findMany({
      where: { tenantId: tenantA.id },
    });

    const bCandidates = await prisma.candidate.findMany({
      where: { tenantId: tenantB.id },
    });

    expect(aCandidates).toHaveLength(1);
    expect(bCandidates).toHaveLength(1);
    expect(aCandidates[0].name).toBe('Alice Candidate');
    expect(bCandidates[0].name).toBe('Bob Candidate');
    expect(aCandidates[0].tenantId).not.toBe(bCandidates[0].tenantId);
  });
});
