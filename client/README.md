# MotoRoute Europe - Motorcycle Route Planner

A web application for planning motorcycle trips across Europe, featuring route planning, scenic road discovery, ferry connections, accommodation suggestions, and points of interest.

Built as part of a master's thesis case study on AI-assisted solo software development at VŠE Prague.

## Live Demo

Open `index.html` in any browser to see the fully interactive demo with:

- **Three-panel layout**: Route Planner (left) | Interactive Map (center) | Route Details (right)
- **Leaflet.js map** with OpenStreetMap tiles, route polylines, and interactive markers
- **Two sample routes**: "Alpine Adventure" (Berlin to Rome) and "Scandinavian Tour" (Copenhagen to Oslo)
- **Route segments** with day-by-day breakdown, waypoints, start/end times
- **Points of interest** with ratings and type-coded icons (rest stops, shops, viewpoints)
- **Accommodation listings** with pricing, ratings, and biker-friendly features
- **Ferry crossing information**

## Tech Stack

### Demo (`index.html`)
Self-contained single-file demo using vanilla HTML/CSS/JS + Leaflet.js (CDN). No build step required.

### Full Application (`src/`)
- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui, Leaflet.js, Wouter (routing), TanStack Query
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon Serverless), Drizzle ORM
- **Originally developed on**: Replit (scaffolding), then Cursor + GitHub Copilot, then Windsurf

## Project Structure

```
motoroute-europe/
├── index.html                    # Self-contained demo (open in browser)
├── generated-icon.png            # App icon (compass rose)
├── README.md
└── src/                          # Full application source code
    ├── client/
    │   ├── index.html
    │   └── src/
    │       ├── App.tsx
    │       ├── main.tsx
    │       ├── index.css
    │       ├── components/
    │       │   ├── AppLayout.tsx
    │       │   ├── Header.tsx
    │       │   ├── MapArea.tsx
    │       │   ├── MapLegend.tsx
    │       │   ├── RoutePlanner.tsx
    │       │   ├── RouteDetails.tsx
    │       │   ├── SavedRoutes.tsx
    │       │   ├── PointsOfInterest.tsx
    │       │   ├── Accommodation.tsx
    │       │   ├── FerryInfo.tsx
    │       │   └── ui/
    │       │       └── accordion.tsx
    │       ├── pages/
    │       │   ├── Home.tsx
    │       │   └── RouteView.tsx
    │       ├── hooks/
    │       │   └── use-map.tsx
    │       └── lib/
    │           ├── utils.ts
    │           └── queryClient.ts
    ├── server/
    │   ├── routes.ts
    │   ├── storage.ts
    │   └── vite.ts
    ├── shared/
    │   └── schema.ts
    ├── db/
    │   └── seed.ts
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── drizzle.config.ts
    ├── postcss.config.js
    └── components.json
```

## Data Model

Seven PostgreSQL tables managed via Drizzle ORM:

| Table | Purpose |
|---|---|
| `locations` | Shared lat/lng points (cities, waypoints, ports) |
| `saved_routes` | Core route entity with preferences and date range |
| `route_segments` | Per-day segments within a route |
| `waypoints` | Ordered intermediate points per segment |
| `points_of_interest` | Typed POIs (rest, shop, viewpoint) with ratings |
| `accommodations` | Lodging with pricing, ratings, features |
| `ferry_routes` | Ferry connections with operator and schedule |

## Design System

- **Primary**: Navy (`hsl(217, 55%, 24%)`)
- **Accent**: Orange (`hsl(16, 100%, 56%)`)
- **Ferry Blue**: `hsl(200, 96%, 49%)`
- **Scenic Green**: `hsl(142, 67%, 45%)`
- **Typography**: Montserrat (headings), Inter (body)

## AI Development Timeline

| Period | Tool | Phase |
|---|---|---|
| Nov 2024 | Replit | Scaffolding |
| Nov 2024 - Feb 2025 | Cursor + GitHub Copilot | Core development |
| Feb 2025+ | GitHub Copilot (agentic) | Feature iteration |
| Mid 2025 | Windsurf | Current development |

## License

This project is part of academic research. Source code is provided for reference and demonstration purposes.
