# Setup Requirements

This document lists the minimum requirements and setup steps to run the full app locally.

## 1) System Requirements

- Node.js 20+ (Node.js 22 tested in this repo)
- npm 10+
- Access to a PostgreSQL database (Neon or any PostgreSQL-compatible host)
- Git (recommended)

## 2) Required Environment Variables

Create a local `.env` file in the project root (or set environment variables in your shell).

Required values:

- `DATABASE_URL`: PostgreSQL connection string used by:
  - runtime DB access in `db/index.ts`
  - Drizzle CLI in `drizzle.config.ts`

Optional values:

- `OPENROUTESERVICE_API_KEY`: API key for dynamic route calculation
  - Sign up at https://openrouteservice.org/dev/ (free, no credit card)
  - Without this key, only curated routes from the database will work
  - With this key, ANY city-to-city route can be calculated dynamically

Example format:

```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB_NAME?sslmode=require
OPENROUTESERVICE_API_KEY=your_key_here
```

## 3) Initial Setup

From the project root:

```bash
npm install
```

Copy env template:

```bash
cp .env.example .env
```

(Windows PowerShell alternative)

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set a valid `DATABASE_URL`.

## 4) Database Setup

Push schema to your database:

```bash
npm run db:push
```

Optional seed data:

```bash
npm run db:seed
```

## 5) Run the Application

Development mode:

```bash
npm run dev
```

The app server runs on port `5000`.

Production-like run:

```bash
npm run build
npm start
```

## 6) Verification

Type-check project (may report pre-existing issues unrelated to your changes):

```bash
npm run check
```

Quick API smoke test once app is running:

- `GET /api/routes/saved`
- `GET /api/routes/search?q=alpine`

## 7) Common Setup Failures

### `DATABASE_URL must be set`

Cause: missing environment variable.

Fix:

- Ensure `.env` exists and contains `DATABASE_URL`, or
- Set it in current PowerShell session:

```powershell
$env:DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB_NAME?sslmode=require"
npm run dev
```

### TypeScript cannot find modules/types

Cause: dependencies not installed.

Fix:

```bash
npm install
```
