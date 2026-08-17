import { NextRequest } from 'next/server';

import { requireAuth, resolveTenantId } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const tenantId = resolveTenantId(req, user);

    const today = new Date();
    const soon = new Date();
    soon.setDate(today.getDate() + 30);

    const documents = await prisma.complianceDocument.findMany({
      where: {
        tenantId,
        expiryDate: {
          gte: today,
          lte: soon,
        },
      },
      include: {
        candidate: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    return Response.json(documents, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return Response.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
  }
}
