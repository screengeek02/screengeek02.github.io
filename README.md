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
├── app.js
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

### Worker GPS tracking migration

To add worker GPS tracking support (`lastLatitude`, `lastLongitude`, `lastUpdated`), run:

```bash
npx prisma migrate dev --name add_worker_location
npx prisma generate
```

5. Start dev server:
   ```bash
   npm run dev
   ```

## Deploying on Plesk VPS (Node.js Extension)

The Plesk screenshot error (`startup file /httpdocs/app.js is not found`) is fixed by this repo including an `app.js` startup entrypoint.

### 1) Server prerequisites

- Node.js extension enabled in Plesk
- PostgreSQL database created and accessible from your app domain user
- Domain/subdomain created: `app.heliocleaning.com`

### 2) Upload code to application root

- Upload project files into your domain **Application Root** (example: `/httpdocs` or a separate folder like `/httpdocs/helio-service-scheduler`).
- Ensure `package.json`, `.next` build output (after build), and `app.js` are inside the same root.

### 3) Configure Node.js settings in Plesk

In **Websites & Domains → app.heliocleaning.com → Node.js**:

- **Application mode**: `production`
- **Application root**: your project folder (example `/httpdocs`)
- **Document root**: `public` (recommended by Plesk) or leave as configured by your hosting policy
- **Application startup file**: `app.js`
- **Package manager**: `npm`

### 4) Add environment variables in Plesk UI

Use **Custom environment variables** and add:

- `DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/helio_scheduler`
- `AUTH_SECRET=<long-random-secret>`
- `NEXT_PUBLIC_APP_URL=https://app.heliocleaning.com`
- `NODE_ENV=production`

### 5) Install/build/start from Plesk

Use buttons in Node.js page (**NPM install**, **Run script**) in this order:

1. `npm install`
2. `npm run build`
3. `npm run db:migrate`
4. `npm run db:seed` (first deployment only, or when you want demo data)
5. Click **Restart App**

Plesk will run `app.js`, which serves the compiled Next.js app.

### 6) Common Plesk troubleshooting

- **“app.js not found”**: ensure startup file is exactly `app.js` and exists in Application Root.
- **Blank page / 500**: check Node.js logs in Plesk and verify `npm run build` completed.
- **Database errors**: confirm `DATABASE_URL` credentials, host/IP allowlist, and SSL requirements.
- **Wrong URL redirects**: verify `NEXT_PUBLIC_APP_URL` is `https://app.heliocleaning.com`.

## Demo Seed Credentials

Password for all users: `DemoPass123!`

- Admin: `admin@heliocleaning.com`
- Worker 1: `worker1@heliocleaning.com`
- Worker 2: `worker2@heliocleaning.com`
