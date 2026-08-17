import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
};

export function signToken(user: AppUser) {
  return jwt.sign(user, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as AppUser;
}

export function getAuthTokenFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  return authHeader.replace('Bearer ', '').trim();
}

export function getTenantIdFromRequest(req: NextRequest) {
  return req.headers.get('x-tenant-id') || req.headers.get('X-Tenant-Id');
}

export function resolveTenantId(req: NextRequest, user: AppUser) {
  const headerTenantId = getTenantIdFromRequest(req);

  if (headerTenantId && headerTenantId !== user.tenantId) {
    throw new Error('Forbidden');
  }

  return user.tenantId;
}

export function requireAuth(req: NextRequest) {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    return verifyToken(token);
  } catch {
    throw new Error('Unauthorized');
  }
}

export function requireRole(user: AppUser, role: string) {
  if (user.role !== role) {
    throw new Error('Forbidden');
  }
}
