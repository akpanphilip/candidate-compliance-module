import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST as login } from '@/src/app/api/auth/login/route';

import { createTenant, createUser } from '../test/helpers';

function loginRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  it('issues a token for correct credentials', async () => {
    const tenant = await createTenant();
    const { user, password } = await createUser({ tenantId: tenant.id, email: 'alice@example.com' });

    const res = await login(loginRequest({ email: user.email, password }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.token).toBeTypeOf('string');
    expect(data.user.email).toBe(user.email);
    expect(data.user.tenantId).toBe(tenant.id);
  });

  it('rejects an incorrect password', async () => {
    const tenant = await createTenant();
    const { user } = await createUser({ tenantId: tenant.id, email: 'bob@example.com' });

    const res = await login(loginRequest({ email: user.email, password: 'wrong-password' }));

    expect(res.status).toBe(401);
  });

  it('rejects an unknown email', async () => {
    const res = await login(loginRequest({ email: 'nobody@example.com', password: 'whatever' }));

    expect(res.status).toBe(401);
  });

  it('rejects a malformed request body', async () => {
    const res = await login(loginRequest({ email: 'not-an-email', password: '' }));

    expect(res.status).toBe(400);
  });
});
