# E3OS Candidate Compliance Mini-Module

This project is a small full-stack implementation of the E3OS take-home assessment. It demonstrates a tenant-aware candidate and compliance-document workflow with a Next.js frontend, Prisma ORM, and PostgreSQL.

## Features

- Tenant-scoped candidate listing and creation
- Candidate detail endpoint with document listing
- Compliance document creation for a candidate
- Expiring-soon business logic endpoint
- Authentication and authorization enforcement
- Multi-tenant isolation checks
- Basic React frontend for listing and creating candidates
- Vitest coverage for expiry logic and tenant isolation

## Technology choices

- Next.js + TypeScript for the frontend and API routes
- Prisma + PostgreSQL for the relational model
- Zod for request validation
- JWT for auth tokens
- Vitest for concise unit tests

## AI usage note

I used AI assistants to accelerate boilerplate generation, validate the project structure, and refine the implementation. I reviewed and corrected any generated code, especially around security-sensitive tenant isolation and database design, rather than accepting it blindly.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL locally and create a database called `e3os`.

4. Update `DATABASE_URL` in `.env` if needed.

5. Generate the Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

6. Start the app:
   ```bash
   npm run dev
   ```

7. Open `http://localhost:3000`.

## Seed data

The app includes a simple seed helper that creates two tenants and a few sample records.

```bash
npx tsx src/lib/seed.ts
```

## API overview

### Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "alice@alpha.com",
  "tenantId": "tenant-1"
}
```

### List/create candidates

```http
GET /api/candidates
POST /api/candidates
```

Headers:

```http
Authorization: Bearer <token>
X-Tenant-Id: tenant-1
```

### Candidate detail and add document

```http
GET /api/candidates/:id
POST /api/candidates/:id
```

### Expiring documents

```http
GET /api/documents/expiring-soon
```

## Testing

Run unit tests with:

```bash
npm test
```

## Notes on security and design

- Every data record is scoped by `tenantId`.
- Authentication is required for every protected route.
- A user can only access data for their own tenant.
- Recruiters are allowed to create candidates; other roles are prevented.
- Validation is enforced with Zod and sensible HTTP status codes.
