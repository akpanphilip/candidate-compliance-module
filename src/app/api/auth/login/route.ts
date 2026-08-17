import { NextRequest } from 'next/server';
import { z } from 'zod';

import { signToken } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

const loginSchema = z.object({
  email: z.string().email(),
  tenantId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
        tenantId: data.tenantId,
      },
    });

    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const jwt = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    });

    return Response.json({ token: jwt, user }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 });
    }

    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
