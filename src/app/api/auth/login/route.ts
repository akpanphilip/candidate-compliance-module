import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { z } from 'zod';

import { signToken } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { tenant: true },
    });

    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);

    if (!passwordMatches) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const appUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'recruiter' | 'viewer',
      tenantId: user.tenantId,
    };

    const token = signToken(appUser);

    return Response.json(
      {
        token,
        user: { ...appUser, tenantName: user.tenant.name },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 });
    }

    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
