import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

import { signToken, type AppUser, type Role } from '../lib/auth';
import { prisma } from '../lib/db';

export function createTenant(name = 'Test Tenant') {
  return prisma.tenant.create({ data: { name } });
}

export async function createUser(options: { tenantId: string; role?: Role; email?: string; password?: string }) {
  const password = options.password ?? 'correct-password';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: options.email ?? `user-${crypto.randomUUID()}@example.com`,
      name: 'Test User',
      role: options.role ?? 'recruiter',
      passwordHash,
      tenantId: options.tenantId,
    },
  });

  return { user, password };
}

export function tokenFor(user: { id: string; email: string; name: string; role: string; tenantId: string }) {
  return signToken(user as AppUser);
}

export function authRequest(
  url: string,
  init: { method?: string; token: string; tenantId: string; body?: unknown },
) {
  return new NextRequest(url, {
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${init.token}`,
      'X-Tenant-Id': init.tenantId,
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}
