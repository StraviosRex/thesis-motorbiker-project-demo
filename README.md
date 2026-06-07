# European Rider Guide Portable Demo

A demo version of full-stack web application for planning motorcycle trips across Europe with dynamic route calculation, curated scenic routes, POIs, ferry crossings, and accommodation suggestions on an interactive map.

---

## Features

- **Dynamic route calculation** between any two European cities via OpenRouteService
- **Curated routes** stored in the database with hand-picked waypoints and details
- **Per-segment road info** with day-by-day breakdowns, distances, and ride times
- **Points of interest** (rest stops, fuel, viewpoints) pulled from Overpass API
- **Ferry route information** for cross-sea legs (e.g. Greece, Scandinavia)
- **Accommodation listings** with biker-friendly features and pricing
- **Interactive map** built on Leaflet + OpenStreetMap with route polylines and markers
- **Scenic/highway preferences** — route can avoid motorways or favour twisty roads
- Graceful fallback: curated DB routes work even without an API key

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Routing (client) | Wouter, TanStack Query |
| Map | Leaflet 1.9, OpenStreetMap tiles |
| Backend | Express.js, Node.js, TypeScript |
| Database | PostgreSQL (Neon Serverless), Drizzle ORM |
| External APIs | OpenRouteService (routing), Nominatim (geocoding), Overpass (POIs) |

---

## Prerequisites

- Node.js 20+ (22 recommended)
- npm 10+
- A PostgreSQL database — [Neon](https://neon.tech) free tier works out of the box

---

## Installation & Setup

**1. Clone and install dependencies**

```bash
git clone <repo-url>
cd EuropeanRiderGuide
npm install
```

**2. Configure environment variables**

```bash
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
```

Edit `.env` and fill in your values:

```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB_NAME?sslmode=require
OPENROUTESERVICE_API_KEY=your_key_here   # optional — see API Keys section
```

**3. Push the database schema**

```bash
npm run db:push
```

**4. (Optional) Seed sample data**

```bash
npm run db:seed
```

---

## Running the App

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (Express + Vite HMR) on port 5000 |
| `npm run build` | Build client and bundle server to `dist/` |
| `npm start` | Run production build (`NODE_ENV=production`) |
| `npm run check` | TypeScript type-check |

The dev server serves both the API and the React frontend on **http://localhost:5000**.

---

## Project Structure

```
EuropeanRiderGuide/
├── client/
│   └── src/
│       ├── components/     # UI components (MapArea, RoutePlanner, RouteDetails, FerryInfo, …)
│       ├── pages/          # Route-level pages (Home, RouteView)
│       ├── hooks/          # use-map and other custom hooks
│       └── lib/            # Query client, utilities
├── server/
│   ├── index.ts            # Express app entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # DB access layer
│   └── services/
│       ├── geocoding.ts    # Nominatim geocoding
│       ├── routing.ts      # OpenRouteService client
│       ├── poi.ts          # Overpass API POI queries
│       └── dynamicRoute.ts # Orchestrates geocoding + routing + segmentation
├── db/
│   ├── index.ts            # Drizzle client + connection
│   └── seed.ts             # Sample route seed data
├── shared/
│   └── schema.ts           # Drizzle schema + Zod types (shared client/server)
├── drizzle.config.ts
├── vite.config.ts
└── .env.example
```

---

## API Keys

### OpenRouteService (required for dynamic routing)

- Sign up at **https://openrouteservice.org/dev/** — free, no credit card
- Free tier: 2,000 requests/day, 40 requests/minute
- Without this key, only curated routes stored in the database will work
- Add as `OPENROUTESERVICE_API_KEY` in `.env`

### Nominatim (geocoding)

- No API key required
- Rate limit: 1 request/second — handled automatically by the service layer

### Overpass API (POIs)

- No API key required
- Public endpoint used for querying points of interest along routes

---

## Quick API Smoke Test

Once the dev server is running:

```
GET http://localhost:5000/api/routes/saved
GET http://localhost:5000/api/routes/search?q=alpine
```
