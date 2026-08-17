import { prisma } from './db';

export async function seed() {
  const tenantA = await prisma.tenant.upsert({
    where: { id: 'tenant-1' },
    update: {},
    create: { id: 'tenant-1', name: 'Alpha Recruitment' },
  });

  const tenantB = await prisma.tenant.upsert({
    where: { id: 'tenant-2' },
    update: {},
    create: { id: 'tenant-2', name: 'Beta Recruitment' },
  });

  await prisma.user.upsert({
    where: { email: 'alice@alpha.com' },
    update: {},
    create: {
      id: 'user-alpha',
      email: 'alice@alpha.com',
      name: 'Alice Alpha',
      role: 'recruiter',
      tenantId: tenantA.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'bob@beta.com' },
    update: {},
    create: {
      id: 'user-beta',
      email: 'bob@beta.com',
      name: 'Bob Beta',
      role: 'recruiter',
      tenantId: tenantB.id,
    },
  });

  const candidateOne = await prisma.candidate.upsert({
    where: { id: 'candidate-1' },
    update: {},
    create: {
      id: 'candidate-1',
      tenantId: tenantA.id,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      roleAppliedFor: 'Senior Engineer',
    },
  });

  const candidateTwo = await prisma.candidate.upsert({
    where: { id: 'candidate-2' },
    update: {},
    create: {
      id: 'candidate-2',
      tenantId: tenantB.id,
      name: 'John Smith',
      email: 'john.smith@example.com',
      roleAppliedFor: 'Operations Manager',
    },
  });

  const today = new Date();
  const soon = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
  const far = new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000);

  await prisma.complianceDocument.upsert({
    where: { id: 'doc-1' },
    update: {},
    create: {
      id: 'doc-1',
      tenantId: tenantA.id,
      candidateId: candidateOne.id,
      type: 'Right-to-Work',
      issueDate: new Date(),
      expiryDate: soon,
      status: 'active',
    },
  });

  await prisma.complianceDocument.upsert({
    where: { id: 'doc-2' },
    update: {},
    create: {
      id: 'doc-2',
      tenantId: tenantB.id,
      candidateId: candidateTwo.id,
      type: 'DBS',
      issueDate: new Date(),
      expiryDate: far,
      status: 'active',
    },
  });
}
