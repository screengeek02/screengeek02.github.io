# Helio Service Scheduler (MVP)

Production-ready MVP for app.heliocleaning.com built with Next.js 14 + Prisma + PostgreSQL.

## Directory Structure

```text
.
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   └── jobs/[id]/page.tsx
│   ├── api/
│   │   ├── admin/jobs/route.ts
│   │   ├── admin/jobs/[id]/assign/route.ts
│   │   ├── admin/jobs/[id]/status/route.ts
│   │   ├── admin/stats/route.ts
│   │   ├── admin/workers/route.ts
│   │   ├── auth/login/route.ts
│   │   ├── auth/logout/route.ts
│   │   ├── bookings/route.ts
│   │   ├── jobs/[id]/route.ts
│   │   └── worker/jobs/...
│   ├── book/
│   │   ├── confirmation/page.tsx
│   │   └── page.tsx
│   ├── login/page.tsx
│   ├── worker/
│   │   ├── dashboard/page.tsx
│   │   └── jobs/[id]/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── loading-button.tsx
│   └── status-badge.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── permissions.ts
│   └── validations.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
├── package.json
└── .env.example
```

## Features

- Public booking flow (`/book`, `/book/confirmation`)
- Role-based login and protected routes via middleware + JWT cookie sessions
- Admin dashboard with filters, assignment, status update, and details
- Worker dashboard with assigned jobs and status transitions
- Backend status transition enforcement
- Zod validation for booking/login/updates

## Prisma Schema

Includes:
- `Role`: `ADMIN`, `WORKER`
- `JobStatus`: `PENDING`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `ServiceType`: `STANDARD`, `DEEP`, `MOVE_OUT`
- Models: `User`, `Job`, `JobNote` with proper relations and indexes

## Setup (Local)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure env:
   ```bash
   cp .env.example .env
   ```
3. Run migrations:
   ```bash
   npm run db:migrate
   ```
4. Seed database:
   ```bash
   npm run db:seed
   ```
5. Start dev server:
   ```bash
   npm run dev
   ```

## Demo Seed Credentials

Password for all users: `DemoPass123!`

- Admin: `admin@heliocleaning.com`
- Worker 1: `worker1@heliocleaning.com`
- Worker 2: `worker2@heliocleaning.com`
