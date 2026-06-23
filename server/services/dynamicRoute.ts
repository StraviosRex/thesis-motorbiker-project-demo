import { geocodingService } from "./geocoding";
import { createRoutingService } from "./routing";
import { POIService } from "./poi";
import { SavedRoute, RouteSegment, Location, PointOfInterest, Accommodation, FerryRoute, Coordinates } from "@/lib/utils";

const poiService = new POIService();

// Deterministic pseudo-random so values are stable per POI (not random on every reload)
function stableRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

export async function calculateDynamicRoute(
  startLocation: string,
  endLocation: string,
  preferences?: {
    scenicRoutes?: boolean;
    avoidHighways?: boolean;
    includeFerries?: boolean;
  }
): Promise<SavedRoute | null> {
  console.log(`[DynamicRoute] Calculating route: ${startLocation} → ${endLocation}`);

  // Step 1: Geocode start and end locations
  const startGeo = await geocodingService.geocode(startLocation);
  const endGeo = await geocodingService.geocode(endLocation);

  if (!startGeo || !endGeo) {
    console.error('[DynamicRoute] Geocoding failed');
    return null;
  }

  console.log(`[DynamicRoute] Start: ${startGeo.displayName}`);
  console.log(`[DynamicRoute] End: ${endGeo.displayName}`);

  // Step 2: Calculate route using OpenRouteService
  const routingService = createRoutingService();
  
  if (!routingService) {
    console.error('[DynamicRoute] Routing service not available (missing API key)');
    return null;
  }

  const routeData = await routingService.calculateRoute(
    startGeo.coordinates,
    endGeo.coordinates,
    preferences
  );

  console.log(`[DynamicRoute] Route calculated with ${routeData.segments.length} segments`);

  // Step 3: Build SavedRoute object
  const startLocationObj: Location = {
    id: 0, // Temporary ID for dynamic routes
    name: startLocation,
    coordinates: startGeo.coordinates,
  };

  const endLocationObj: Location = {
    id: 0,
    name: endLocation,
    coordinates: endGeo.coordinates,
  };

  // Step 4: Create route segments with waypoint names and road info
  const roadNotesSuffix = routeData.roadNames.length > 0
    ? ` · Roads: ${routeData.roadNames.slice(0, 5).join(', ')}`
    : '';

  const segments: RouteSegment[] = [];
  for (let index = 0; index < routeData.segments.length; index++) {
    const seg = routeData.segments[index];
    const isFirstSegment = index === 0;
    const isLastSegment = index === routeData.segments.length - 1;
    const segmentStartName = isFirstSegment
      ? startLocation
      : await geocodingService.reverseGeocode(seg.startCoords) || `Day ${seg.day} Start`;
    const segmentEndName = isLastSegment
      ? endLocation
      : await geocodingService.reverseGeocode(seg.endCoords) || `Day ${seg.day} Stop`;

    segments.push({
      id: index,
      day: seg.day,
      title: `Day ${seg.day}: ${segmentStartName} to ${segmentEndName}`,
      distance: seg.distance,
      startLocation: {
        id: 0,
        name: segmentStartName,
        coordinates: seg.startCoords,
      },
      endLocation: {
        id: 0,
        name: segmentEndName,
        coordinates: seg.endCoords,
      },
      startTime: "09:00",
      endTime: calculateEndTime(Math.round(seg.duration)),
      // Geometry points are for drawing the route, not user-facing stops.
      waypoints: [],
      geometry: seg.geometry,
      notes: `Approximately ${Math.round(seg.distance)}km, ${Math.round(seg.duration / 60)}h ${Math.round(seg.duration % 60)}min${roadNotesSuffix}`,
      isScenic: preferences?.scenicRoutes || false,
    });
  }

  // Step 5: Fetch enrichment data using bounding box of the route geometry
  const lats = routeData.geometry.map(c => c.lat);
  const lngs = routeData.geometry.map(c => c.lng);
  const bboxPadding = 0.1;
  const south = Math.min(...lats) - bboxPadding;
  const north = Math.max(...lats) + bboxPadding;
  const west = Math.min(...lngs) - bboxPadding;
  const east = Math.max(...lngs) + bboxPadding;

  let rawPois: Awaited<ReturnType<typeof poiService.getPOIsInBoundingBox>> = [];
  try {
    rawPois = await poiService.getPOIsInBoundingBox(south, west, north, east, 40);
    console.log(`[DynamicRoute] Fetched ${rawPois.length} POIs from bounding box`);
  } catch (err) {
    console.error('[DynamicRoute] POI fetch failed, continuing without enrichment:', err);
  }

  const poiTypeMap: Record<string, PointOfInterest['type']> = {
    restaurant: 'rest',
    gas_station: 'fuel',
    attraction: 'viewpoint',
    motorcycle_repair: 'repair',
    hotel: 'rest', // hotels already handled separately as accommodations
  };

  const pointsOfInterest: PointOfInterest[] = rawPois
    .filter(p => p.type in poiTypeMap)
    .slice(0, 20)
    .map((p, idx) => ({
      id: idx,
      name: p.name,
      description: p.details?.cuisine
        ? `Cuisine: ${p.details.cuisine}`
        : p.details?.brand || (p.type === 'gas_station' ? 'Fuel station' : p.type === 'attraction' ? 'Tourist attraction' : 'Rest stop'),
      type: poiTypeMap[p.type],
      coordinates: p.coordinates,
      rating: Math.round(stableRandom(idx * 7, 30, 50)) / 10, // 3.0–5.0
      reviews: Math.round(stableRandom(idx * 13, 30, 300)),
    }));

  const accommodations: Accommodation[] = rawPois
    .filter(p => p.type === 'hotel')
    .slice(0, 8)
    .map((p, idx) => {
      const stars = p.details?.stars ? parseInt(p.details.stars) : 0;
      return {
        id: idx,
        name: p.name,
        description: stars > 0 ? `${stars}-star hotel` : 'Hotel along your route',
        price: stars > 0 ? stars * 30 + 40 : 70,
        location: { id: 0, name: p.name, coordinates: p.coordinates },
        rating: Math.round(stableRandom(idx * 11, 30, 50)) / 10,
        reviews: Math.round(stableRandom(idx * 17, 20, 250)),
        features: ['Free WiFi', 'Motorcycle parking'],
      };
    });

  // Build ferry routes from ORS-detected ferry steps (real crossings in the route)
  const includeFerries = preferences?.includeFerries !== false;
  const ferryRoutes: FerryRoute[] = includeFerries
    ? await Promise.all(
        routeData.ferrySteps.map(async (step, idx) => {
          const startPortName = await geocodingService.reverseGeocode(step.startCoords) || 'Ferry Terminal';
          const endPortName = await geocodingService.reverseGeocode(step.endCoords) || 'Ferry Terminal';
          return {
            id: idx,
            name: step.name !== 'Ferry crossing' ? step.name : `${startPortName} → ${endPortName}`,
            startPort: { id: 0, name: startPortName, coordinates: step.startCoords },
            endPort: { id: 0, name: endPortName, coordinates: step.endCoords },
            duration: '1–4 hours',
            price: 50,
            operator: 'Local Ferry Operator',
            schedule: 'Daily services available',
          } satisfies FerryRoute;
        })
      )
    : [];

  // Step 6: Build complete route object
  const route: SavedRoute = {
    id: 0,
    name: `${startLocation} to ${endLocation}`,
    description: `Dynamically calculated route from ${startLocation} to ${endLocation}`,
    startLocation: startLocationObj,
    endLocation: endLocationObj,
    distance: routeData.distance,
    duration: `${Math.round(routeData.duration)}`,
    geometry: routeData.geometry,
    segments,
    pointsOfInterest,
    accommodations,
    ferryRoutes,
    dates: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + segments.length * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    createdAt: new Date().toISOString(),
    preferences: {
      scenicRoutes: preferences?.scenicRoutes || false,
      avoidHighways: preferences?.avoidHighways ?? true,
      includeFerries: preferences?.includeFerries ?? true,
    },
  };

  console.log(`[DynamicRoute] Route created successfully`);
  return route;
}

function calculateEndTime(durationMinutes: number): string {
  const startHour = 9; // 09:00 start
  const totalMinutes = startHour * 60 + durationMinutes;
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;
  
  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}
