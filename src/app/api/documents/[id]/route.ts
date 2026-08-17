import { NextRequest } from 'next/server';
import { z } from 'zod';

import { requireAuth, requireRole, resolveTenantId } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

const updateDocumentSchema = z.object({
  type: z.string().min(1, 'Document type is required').optional(),
  issueDate: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid issue date')
    .optional(),
  expiryDate: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid expiry date')
    .optional(),
  status: z.string().min(1, 'Status is required').optional(),
});

function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return Response.json({ error: error.issues[0].message }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : 'Unexpected error';
  return Response.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    const user = requireAuth(req);
    const tenantId = resolveTenantId(req, user);
    requireRole(user, ['admin', 'recruiter']);

    const document = await prisma.complianceDocument.findFirst({
      where: { id: context.params.id, tenantId },
    });

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    const body = await req.json();
    const data = updateDocumentSchema.parse(body);

    const updated = await prisma.complianceDocument.update({
      where: { id: document.id },
      data: {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
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

    const document = await prisma.complianceDocument.findFirst({
      where: { id: context.params.id, tenantId },
    });

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    await prisma.complianceDocument.delete({ where: { id: document.id } });

    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
