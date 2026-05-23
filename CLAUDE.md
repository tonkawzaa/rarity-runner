# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rarity Runner is a running leaderboard app built with Next.js 16 App Router. Users sign in with Google, connect their Strava account, and the app syncs running activities to display personal stats, a group leaderboard, and recent activities.

## Commands

```bash
npm run dev        # http://localhost:3000 (uses webpack mode)
npm run build
npm run lint

# Database migrations (run once per environment)
npx tsx lib/db/migrate.ts          # Creates users table
npx tsx lib/db/migrate-strava.ts   # Creates strava_connections + running_activities tables
```

## Environment Variables (`.env.local`)

```
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

## Architecture

### Auth (`auth.ts`)
NextAuth v5 beta with Google OAuth. The `signIn` callback upserts the user to PostgreSQL on every login. `session` callback injects `user.id` (= `token.sub`) into the session.

**Important quirk:** `session.user.id` (from the JWT `sub` claim) may differ from the actual `users.id` in the database when the same email is reused with a different Google account ID. Always resolve the real DB user ID via `getUserByEmail(session.user.email)` before querying Strava data. This pattern appears in `DashboardSections.tsx` and `app/profile/page.tsx`.

### Database (`lib/db/`)
- `db.ts` — singleton `Pool`, exports `query()`, `transaction()`, `getClient()`, `pool`
- `db.config.ts` — reads connection config from env
- `cache.ts` — LRU caches: `stravaConnectionCache` (30 min), `userStatsCache` (30 min), `leaderboardCache` (5 min)
- `models/user.ts` — `upsertUser`, `getUserById`, `getUserByEmail`, `getAllUsers`
- `models/strava.ts` — `upsertStravaConnection`, `getStravaConnectionByUserId`, `getRunningStats`, `getRunningActivities`, `getLeaderboard`, `deleteStravaConnection`

### Pages & Routes
| Path | Description |
|------|-------------|
| `/` | Landing / Google sign-in |
| `/dashboard` | Main dashboard, uses Suspense streaming per section |
| `/profile` | User profile + Strava connect/disconnect + uploaded photo |
| `/api/strava/connect` | Starts Strava OAuth flow |
| `/api/strava/callback` | Handles OAuth callback, syncs all historical activities |
| `/api/strava/disconnect` | Deletes Strava connection + activities |
| `/api/strava/webhook` | Receives real-time Strava activity pushes |
| `/api/profile/upload` | Profile image upload (20 MB limit, stored as base64 in DB) |

### Dashboard Streaming Pattern
`app/dashboard/page.tsx` renders the page skeleton immediately (header + welcome card), then wraps each data-heavy section in `<Suspense>` with a skeleton fallback. Each section component in `DashboardSections.tsx` is an async server component that fetches its own data independently, enabling parallel streaming.

### Styling
Tailwind CSS v4 with a custom "liquid glass" design system. CSS variables for colors and glass effects are defined in `app/globals.css`. Common utility classes: `liquid-glass-bg`, `glass-nav`, `card-premium`. Animation components (`AnimatedSection`, `StaggerContainer`, `StaggerItem`) wrap Framer Motion.

### Image Handling
`next.config.ts` allows remote images from `lh3.googleusercontent.com` (Google) and `api.dicebear.com` (fallback avatars). Profile image preference order: custom uploaded image from DB → Google OAuth image.
