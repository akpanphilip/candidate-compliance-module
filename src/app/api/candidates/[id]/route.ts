import { NextRequest } from 'next/server';
import { z } from 'zod';

import { requireAuth, requireRole, resolveTenantId } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

const addDocumentSchema = z.object({
  type: z.string().min(1, 'Document type is required'),
  issueDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid issue date'),
  expiryDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid expiry date'),
  status: z.string().min(1, 'Status is required'),
});

const updateCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  roleAppliedFor: z.string().min(1, 'Role applied for is required').optional(),
});

function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return Response.json({ error: error.issues[0].message }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : 'Unexpected error';
  return Response.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
}

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const user = requireAuth(req);
    const tenantId = resolveTenantId(req, user);

    const candidate = await prisma.candidate.findFirst({
      where: { id: context.params.id, tenantId },
      include: { documents: true },
    });

    if (!candidate) {
      return Response.json({ error: 'Candidate not found' }, { status: 404 });
    }

    return Response.json(candidate, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    const user = requireAuth(req);
    const tenantId = resolveTenantId(req, user);
    requireRole(user, ['admin', 'recruiter']);

    const candidate = await prisma.candidate.findFirst({
      where: { id: context.params.id, tenantId },
    });

    if (!candidate) {
      return Response.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const body = await req.json();
    const data = addDocumentSchema.parse(body);

    const document = await prisma.complianceDocument.create({
      data: {
        tenantId,
        candidateId: candidate.id,
        type: data.type,
        issueDate: new Date(data.issueDate),
        expiryDate: new Date(data.expiryDate),
        status: data.status,
      },
    });

    return Response.json(document, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    const user = requireAuth(req);
    const tenantId = resolveTenantId(req, user);
    requireRole(user, ['admin', 'recruiter']);

    const candidate = await prisma.candidate.findFirst({
      where: { id: context.params.id, tenantId },
    });

    if (!candidate) {
      return Response.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const body = await req.json();
    const data = updateCandidateSchema.parse(body);

    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data,
    });

    return Response.json(updated, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const user = requireAuth(req);
    const tenantId = resolveTenantId(req, user);
    requireRole(user, ['admin']);

    const candidate = await prisma.candidate.findFirst({
      where: { id: context.params.id, tenantId },
    });

    if (!candidate) {
      return Response.json({ error: 'Candidate not found' }, { status: 404 });
    }

    await prisma.candidate.delete({ where: { id: candidate.id } });

    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
