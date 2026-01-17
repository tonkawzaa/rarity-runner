---
name: Rarity Runner Development
description: Comprehensive guide and best practices for developing the Rarity Runner application.
---

# Rarity Runner Development

## Project Overview

Rarity Runner is a Next.js application designed for tracking running activities, integrating with Strava, and providing leaderboards. It uses a modern stack with Next.js 16 (App Router), Server Actions, and raw SQL connections to a Neon PostgreSQL database.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js v5 (Beta) with Google Provider
- **Database**: PostgreSQL (hosted on Neon)
- **DB Driver**: `pg` (node-postgres)
- **Date Handling**: `date-fns`

## Project Structure

```
rarity-runner/
├── app/                  # Next.js App Router pages and API routes
├── components/           # Reusable React components
├── lib/
│   └── db/
│       ├── models/       # Data access layer (Repository pattern)
│       ├── schema/       # SQL schema definitions
│       ├── db.ts         # Database connection pool
│       ├── migrate*.ts   # Migration scripts
│       └── setup.sql     # Initial schema
├── auth.ts               # NextAuth configuration
├── public/               # Static assets
└── next.config.ts        # Next.js configuration
```

## Development Conventions

### 1. Database Interactions

- **Pattern**: Use the Repository pattern found in `lib/db/models/`.
- **Querying**: Use raw SQL queries via the `pool` exported from `lib/db/db.ts`.
- **Migrations**: Database schema changes are handled via scripts in `lib/db/` (e.g., `migrate.ts`, `setup.sql`).
- **Models**: Create new models in `lib/db/models/<entity>.ts`. Each model should export functions for CRUD operations.

**Example:**

```typescript
import { pool } from "../db";

export async function getUser(id: string) {
  const query = "SELECT * FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
}
```

### 2. Authentication

- **Access Session**: Use the `auth` helper from `@/auth` in Server Components.
- **API Routes**: Use `handlers` for API routes (e.g., `app/api/auth/[...nextauth]/route.ts`).
- **User Sync**: The `signIn` callback in `auth.ts` syncs Google users to the local `users` table.

### 3. Styling

- Use Tailwind CSS utility classes.
- Ensure responsive design (mobile-first).
- Tailwind v4 supports direct CSS variables for theme configuration.

### 4. Code Quality

- **Type Safety**: Strict TypeScript usage. Avoid `any` where possible.
- **Linting**: Run `npm run lint` to check for issues.

## Common Workflows

### Running Locally

```bash
npm run dev
```

### Database Operations

Refer to `lib/db/setup.sql` or migration scripts like `lib/db/migrate-strava.ts`.

### Adding a New Feature

1. **Plan**: Identify necessary DB changes and UI components.
2. **DB**: Add/Update models in `lib/db/models/`.
3. **UI**: Create components in `components/` and pages in `app/`.
4. **Integration**: Connect UI to DB using Server Actions (preferred for forms) or API routes.

## Key Files Reference

| File                      | Description                                 |
| ------------------------- | ------------------------------------------- |
| `auth.ts`                 | Authentication logic                        |
| `lib/db/db.ts`            | Database connection pool                    |
| `lib/db/models/strava.ts` | Strava data model with UPSERT operations    |
| `lib/db/models/user.ts`   | User data model                             |
| `next.config.ts`          | Next.js configuration (e.g., remote images) |
