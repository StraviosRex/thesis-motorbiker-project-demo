import { db } from "@db";
import { 
  savedRoutes, 
  pointsOfInterest, 
  routeSegments, 
  accommodations, 
  locations,
  locations as locationsTable,
  SavedRoute,
  InsertSavedRoute,
  RouteSegment,
  PointOfInterest,
  Accommodation,
  Location,
  waypoints,
  ferryRoutes
} from "@shared/schema";
import { eq, like, and, or } from "drizzle-orm";

export const storage = {
  getSavedRoutes: async () => {
    return await db.query.savedRoutes.findMany({
      orderBy: (routes, { desc }) => [desc(routes.createdAt)],
      with: {
        startLocation: true,
        endLocation: true,
      }
    });
  },

  getRouteById: async (id: number) => {
    const route = await db.query.savedRoutes.findFirst({
      where: eq(savedRoutes.id, id),
      with: {
        startLocation: true,
        endLocation: true,
        segments: {
          with: {
            startLocation: true,
            endLocation: true,
            waypoints: {
              with: {
                location: true,
              }
            }
          }
        },
        pointsOfInterest: {
          with: {
            location: true,
          }
        },
        accommodations: {
          with: {
            location: true,
          }
        },
        ferryRoutes: {
          with: {
            startPort: true,
            endPort: true,
          }
        }
      }
    });

    if (!route) return null;

    // Transform the data to match the expected structure
    return {
      ...route,
      segments: route.segments.map(segment => ({
        ...segment,
        waypoints: segment.waypoints.map(wp => wp.location),
      })),
      pointsOfInterest: route.pointsOfInterest.map(poi => ({
        ...poi,
        coordinates: {
          lat: poi.location.latitude,
          lng: poi.location.longitude,
        }
      })),
      accommodations: route.accommodations.map(acc => ({
        ...acc,
        location: {
          ...acc.location,
          coordinates: {
            lat: acc.location.latitude,
            lng: acc.location.longitude,
          }
        }
      })),
    };
  },

  saveRoute: async (routeData: InsertSavedRoute) => {
    const [newRoute] = await db.insert(savedRoutes).values(routeData).returning();
    return newRoute;
  },

  searchRoutes: async (query: string) => {
    return await db.query.savedRoutes.findMany({
      where: or(
        like(savedRoutes.name, `%${query}%`),
        like(savedRoutes.description, `%${query}%`)
      ),
      with: {
        startLocation: true,
        endLocation: true,
      }
    });
  },

  getPointsOfInterest: async () => {
    return await db.query.pointsOfInterest.findMany({
      with: {
        location: true,
      }
    });
  },

  getAccommodations: async () => {
    return await db.query.accommodations.findMany({
      with: {
        location: true,
      }
    });
  },

  insertLocation: async (location: Omit<Location, 'id'>) => {
    const [newLocation] = await db.insert(locations)
      .values(location)
      .returning();
    return newLocation;
  },

  insertRouteSegment: async (segment: Omit<RouteSegment, 'id'>) => {
    const [newSegment] = await db.insert(routeSegments)
      .values(segment)
      .returning();
    return newSegment;
  },

  insertPointOfInterest: async (poi: Omit<PointOfInterest, 'id'>) => {
    const [newPoi] = await db.insert(pointsOfInterest)
      .values(poi)
      .returning();
    return newPoi;
  },

  insertAccommodation: async (accommodation: Omit<Accommodation, 'id'>) => {
    const [newAccommodation] = await db.insert(accommodations)
      .values(accommodation)
      .returning();
    return newAccommodation;
  }
};
