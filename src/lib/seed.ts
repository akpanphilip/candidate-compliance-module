import bcrypt from 'bcryptjs';

import { prisma } from './db';

export const DEMO_PASSWORD = 'Password123!';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number) {
  return new Date(Date.now() + days * DAY_MS);
}

export async function seed() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const tenantAlpha = await prisma.tenant.upsert({
    where: { id: 'tenant-1' },
    update: {},
    create: { id: 'tenant-1', name: 'Alpha Recruitment' },
  });

  const tenantBeta = await prisma.tenant.upsert({
    where: { id: 'tenant-2' },
    update: {},
    create: { id: 'tenant-2', name: 'Beta Recruitment' },
  });

  const [alice, carol, dave, bob] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@alpha.com' },
      update: { passwordHash, role: 'admin', tenantId: tenantAlpha.id },
      create: {
        id: 'user-alice',
        email: 'alice@alpha.com',
        name: 'Alice Alpha',
        role: 'admin',
        passwordHash,
        tenantId: tenantAlpha.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'carol@alpha.com' },
      update: { passwordHash, role: 'recruiter', tenantId: tenantAlpha.id },
      create: {
        id: 'user-carol',
        email: 'carol@alpha.com',
        name: 'Carol Recruiter',
        role: 'recruiter',
        passwordHash,
        tenantId: tenantAlpha.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'dave@alpha.com' },
      update: { passwordHash, role: 'viewer', tenantId: tenantAlpha.id },
      create: {
        id: 'user-dave',
        email: 'dave@alpha.com',
        name: 'Dave Viewer',
        role: 'viewer',
        passwordHash,
        tenantId: tenantAlpha.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@beta.com' },
      update: { passwordHash, role: 'recruiter', tenantId: tenantBeta.id },
      create: {
        id: 'user-bob',
        email: 'bob@beta.com',
        name: 'Bob Beta',
        role: 'recruiter',
        passwordHash,
        tenantId: tenantBeta.id,
      },
    }),
  ]);

  const candidateJane = await prisma.candidate.upsert({
    where: { id: 'candidate-1' },
    update: {},
    create: {
      id: 'candidate-1',
      tenantId: tenantAlpha.id,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      roleAppliedFor: 'Senior Engineer',
    },
  });

  const candidateMike = await prisma.candidate.upsert({
    where: { id: 'candidate-2' },
    update: {},
    create: {
      id: 'candidate-2',
      tenantId: tenantAlpha.id,
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      roleAppliedFor: 'Warehouse Operative',
    },
  });

  const candidateJohn = await prisma.candidate.upsert({
    where: { id: 'candidate-3' },
    update: {},
    create: {
      id: 'candidate-3',
      tenantId: tenantBeta.id,
      name: 'John Smith',
      email: 'john.smith@example.com',
      roleAppliedFor: 'Operations Manager',
    },
  });

  await Promise.all([
    prisma.complianceDocument.upsert({
      where: { id: 'doc-1' },
      update: {},
      create: {
        id: 'doc-1',
        tenantId: tenantAlpha.id,
        candidateId: candidateJane.id,
        type: 'Right-to-Work',
        issueDate: daysFromNow(-300),
        expiryDate: daysFromNow(10),
        status: 'active',
      },
    }),
    prisma.complianceDocument.upsert({
      where: { id: 'doc-2' },
      update: {},
      create: {
        id: 'doc-2',
        tenantId: tenantAlpha.id,
        candidateId: candidateJane.id,
        type: 'DBS Check',
        issueDate: daysFromNow(-700),
        expiryDate: daysFromNow(365),
        status: 'active',
      },
    }),
    prisma.complianceDocument.upsert({
      where: { id: 'doc-3' },
      update: {},
      create: {
        id: 'doc-3',
        tenantId: tenantAlpha.id,
        candidateId: candidateMike.id,
        type: 'First Aid Certificate',
        issueDate: daysFromNow(-380),
        expiryDate: daysFromNow(-15),
        status: 'active',
      },
    }),
    prisma.complianceDocument.upsert({
      where: { id: 'doc-4' },
      update: {},
      create: {
        id: 'doc-4',
        tenantId: tenantBeta.id,
        candidateId: candidateJohn.id,
        type: 'DBS Check',
        issueDate: daysFromNow(-100),
        expiryDate: daysFromNow(120),
        status: 'active',
      },
    }),
  ]);

  return { users: [alice, carol, dave, bob] };
}

async function main() {
  const { users } = await seed();

  console.log(`Seeded ${users.length} users across 2 tenants. Demo password for all accounts: ${DEMO_PASSWORD}`);
  users.forEach((user) => console.log(`  - ${user.email} (${user.role}, tenant ${user.tenantId})`));
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
