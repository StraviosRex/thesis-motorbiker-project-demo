# TODO

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