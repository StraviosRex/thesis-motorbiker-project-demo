import { db } from "./index";
import * as schema from "@shared/schema";
import { locations, savedRoutes, routeSegments, waypoints, pointsOfInterest, accommodations, ferryRoutes } from "@shared/schema";

async function seed() {
  try {
    console.log("Starting to seed database...");

    // Seed locations
    const berlin = await seedLocation("Berlin", 52.5200, 13.4050, "Germany");
    const leipzig = await seedLocation("Leipzig", 51.3397, 12.3731, "Germany");
    const munich = await seedLocation("Munich", 48.1351, 11.5820, "Germany");
    const innsbruck = await seedLocation("Innsbruck", 47.2692, 11.4041, "Austria");
    const bolzano = await seedLocation("Bolzano", 46.4983, 11.3548, "Italy");
    const florence = await seedLocation("Florence", 43.7696, 11.2558, "Italy");
    const rome = await seedLocation("Rome", 41.9028, 12.4964, "Italy");
    const copenhagen = await seedLocation("Copenhagen", 55.6761, 12.5683, "Denmark");
    const oslo = await seedLocation("Oslo", 59.9139, 10.7522, "Norway");
    
    // Seed saved routes
    const berlinRomeRoute = await seedRoute(
      "Alpine Adventure", 
      "Berlin to Rome via Munich, Innsbruck, and Bolzano",
      berlin.id,
      rome.id,
      1450,
      "1100", // 18h 20m in minutes
      {
        scenicRoutes: true,
        avoidHighways: true,
        includeFerries: false
      },
      {
        start: "2023-06-15",
        end: "2023-06-30"
      }
    );
    
    const scandinavianRoute = await seedRoute(
      "Scandinavian Tour", 
      "Copenhagen to Oslo via Sweden",
      copenhagen.id,
      oslo.id,
      980,
      "720", // 12h in minutes
      {
        scenicRoutes: true,
        avoidHighways: true,
        includeFerries: true
      },
      {
        start: "2023-08-01",
        end: "2023-08-05"
      }
    );
    
    // Seed route segments for Berlin to Rome
    const segment1 = await seedRouteSegment(
      berlinRomeRoute.id,
      1,
      "Berlin to Munich",
      berlin.id,
      munich.id,
      586,
      "08:00",
      "17:30",
      "Recommended stop at Leipzig (3h from start)",
      false
    );
    
    const segment2 = await seedRouteSegment(
      berlinRomeRoute.id,
      2,
      "Munich to Bolzano",
      munich.id,
      bolzano.id,
      330,
      "09:00",
      "16:00",
      "Scenic route with mountain passes",
      true
    );
    
    const segment3 = await seedRouteSegment(
      berlinRomeRoute.id,
      3,
      "Bolzano to Rome",
      bolzano.id,
      rome.id,
      534,
      "08:30",
      "18:00",
      null,
      false
    );
    
    // Seed waypoints
    await seedWaypoint(segment1.id, leipzig.id, 1);
    await seedWaypoint(segment2.id, innsbruck.id, 1);
    await seedWaypoint(segment3.id, florence.id, 1);
    
    // Seed POIs
    await seedPointOfInterest(
      berlinRomeRoute.id,
      "Biker's Stop - Munich",
      "Popular motorcycle meeting point with cafe",
      "rest",
      munich.id,
      4.8,
      124
    );
    
    await seedPointOfInterest(
      berlinRomeRoute.id,
      "Motorcycle Gear Shop - Innsbruck",
      "Alpine equipment specialist",
      "shop",
      innsbruck.id,
      4.2,
      87
    );
    
    await seedPointOfInterest(
      berlinRomeRoute.id,
      "Dolomites Viewpoint",
      "Spectacular mountain views",
      "viewpoint",
      bolzano.id,
      4.9,
      215
    );
    
    // Seed accommodations
    await seedAccommodation(
      berlinRomeRoute.id,
      "Biker's Inn - Munich",
      "Motorcycle-friendly hotel",
      89,
      munich.id,
      4.3,
      98,
      ["Secure parking"]
    );
    
    await seedAccommodation(
      berlinRomeRoute.id,
      "Alpine Lodge - Innsbruck",
      "Mountain view rooms",
      105,
      innsbruck.id,
      4.7,
      143,
      ["Gear drying room"]
    );
    
    // No ferries for this route, but we'll seed the schema
    
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

// Helper functions for seeding
async function seedLocation(name: string, lat: number, lng: number, country: string) {
  // Check if location already exists to avoid duplicates
  const existingLocation = await db.query.locations.findFirst({
    where: (locations, { and, eq }) => and(
      eq(locations.name, name),
      eq(locations.country, country)
    )
  });
  
  if (existingLocation) return existingLocation;
  
  const [newLocation] = await db.insert(locations).values({
    name,
    latitude: lat.toString(),
    longitude: lng.toString(),
    country
  }).returning();
  
  return newLocation;
}

async function seedRoute(
  name: string, 
  description: string, 
  startLocationId: number, 
  endLocationId: number, 
  distance: number, 
  duration: string,
  preferences: { scenicRoutes: boolean, avoidHighways: boolean, includeFerries: boolean },
  dates: { start: string, end: string }
) {
  // Check if route already exists
  const existingRoute = await db.query.savedRoutes.findFirst({
    where: (routes, { and, eq }) => and(
      eq(routes.name, name),
      eq(routes.startLocationId, startLocationId),
      eq(routes.endLocationId, endLocationId)
    )
  });
  
  if (existingRoute) return existingRoute;
  
  const [newRoute] = await db.insert(savedRoutes).values({
    name,
    description,
    startLocationId,
    endLocationId,
    distance: distance.toString(),
    duration,
    preferences,
    dates,
    isPublic: true
  }).returning();
  
  return newRoute;
}

async function seedRouteSegment(
  routeId: number,
  day: number,
  title: string,
  startLocationId: number,
  endLocationId: number,
  distance: number,
  startTime: string,
  endTime: string,
  notes: string | null,
  isScenic: boolean
) {
  // Check if segment already exists
  const existingSegment = await db.query.routeSegments.findFirst({
    where: (segments, { and, eq }) => and(
      eq(segments.routeId, routeId),
      eq(segments.day, day),
      eq(segments.startLocationId, startLocationId),
      eq(segments.endLocationId, endLocationId)
    )
  });
  
  if (existingSegment) return existingSegment;
  
  const [newSegment] = await db.insert(routeSegments).values({
    routeId,
    day,
    title,
    startLocationId,
    endLocationId,
    distance: distance.toString(),
    startTime,
    endTime,
    notes,
    isScenic
  }).returning();
  
  return newSegment;
}

async function seedWaypoint(segmentId: number, locationId: number, order: number) {
  // Check if waypoint already exists
  const existingWaypoint = await db.query.waypoints.findFirst({
    where: (wps, { and, eq }) => and(
      eq(wps.segmentId, segmentId),
      eq(wps.locationId, locationId),
      eq(wps.order, order)
    )
  });
  
  if (existingWaypoint) return existingWaypoint;
  
  const [newWaypoint] = await db.insert(waypoints).values({
    segmentId,
    locationId,
    order
  }).returning();
  
  return newWaypoint;
}

async function seedPointOfInterest(
  routeId: number,
  name: string,
  description: string,
  type: string,
  locationId: number,
  rating: number,
  reviews: number
) {
  // Check if POI already exists
  const existingPoi = await db.query.pointsOfInterest.findFirst({
    where: (pois, { and, eq }) => and(
      eq(pois.routeId, routeId),
      eq(pois.name, name),
      eq(pois.locationId, locationId)
    )
  });
  
  if (existingPoi) return existingPoi;
  
  const [newPoi] = await db.insert(pointsOfInterest).values({
    routeId,
    name,
    description,
    type,
    locationId,
    rating: rating.toString(),
    reviews
  }).returning();
  
  return newPoi;
}

async function seedAccommodation(
  routeId: number,
  name: string,
  description: string,
  price: number,
  locationId: number,
  rating: number,
  reviews: number,
  features: string[]
) {
  // Check if accommodation already exists
  const existingAccommodation = await db.query.accommodations.findFirst({
    where: (acc, { and, eq }) => and(
      eq(acc.routeId, routeId),
      eq(acc.name, name),
      eq(acc.locationId, locationId)
    )
  });
  
  if (existingAccommodation) return existingAccommodation;
  
  const [newAccommodation] = await db.insert(accommodations).values({
    routeId,
    name,
    description,
    price: price.toString(),
    locationId,
    rating: rating.toString(),
    reviews,
    features
  }).returning();
  
  return newAccommodation;
}

seed();
