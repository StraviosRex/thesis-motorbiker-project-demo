# TODO

---

## Tech Stack

### Runtime & Language
- **TypeScript 5.6** — end-to-end (client + server + shared schema)
- **Node.js** — server runtime (`tsx` for dev, `esbuild` for prod build)

### Frontend
- **React 18** — UI framework
- **Vite 5** — bundler / dev server
- **Wouter** — client-side routing (lightweight React Router alternative)
- **TailwindCSS 3** + `tailwindcss-animate` + `@tailwindcss/typography` — styling
- **shadcn/ui** (Radix UI primitives + CVA) — component library
- **Framer Motion** — animations
- **Lucide React** + **React Icons** — icon sets
- **TanStack React Query v5** — server state / data fetching
- **React Hook Form** + **Zod** — form handling and validation
- **Leaflet 1.9** + `leaflet-routing-machine` + `@mapbox/polyline` — interactive map
- **Recharts** — charts / data visualisation
- **date-fns** — date utilities

### Backend
- **Express 4** — HTTP server
- **express-session** + **connect-pg-simple** — session management (Postgres-backed)
- **Passport** + `passport-local` — authentication
- **serverless-http** — Netlify Functions adapter
- **ws** — WebSocket support

### Database & ORM
- **PostgreSQL** (Neon serverless) — primary database
- **Drizzle ORM** — type-safe ORM + migrations
- **drizzle-kit** — schema push / migration tooling
- **drizzle-zod** + **drizzle-seed** — schema validation helpers and seed utilities

### External APIs
- **OpenRouteService** — dynamic route calculation (driving-car profile, avoid highways)
- **Nominatim (OpenStreetMap)** — geocoding & reverse geocoding
- **Overpass API** — Points of Interest (restaurants, fuel, hotels, motorcycle POIs)

### Infrastructure & Deployment
- **Netlify** — hosting + serverless functions (`netlify-cli`)
- **dotenv** — local environment variable loading

### Dev Tooling
- **tsx** — TypeScript execution for dev server & scripts
- **esbuild** — production server bundling
- **drizzle-kit push** — schema sync to DB
- **TypeScript strict mode** — full type checking (`tsc`)

---

## Overpass API / POI Service Improvements

Upgrade `server/services/poi.ts` to fetch more motorcycle-specific POIs from OpenStreetMap.

### Missing OSM tags to add to queries
- `shop=motorcycle_repair` — dedicated repair workshops (currently merged with `shop=motorcycle`)
- `amenity=motorcycle_parking` — dedicated motorcycle parking lots
- `motorcycle:theme=yes` — biker-themed restaurants, cafes, and accommodation
- `motorcycle:parking=yes` — any venue that explicitly offers motorcycle parking

### Performance: switch curated routes to a bounding-box query
Currently `getPOIsAlongRoute()` fires one Overpass API request per waypoint (5–6 calls for Alpine).
A single bbox query covering the whole route is faster and uses less API quota.

Plan:
1. Add `getPOIsInBoundingBoxForRoute()` — derives bbox from route segment coordinates, fires one query with all motorcycle tags
2. Update `GET /api/routes/:id/pois` in `server/routes.ts`:
   - Use bbox query for curated routes (id > 0)
   - Keep per-point query for dynamic routes (id === 0)

### Reference
Python proof-of-concept that inspired this:
```python
overpass_query = f"""
[out:json][timeout:60];
(
  node["shop"="motorcycle_repair"]({bbox});
  node["shop"="motorcycle"]({bbox});
  node["amenity"="fuel"]({bbox});
  node["amenity"="motorcycle_parking"]({bbox});
  node["motorcycle:theme"="yes"]({bbox});
  node["motorcycle:parking"="yes"]({bbox});
);
out body;
"""
```
Alpine bbox example: `45.0,6.0,47.5,11.5` (N Italy, Austria, S Germany)