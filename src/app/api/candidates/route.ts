import { NextRequest } from 'next/server';
import { z } from 'zod';

import { requireAuth, requireRole, resolveTenantId } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  roleAppliedFor: z.string().min(1, 'Role applied for is required'),
});

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const tenantId = resolveTenantId(req, user);

    const candidates = await prisma.candidate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { documents: true },
    });

    return Response.json(candidates, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return Response.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const tenantId = resolveTenantId(req, user);
    requireRole(user, ['admin', 'recruiter']);

    const body = await req.json();
    const data = createCandidateSchema.parse(body);

    const candidate = await prisma.candidate.create({
      data: {
        tenantId,
        ...data,
      },
    });

    return Response.json(candidate, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Unexpected error';
    return Response.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
  }
}
