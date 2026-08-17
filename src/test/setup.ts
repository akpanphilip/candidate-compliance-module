import { afterEach } from 'vitest';

import { prisma } from '../lib/db';

afterEach(async () => {
  await prisma.complianceDocument.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
});
