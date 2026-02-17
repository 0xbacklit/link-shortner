# Link Shortner

React + Express + PostgreSQL (Supabase) + Prisma.

## Structure
- `client` React UI (Vite)
- `server` Express API

## Prereqs
- Node.js 18+
- PostgreSQL (Supabase recommended)

## Setup
1. Create a Postgres database in Supabase.
2. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL`.
3. Install deps:
   - `cd server && npm install`
   - `cd ../client && npm install`
4. Run Prisma migrations:
   - `cd server && npx prisma migrate dev --name init`
5. Start the API:
   - `cd server && npm run dev`
6. Start the UI:
   - `cd client && npm run dev`

## APIs
- `POST /api/shorten`
  - body: `{ longUrl, expiresInDays }` (set to `null` for permanent)
- `GET /:code` redirects to the long URL

## Notes
- `shortCode` is indexed and unique for fast lookups.
- If `permanent` is false, `expiresAt` is required.
