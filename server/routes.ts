import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { eq } from "drizzle-orm";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { 
  savedRoutes, 
  pointsOfInterest, 
  routeSegments,
  accommodations,
  locations,
  insertSavedRouteSchema,
  insertRouteSegmentSchema,
  insertPointOfInterestSchema,
  insertAccommodationSchema
} from "@shared/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { calculateDynamicRoute } from "./services/dynamicRoute";
import { POIService } from "./services/poi";
import { findFerryPrices } from "./services/ferryLookup";
import { getWeatherForLocation } from "./services/weather";

// Simple in-memory cache for POIs with file persistence
const POI_CACHE_DIR = join(process.cwd(), "cache", "pois");
const poiCache = new Map<number, { pois: any[], timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

function loadPoiCacheFromDisk() {
  try {
    if (!existsSync(POI_CACHE_DIR)) {
      mkdirSync(POI_CACHE_DIR, { recursive: true });
      return;
    }
    const entries = readFileSync(join(POI_CACHE_DIR, "index.json"), "utf-8");
    const index: number[] = JSON.parse(entries);
    for (const routeId of index) {
      const filePath = join(POI_CACHE_DIR, `${routeId}.json`);
      if (existsSync(filePath)) {
        const data = JSON.parse(readFileSync(filePath, "utf-8"));
        if (data.timestamp && Date.now() - data.timestamp < CACHE_DURATION) {
          poiCache.set(routeId, data);
          console.log(`[POI Cache] Loaded ${data.pois.length} POIs for route ${routeId} from disk`);
        }
      }
    }
  } catch (e) {
    console.warn("[POI Cache] Failed to load cache from disk:", (e as Error).message);
  }
}

function savePoiCacheToDisk(routeId: number, data: { pois: any[], timestamp: number }) {
  try {
    if (!existsSync(POI_CACHE_DIR)) {
      mkdirSync(POI_CACHE_DIR, { recursive: true });
    }
    writeFileSync(join(POI_CACHE_DIR, `${routeId}.json`), JSON.stringify(data));
    const index = Array.from(poiCache.keys());
    writeFileSync(join(POI_CACHE_DIR, "index.json"), JSON.stringify(index));
  } catch (e) {
    console.warn("[POI Cache] Failed to save cache to disk:", (e as Error).message);
  }
}

// Pre-load cache on module load
loadPoiCacheFromDisk();

const calculateRouteSchema = z.object({
  startLocation: z.string().min(1, "Starting location is required"),
  endLocation: z.string().min(1, "Destination is required"),
  waypoints: z.array(z.string()).optional(),
  preferences: z.object({
    scenicRoutes: z.boolean().default(false),
    avoidHighways: z.boolean().default(true),
    includeFerries: z.boolean().default(true),
  }).optional(),
  dates: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";

  // Get all saved routes
  app.get(`${apiPrefix}/routes/saved`, async (req, res) => {
    try {
      const routes = await storage.getSavedRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Error fetching saved routes:", error);
      res.status(500).json({ message: "Failed to fetch saved routes" });
    }
  });

  // Route search (must be before /routes/:id to avoid conflict)
  app.get(`${apiPrefix}/routes/search`, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const routes = await storage.searchRoutes(query);
      res.json(routes);
    } catch (error) {
      console.error("Error searching routes:", error);
      res.status(500).json({ message: "Failed to search routes" });
    }
  });

  // Get POIs along a route (must be before /routes/:id to avoid conflict)
  app.get(`${apiPrefix}/routes/:id/pois`, async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      
      if (isNaN(routeId) || routeId <= 0) {
        return res.status(400).json({ message: "Invalid route ID" });
      }

      // Check cache first
      const cached = poiCache.get(routeId);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log(`[API] Returning cached POIs for route ${routeId} (${cached.pois.length} POIs)`);
        return res.json(cached.pois);
      }

      console.log(`[API] Fetching POIs for route ${routeId}`);
      
      const route = await storage.getRouteById(routeId);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }

      // Collect major points: route start/end and all segment start/end points
      const majorPoints = [
        route.startLocation.coordinates,
        ...route.segments.flatMap((segment: any) => [
          segment.startLocation.coordinates,
          segment.endLocation.coordinates
        ]),
        route.endLocation.coordinates
      ];

      // Remove duplicates
      const allWaypoints = majorPoints.filter((point, index, self) =>
        index === self.findIndex(p => p.lat === point.lat && p.lng === point.lng)
      );

      console.log(`[API] Collected ${allWaypoints.length} major points from route`);

      const poiService = new POIService();
      const pois = await poiService.getPOIsInBoundingBoxForRoute(route);

      // Cache the results (memory + disk)
      const cacheEntry = { pois, timestamp: Date.now() };
      poiCache.set(routeId, cacheEntry);
      savePoiCacheToDisk(routeId, cacheEntry);

      console.log(`[API] Found and cached ${pois.length} POIs for route ${routeId}`);
      res.json(pois);
    } catch (error) {
      console.error("Error fetching POIs:", error);
      res.status(500).json({ message: "Failed to fetch POIs" });
    }
  });

  // Get a single route by ID
  app.get(`${apiPrefix}/routes/:id`, async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      if (isNaN(routeId)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }

      const route = await storage.getRouteById(routeId);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }

      res.json(route);
    } catch (error) {
      console.error("Error fetching route:", error);
      res.status(500).json({ message: "Failed to fetch route details" });
    }
  });

  // Calculate a new route
  app.post(`${apiPrefix}/routes/calculate`, async (req, res) => {
    try {
      const validatedData = calculateRouteSchema.parse(req.body);

      // Step 1: Try to find a curated route in the database
      console.log(`[API] Looking for curated route: ${validatedData.startLocation} → ${validatedData.endLocation}`);
      let calculatedRoute = await storage.getRouteByLocations(
        validatedData.startLocation,
        validatedData.endLocation,
      );
      
      // Step 2: If no curated route found, try dynamic calculation
      if (!calculatedRoute) {
        console.log(`[API] No curated route found, attempting dynamic calculation...`);
        
        const dynamicRoute = await calculateDynamicRoute(
          validatedData.startLocation,
          validatedData.endLocation,
          validatedData.preferences
        );
        
        if (!dynamicRoute) {
          return res.status(404).json({
            message: `Could not calculate route from ${validatedData.startLocation} to ${validatedData.endLocation}. Please check location names or ensure OpenRouteService API key is configured.`,
          });
        }
        
        console.log(`[API] Dynamic route calculated successfully`);
        return res.json(dynamicRoute);
      } else {
        console.log(`[API] Found curated route: ${calculatedRoute.name}`);
        
        // Customize the curated route based on provided preferences
        if (validatedData.preferences) {
          calculatedRoute.preferences = {
            ...calculatedRoute.preferences,
            ...validatedData.preferences
          };
        }
      }
      
      res.json(calculatedRoute);
    } catch (error) {
      console.error("Error calculating route:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to calculate route" });
    }
  });

  // Save a route
  app.post(`${apiPrefix}/routes`, async (req, res) => {
    try {
      const validatedData = insertSavedRouteSchema.parse(req.body);
      const newRoute = await storage.saveRoute(validatedData);
      res.status(201).json(newRoute);
    } catch (error) {
      console.error("Error saving route:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save route" });
    }
  });

  // Get points of interest
  app.get(`${apiPrefix}/points-of-interest`, async (req, res) => {
    try {
      const pois = await storage.getPointsOfInterest();
      res.json(pois);
    } catch (error) {
      console.error("Error fetching points of interest:", error);
      res.status(500).json({ message: "Failed to fetch points of interest" });
    }
  });

  // Get accommodations
  app.get(`${apiPrefix}/accommodations`, async (req, res) => {
    try {
      const accommodations = await storage.getAccommodations();
      res.json(accommodations);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      res.status(500).json({ message: "Failed to fetch accommodations" });
    }
  });

  // On-demand ferry price lookup
  // Accepts start/end coordinates of an ORS-detected ferry step and returns
  // the best-matching entry from the curated European ferry route table.
  app.get(`${apiPrefix}/ferry-prices`, (req, res) => {
    const startLat = parseFloat(req.query.startLat as string);
    const startLng = parseFloat(req.query.startLng as string);
    const endLat   = parseFloat(req.query.endLat   as string);
    const endLng   = parseFloat(req.query.endLng   as string);

    if ([startLat, startLng, endLat, endLng].some(isNaN)) {
      return res.status(400).json({ message: "startLat, startLng, endLat and endLng are required" });
    }

    const result = findFerryPrices(startLat, startLng, endLat, endLng);
    if (!result) {
      return res.status(404).json({ message: "No known ferry route found near those coordinates" });
    }

    res.json(result);
  });

  // On-demand weather lookup via Open-Meteo (no API key required)
  app.get(`${apiPrefix}/weather`, async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const data = await getWeatherForLocation(lat, lng);
    if (!data) {
      return res.status(502).json({ message: "Could not fetch weather data" });
    }

    res.json(data);
  });

  // Flush POI cache — clears memory + disk so next request fetches fresh data
  // Optional: ?routeId=1 to flush a single route, omit to flush all
  app.delete(`${apiPrefix}/poi-cache`, (req, res) => {
    const routeIdParam = req.query.routeId as string | undefined;

    if (routeIdParam) {
      const routeId = parseInt(routeIdParam);
      if (isNaN(routeId)) {
        return res.status(400).json({ message: "Invalid routeId" });
      }
      poiCache.delete(routeId);
      try {
        const filePath = join(POI_CACHE_DIR, `${routeId}.json`);
        if (existsSync(filePath)) {
          const { unlinkSync } = require("fs");
          unlinkSync(filePath);
        }
        const index = Array.from(poiCache.keys());
        writeFileSync(join(POI_CACHE_DIR, "index.json"), JSON.stringify(index));
      } catch (e) {
        console.warn("[POI Cache] Failed to delete cache file:", (e as Error).message);
      }
      console.log(`[POI Cache] Flushed cache for route ${routeId}`);
      return res.json({ message: `Cache cleared for route ${routeId}` });
    }

    // Flush all
    const count = poiCache.size;
    poiCache.clear();
    try {
      const { rmSync } = require("fs");
      rmSync(POI_CACHE_DIR, { recursive: true, force: true });
    } catch (e) {
      console.warn("[POI Cache] Failed to delete cache dir:", (e as Error).message);
    }
    console.log(`[POI Cache] Flushed all ${count} cached routes`);
    res.json({ message: `Cache cleared for ${count} route(s)` });
  });

  const httpServer = createServer(app);

  return httpServer;
}
