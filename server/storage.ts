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
import { eq, ilike, or } from "drizzle-orm";

const normalizeForSearch = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getBigrams = (value: string): Set<string> => {
  if (value.length < 2) {
    return new Set([value]);
  }

  const bigrams = new Set<string>();
  for (let i = 0; i < value.length - 1; i++) {
    bigrams.add(value.slice(i, i + 2));
  }

  return bigrams;
};

const diceCoefficient = (a: string, b: string): number => {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const aBigrams = getBigrams(a);
  const bBigrams = getBigrams(b);

  let intersection = 0;
  aBigrams.forEach((bigram) => {
    if (bBigrams.has(bigram)) {
      intersection++;
    }
  });

  return (2 * intersection) / (aBigrams.size + bBigrams.size);
};

const calculateRouteSearchScore = (
  query: string,
  name: string,
  description: string,
): number => {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return 0;

  const normalizedName = normalizeForSearch(name);
  const normalizedDescription = normalizeForSearch(description);
  const combinedText = `${normalizedName} ${normalizedDescription}`.trim();

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const exactMatchBoost = normalizedName === normalizedQuery ? 0.5 : 0;
  const startsWithBoost = normalizedName.startsWith(normalizedQuery) ? 0.35 : 0;
  const containsBoost = combinedText.includes(normalizedQuery) ? 0.25 : 0;

  const tokenMatches = queryTokens.filter((token) => combinedText.includes(token)).length;
  const tokenCoverage = queryTokens.length > 0 ? tokenMatches / queryTokens.length : 0;

  const nameSimilarity = diceCoefficient(normalizedQuery, normalizedName);
  const descriptionSimilarity = diceCoefficient(normalizedQuery, normalizedDescription);
  const combinedSimilarity = Math.max(nameSimilarity, descriptionSimilarity);

  return exactMatchBoost + startsWithBoost + containsBoost + tokenCoverage * 0.3 + combinedSimilarity;
};

const calculateLocationMatchScore = (query: string, locationName: string): number => {
  const normalizedQuery = normalizeForSearch(query);
  const normalizedLocation = normalizeForSearch(locationName);

  if (!normalizedQuery || !normalizedLocation) {
    return 0;
  }

  const exactMatchBoost = normalizedLocation === normalizedQuery ? 0.5 : 0;
  const startsWithBoost = normalizedLocation.startsWith(normalizedQuery) ? 0.3 : 0;
  const containsBoost = normalizedLocation.includes(normalizedQuery) ? 0.2 : 0;
  const similarity = diceCoefficient(normalizedQuery, normalizedLocation);

  return exactMatchBoost + startsWithBoost + containsBoost + similarity;
};

export const storage = {
  getSavedRoutes: async () => {
    return await db.query.savedRoutes.findMany({
      orderBy: (routes: any, { desc }: any) => [desc(routes.createdAt)],
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

    const withCoordinates = (location: any) => ({
      ...location,
      coordinates: {
        lat: Number(location.latitude),
        lng: Number(location.longitude),
      },
    });

    // Transform the data to match the expected structure
    return {
      ...route,
      startLocation: withCoordinates(route.startLocation),
      endLocation: withCoordinates(route.endLocation),
      segments: route.segments.map((segment: any) => ({
        ...segment,
        startLocation: withCoordinates(segment.startLocation),
        endLocation: withCoordinates(segment.endLocation),
        waypoints: segment.waypoints.map((wp: any) => withCoordinates(wp.location)),
      })),
      pointsOfInterest: route.pointsOfInterest.map((poi: any) => ({
        ...poi,
        coordinates: {
          lat: Number(poi.location.latitude),
          lng: Number(poi.location.longitude),
        }
      })),
      accommodations: route.accommodations.map((acc: any) => ({
        ...acc,
        location: withCoordinates(acc.location),
      })),
      ferryRoutes: route.ferryRoutes.map((ferryRoute: any) => ({
        ...ferryRoute,
        startPort: withCoordinates(ferryRoute.startPort),
        endPort: withCoordinates(ferryRoute.endPort),
      })),
    };
  },

  getRouteByLocations: async (startLocation: string, endLocation: string) => {
    const normalizedStart = normalizeForSearch(startLocation);
    const normalizedEnd = normalizeForSearch(endLocation);

    if (!normalizedStart || !normalizedEnd) {
      return null;
    }

    const routes = await db.query.savedRoutes.findMany({
      with: {
        startLocation: true,
        endLocation: true,
      },
    });

    if (routes.length === 0) {
      return null;
    }

    const bestMatch = routes
      .map((route: any) => {
        const startScore = calculateLocationMatchScore(startLocation, route.startLocation?.name ?? "");
        const endScore = calculateLocationMatchScore(endLocation, route.endLocation?.name ?? "");

        return {
          route,
          startScore,
          endScore,
          score: startScore + endScore,
        };
      })
      .sort((a, b) => b.score - a.score)[0];

    if (!bestMatch) {
      return null;
    }

    const minimumLocationScore = 0.45;
    if (bestMatch.startScore < minimumLocationScore || bestMatch.endScore < minimumLocationScore) {
      return null;
    }

    return await storage.getRouteById(bestMatch.route.id);
  },

  saveRoute: async (routeData: InsertSavedRoute) => {
    const [newRoute] = await db.insert(savedRoutes).values(routeData).returning();
    return newRoute;
  },

  searchRoutes: async (query: string) => {
    const normalizedQuery = normalizeForSearch(query);
    if (!normalizedQuery) {
      return [];
    }

    const queryTokens = normalizedQuery.split(" ").filter(Boolean);
    const queryPatterns = Array.from(new Set([normalizedQuery, ...queryTokens]));

    const whereConditions = queryPatterns.flatMap((pattern) => [
      ilike(savedRoutes.name, `%${pattern}%`),
      ilike(savedRoutes.description, `%${pattern}%`),
    ]);

    const routes = await db.query.savedRoutes.findMany({
      where: whereConditions.length > 0 ? or(...whereConditions) : undefined,
      with: {
        startLocation: true,
        endLocation: true,
      }
    });

    return routes
      .map((route: any) => ({
        route,
        score: calculateRouteSearchScore(query, route.name, route.description),
      }))
      .filter((result: { route: any; score: number }) => result.score >= 0.35)
      .sort((a: { route: any; score: number }, b: { route: any; score: number }) => b.score - a.score)
      .map((result: { route: any; score: number }) => result.route);
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
