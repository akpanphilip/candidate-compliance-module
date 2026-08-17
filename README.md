# Candidate Compliance Module

A small full-stack implementation of a take-home assessment: a tenant-aware candidate and compliance-document workflow built with Next.js, Prisma, and SQLite.

> The assessment brief asked that this not be published with the hiring company's name attached, so this README and the app itself are kept generic on purpose.

## Features

- Full CRUD on candidates and compliance documents (create, read, update, delete)
- Strict tenant isolation on every query and every API route
- Password-based authentication (JWT) with a three-tier role matrix (admin / recruiter / viewer)
- Business-logic endpoint: documents expiring within the next 30 days
- A polished, role-aware Next.js dashboard (Tailwind, Sora font, teal theme)
- 15 automated tests covering auth, RBAC, tenant isolation, and expiry logic, run against an isolated test database

## Technology choices

- **Next.js 14 + TypeScript** for the frontend and API route handlers
- **Prisma ORM** for the data model and migrations
- **Zod** for request validation
- **JWT** (7-day expiry) for stateless auth, **bcrypt** for password hashing
- **Vitest** for unit and integration tests
- **Tailwind CSS** for styling, **Sora** (via `next/font/google`) as the typeface

### Why SQLite instead of PostgreSQL

The brief lists PostgreSQL as "preferred" with the backend stack otherwise flexible. This project uses SQLite (via Prisma) instead: the schema is plain relational SQL with no Postgres-specific features, so it ports to Postgres by changing the `datasource` provider and `DATABASE_URL`. In exchange, anyone reviewing this submission gets a zero-setup local run — no database server to install or configure — which mattered more here than matching the "preferred" default. This is exactly the kind of judgment call the brief asks to be disclosed, so it's called out explicitly rather than left as a silent discrepancy.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Create the database and apply migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Seed demo data (tenants, users, candidates, documents):
   ```bash
   npm run seed
   ```

5. Start the app:
   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000` and sign in with one of the demo accounts below.

## Demo accounts

All demo accounts share the password `Password123!`.

| Email | Role | Tenant |
| --- | --- | --- |
| alice@alpha.com | admin | Alpha Recruitment |
| carol@alpha.com | recruiter | Alpha Recruitment |
| dave@alpha.com | viewer | Alpha Recruitment |
| bob@beta.com | recruiter | Beta Recruitment |

Log in as `alice`/`carol`/`dave` and then `bob` in a different session to see tenant isolation directly: Beta's data is never visible from an Alpha account, and vice versa.

### Role matrix

| Action | admin | recruiter | viewer |
| --- | --- | --- | --- |
| View candidates & documents | ✅ | ✅ | ✅ |
| Create / update candidates & documents | ✅ | ✅ | ❌ |
| Delete candidates & documents | ✅ | ❌ | ❌ |

## API overview

All routes except login require `Authorization: Bearer <token>`. `X-Tenant-Id` is optional; if present it must match the token's tenant or the request is rejected (defense in depth — the tenant used for every query always comes from the token, never from client input).

### Auth

```http
POST /api/auth/login
{ "email": "alice@alpha.com", "password": "Password123!" }
```

### Candidates

```http
GET    /api/candidates              # list (any role)
POST   /api/candidates              # create (admin, recruiter)
GET    /api/candidates/:id          # detail + documents (any role)
PATCH  /api/candidates/:id          # update (admin, recruiter)
DELETE /api/candidates/:id          # delete, cascades documents (admin only)
```

### Compliance documents

```http
POST   /api/candidates/:id          # add a document to a candidate (admin, recruiter)
PATCH  /api/documents/:id           # update a document (admin, recruiter)
DELETE /api/documents/:id           # delete a document (admin only)
GET    /api/documents/expiring-soon # documents expiring within 30 days (any role)
```

## Testing

```bash
npm test
```

Tests run against an isolated SQLite file (`prisma/test.db`, gitignored), separate from the dev database, with tables truncated between tests. Coverage includes:

- `auth.test.ts` — login success, wrong password, unknown email, malformed input
- `rbac.test.ts` — the full role matrix above, enforced at the API layer
- `tenant-isolation.test.ts` — data-layer isolation plus an API-level check that a mismatched `X-Tenant-Id` header is rejected
- `expiry.test.ts` — the 30-day expiry boundary logic

## Notes on security and design

- Every record (`Candidate`, `ComplianceDocument`) is scoped by `tenantId`, and every query filters on it — there is no code path that reads across tenants.
- The tenant used for authorization always comes from the signed JWT, never from a client-supplied header or body field; the optional `X-Tenant-Id` header is only used to *reject* a mismatch, not to select the tenant.
- Passwords are hashed with bcrypt; JWTs expire after 7 days.
- Role checks happen server-side on every mutating route — the frontend hides controls a role can't use, but that's a UX convenience, not the enforcement boundary.
- Deleting a candidate cascades to its compliance documents at the database level, so there's no way to leave orphaned records.
- Deliberately out of scope for a take-home of this size: refresh tokens / logout revocation, rate limiting, audit logging, and password reset flows. In a production system these would sit alongside the existing auth middleware.

## AI usage note

I used AI assistants to accelerate boilerplate generation, review the implementation against the assignment brief, and refine security-sensitive areas (tenant isolation, RBAC, password hashing). I reviewed the generated code and made the judgment calls documented above — notably the SQLite-over-Postgres decision and the RBAC/CRUD scope — rather than accepting suggestions blindly.
