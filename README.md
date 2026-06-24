# MotoRoute Europe

A full-stack web application for planning motorcycle trips across Europe. Built as a thesis demonstration project, it combines dynamic route calculation, a curated scenic route database, live points of interest, ferry crossings, weather data, and accommodation suggestions on an interactive map — all tailored to different motorcycle classes.

**Live demo:** https://mellifluous-paprenjak-dd5e18.netlify.app/

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Status](#project-status)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Tech Stack](#tech-stack)
6. [Database Schema](#database-schema)
7. [Prerequisites](#prerequisites)
8. [Installation & Setup](#installation--setup)
9. [Running the App](#running-the-app)
10. [Usage Guide](#usage-guide)
11. [Project Structure](#project-structure)
12. [API Reference](#api-reference)
13. [External API Keys](#external-api-keys)
14. [Deployment](#deployment)
15. [Security](#security)

---

## Project Overview

MotoRoute Europe addresses the lack of motorcycle-specific route planning tools for European travel. General-purpose navigation apps like Google Maps treat all vehicles the same — they do not account for a motorcycle's preferred road types, daily distance limits, surface compatibility, or the experience of riding through scenic mountain passes versus flat motorways.

This application solves that by:

- Maintaining a hand-curated database of iconic European motorcycle routes with day-by-day breakdowns
- Dynamically calculating routes between any two European cities when no curated route exists
- Tailoring route recommendations to the rider's motorcycle class (Adventure, Touring, Cruiser, Sport, Roadster, Scooter)
- Enriching routes with live data: points of interest, weather forecasts, ferry crossings, and accommodation

---

## Project Status

### Fully Working

| Feature | Details |
|---|---|
| Route planning (curated) | Hand-picked routes retrieved from the database with full day-by-day detail |
| Route planning (dynamic) | Live calculation via OpenRouteService for any two European cities not covered by a curated route |
| Fuzzy route search | Dice-coefficient + bigram matching for flexible location name input |
| Interactive map | Leaflet map with route polylines, start/end markers, and POI pins |
| Motorcycle class profiles | 6 bike types — each with daily distance limits, surface preferences, and a compatibility score for any given route |
| Points of Interest | Live Overpass API queries (fuel, rest stops, viewpoints, repair shops) with 24-hour disk cache |
| Ferry route information | Curated European ferry routes matched by coordinates, with operator and pricing |
| Weather widget | Live conditions at route waypoints via Open-Meteo (no API key required) |
| Accommodation listings | Biker-friendly properties stored per route with ratings and features |
| User authentication | Register, log in, log out — passwords hashed with `crypto.scrypt`, sessions in Postgres |
| Theme switcher | Four visual themes persisted in `localStorage` |
| Netlify deployment | Serverless function adapter configured and live |

---

### Under Construction / Planned

| Feature | Status | Notes |
|---|---|---|
| Save routes to user account | Partially built | `createdBy` and `isPublic` columns exist in the schema but the save-route endpoint does not yet associate a route with the logged-in user |
| User profile page | Not started | No `/profile` page or route exists yet |
| Public route sharing | Not started | `is_public` flag is in the schema; no UI or API filter for it yet |
| More motorcycle-specific POIs | Planned | Missing OSM tags: `shop=motorcycle_repair`, `amenity=motorcycle_parking`, `motorcycle:theme=yes` |
| POI query optimisation | Planned | Switch from per-waypoint Overpass requests to a single bounding-box query for better performance |
| Data visualisation | Partially built | Recharts is installed and imported but not yet used for surface/elevation charts in the route details panel |

---

### Known Issues & Challenges

| Issue | Description |
|---|---|
| Dynamic route map rendering | When a user enters two custom locations that are not in the curated database, the route is calculated via OpenRouteService but the polyline does not always draw correctly on the map simultaneously — the route details may appear in the panel while the map fails to render the path |
| Custom route reliability | Dynamic route calculation depends entirely on OpenRouteService's availability and the quality of its geocoding. Ambiguous city names, small towns, or locations near borders can return incorrect or no results |
| Curated route coverage | Only a limited set of iconic European routes are in the database. Any origin/destination pair outside that set falls back to dynamic calculation, which is less reliable |
| Session persistence on Netlify | Netlify's serverless functions are stateless between invocations; sessions survive because they are stored in Postgres, but cold starts can occasionally cause a brief delay on the first authenticated request |

---

## Features

- **Dynamic route calculation** between any two European cities via OpenRouteService
- **Curated scenic routes** stored in the database with hand-picked waypoints, timing, and road notes
- **Motorcycle class profiles** — six bike types (ADV, GT, Cruiser, Sport, Roadster, Scooter), each with daily distance limits, surface preferences, and compatibility warnings
- **Per-segment road info** — day-by-day breakdowns with distances, estimated ride times, surface data (asphalt/gravel/dirt), and speed limits
- **Points of interest** — rest stops, fuel stations, viewpoints, repair shops, and meeting points pulled live from Overpass API
- **Ferry route information** — cross-sea legs with operator, price, schedule, and port coordinates
- **Accommodation listings** — biker-friendly properties with features and pricing
- **Live weather widget** — current conditions at route waypoints via Open-Meteo (no API key required)
- **Interactive map** — Leaflet + OpenStreetMap tiles with route polylines, markers, and a dynamic map legend
- **User authentication** — register, log in, log out; sessions persisted in Postgres
- **Theme switcher** — four visual themes (Emerald Atlas, Midnight Rider, Alpine, Desert Run)
- **Graceful fallback** — curated DB routes work even without an OpenRouteService API key

---

## Architecture

The application follows a classic three-tier architecture:

```
┌─────────────────────────────────────────────────┐
│                   Client (React)                │
│  Wouter (routing) · TanStack Query (server state)│
│  Leaflet (map) · shadcn/ui (components)         │
└────────────────────┬────────────────────────────┘
                     │ HTTP / REST
┌────────────────────▼────────────────────────────┐
│                Express.js Server                │
│  Passport.js (auth) · express-session           │
│  Route calculation orchestrator                 │
│  ┌──────────────────────────────────────────┐   │
│  │             Service Layer                │   │
│  │  geocoding · routing · POI · ferry       │   │
│  └──────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│          PostgreSQL (Neon Serverless)            │
│              Drizzle ORM                        │
└─────────────────────────────────────────────────┘
```

**Route resolution strategy:** When a user requests a route, the server first tries to match it against curated routes in the database using a fuzzy scoring algorithm (Dice coefficient + bigram matching). If no good match is found, it falls back to live calculation via OpenRouteService, which is then geocoded, segmented, and returned in the same format as a curated route.

**Session storage:** User sessions are stored in the `session` Postgres table via `connect-pg-simple`, making them durable across server restarts and compatible with serverless deployments.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Client routing | Wouter |
| Server state | TanStack Query v5 |
| Map | Leaflet 1.9, OpenStreetMap tiles |
| Backend | Express.js 4, Node.js 20+, TypeScript |
| Auth | Passport.js (local strategy), express-session, connect-pg-simple |
| Password hashing | Node.js built-in `crypto.scrypt` |
| Database | PostgreSQL via Neon Serverless (`@neondatabase/serverless`) |
| ORM | Drizzle ORM + Drizzle Kit |
| Validation | Zod, drizzle-zod |
| Forms | React Hook Form + @hookform/resolvers |
| Deployment | Netlify (serverless functions) |
| External APIs | OpenRouteService, Nominatim, Overpass API, Open-Meteo |

---

## Database Schema

All tables are defined in [shared/schema.ts](shared/schema.ts) and shared between the server and client for type safety.

| Table | Description |
|---|---|
| `users` | Registered users — username and hashed password |
| `locations` | Named geographic points with lat/lng coordinates |
| `saved_routes` | Top-level route records with preferences and date ranges |
| `route_segments` | Day-by-day legs of a route, each linking two locations |
| `waypoints` | Ordered intermediate stops within a segment |
| `points_of_interest` | Fuel, rest, viewpoints etc. associated with a route |
| `accommodations` | Lodging options linked to a route and location |
| `ferry_routes` | Sea crossings with operator, schedule, and pricing |

**Relationships:**
- A `saved_route` has many `route_segments`, `points_of_interest`, `accommodations`, and `ferry_routes`
- Each `route_segment` has many `waypoints`
- All geographic entities reference a `location` record

---

## Prerequisites

- Node.js 20+ (22 LTS recommended)
- npm 10+
- A PostgreSQL database — [Neon](https://neon.tech) free tier works out of the box

---

## Installation & Setup

**1. Clone the repository and install dependencies**

```bash
git clone <repo-url>
cd EuropeanRiderGuide
npm install
```

**2. Configure environment variables**

Create a `.env` file in the project root with the following variables:

```env
# PostgreSQL connection string (Neon or any Postgres provider)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require

# OpenRouteService API key — get one free at https://openrouteservice.org/dev/
# Without this, only curated routes from the database will work
OPENROUTESERVICE_API_KEY=your_key_here

# A long random string used to sign session cookies
SESSION_SECRET=replace-with-a-long-random-secret
```

**3. Push the database schema**

This creates all tables in your Postgres database using Drizzle Kit:

```bash
npm run db:push
```

**4. Seed sample route data (recommended)**

Populates the database with curated European motorcycle routes:

```bash
npm run db:seed
```

---

## Running the App

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload on **http://localhost:5000** |
| `npm run build` | Build client (Vite) and bundle server (esbuild) into `dist/` |
| `npm start` | Run the production build |
| `npm run check` | TypeScript type-check (no emit) |
| `npm run db:push` | Sync schema changes to the database |
| `npm run db:seed` | Populate the database with sample routes |

The dev server runs both the Express API and the Vite React frontend on a single port (5000). In production, Express serves the built static files from `dist/`.

---

## Usage Guide

**Planning a route**
1. Enter a starting city and destination in the header search bar (or the left sidebar on mobile)
2. Optionally set trip dates and select your motorcycle class
3. Click **Go** — the app first searches curated routes, then calculates dynamically if none match
4. The route appears on the map with a polyline; the right panel shows day-by-day segments

**Exploring a route**
- Click any segment in the details panel to highlight it on the map
- Switch tabs to view Points of Interest, Accommodations, or Ferry crossings
- The bike class selector shows a compatibility rating (Excellent / Good / Caution / Warning) with specific tips for your motorcycle type

**Authentication**
- Click **Sign In** in the header to register or log in
- Sessions persist across page reloads and browser restarts

**Themes**
- Click the **Theme** button in the header to switch between four colour schemes

---

## Project Structure

```
EuropeanRiderGuide/
├── client/
│   └── src/
│       ├── components/         # UI components
│       │   ├── AppLayout.tsx   # Top-level shell (header + sidebars + map)
│       │   ├── Header.tsx      # Nav bar with route inputs and auth
│       │   ├── MapArea.tsx     # Leaflet map with markers and polylines
│       │   ├── RoutePlanner.tsx# Left sidebar — inputs and bike class
│       │   ├── RouteDetails.tsx# Right panel — segments, POIs, ferry, accommodation
│       │   ├── WeatherWidget.tsx
│       │   ├── FerryInfo.tsx
│       │   ├── SplashScreen.tsx
│       │   └── ui/             # shadcn/ui primitives
│       ├── pages/
│       │   ├── Home.tsx        # Main map view
│       │   ├── RouteView.tsx   # Permalink for a saved route
│       │   └── AuthPage.tsx    # Login / Register
│       ├── hooks/
│       │   ├── use-map.tsx     # Leaflet map state and helpers
│       │   ├── use-auth.tsx    # Auth queries and mutations
│       │   └── use-mobile.tsx  # Responsive breakpoint hook
│       └── lib/
│           ├── queryClient.ts  # TanStack Query client + apiRequest helper
│           └── utils.ts        # Types, bike class definitions, formatters
├── server/
│   ├── index.ts                # Express app bootstrap
│   ├── auth.ts                 # Passport, session middleware, password hashing
│   ├── routes.ts               # All API endpoints
│   ├── storage.ts              # Drizzle-based DB access layer
│   └── services/
│       ├── dynamicRoute.ts     # Route calculation orchestrator
│       ├── geocoding.ts        # Nominatim geocoding
│       ├── routing.ts          # OpenRouteService API client
│       ├── poi.ts              # Overpass API POI queries
│       ├── weather.ts          # Open-Meteo weather client
│       └── ferryLookup.ts      # Curated ferry price table
├── db/
│   ├── index.ts                # Drizzle client + Neon pool
│   └── seed.ts                 # Sample route seed script
├── shared/
│   └── schema.ts               # Drizzle table definitions + Zod types
├── drizzle.config.ts
├── vite.config.ts
└── netlify.toml
```

---

## API Reference

### Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/routes/saved` | List all saved routes |
| `GET` | `/api/routes/search?q=` | Fuzzy search routes by name/description |
| `GET` | `/api/routes/:id` | Get a single route with full detail |
| `POST` | `/api/routes/calculate` | Calculate a route (curated or dynamic) |
| `POST` | `/api/routes` | Save a new route |
| `GET` | `/api/routes/:id/pois` | Get points of interest for a route |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account `{ username, password }` |
| `POST` | `/api/auth/login` | Sign in `{ username, password }` |
| `POST` | `/api/auth/logout` | End the current session |
| `GET` | `/api/auth/me` | Return the logged-in user, or 401 |

### Utilities

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/weather?lat=&lng=` | Current weather at a coordinate |
| `GET` | `/api/ferry-prices?startLat=&startLng=&endLat=&endLng=` | Ferry price lookup by coordinates |
| `DELETE` | `/api/poi-cache[?routeId=]` | Flush the POI cache |

---

## External API Keys

### OpenRouteService — dynamic routing

- Register at **https://openrouteservice.org/dev/** (free, no credit card)
- Free tier: 2,000 requests/day, 40 requests/minute
- Set as `OPENROUTESERVICE_API_KEY` in `.env`
- Without this key the app still works using curated database routes

### Nominatim — geocoding

- No API key required
- Public instance at `nominatim.openstreetmap.org`
- Rate-limited to 1 request/second; handled automatically in the service layer

### Overpass API — points of interest

- No API key required
- Queries the public OpenStreetMap Overpass endpoint

### Open-Meteo — weather

- No API key required
- Free, open-source weather API with no rate limit for reasonable use

---

## Deployment

The project is configured for **Netlify** with serverless functions via `netlify.toml`.

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Preview locally (mirrors the Netlify build environment)
npm run netlify:dev

# Deploy
netlify deploy --prod
```

Set the following environment variables in your Netlify site settings (Site → Environment Variables):

- `DATABASE_URL`
- `OPENROUTESERVICE_API_KEY`
- `SESSION_SECRET`

---

## Security

- Passwords are hashed with **`crypto.scrypt`** (Node built-in) — a memory-hard key derivation function with a unique random salt per user. Plain-text passwords are never stored.
- Timing-safe comparison (`timingSafeEqual`) is used during login to prevent timing attacks.
- Session cookies are `httpOnly` (not accessible to JavaScript) and `secure` in production (HTTPS only).
- Sessions are stored server-side in Postgres — the cookie only contains an opaque session ID.
