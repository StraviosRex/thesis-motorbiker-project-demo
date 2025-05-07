import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { eq } from "drizzle-orm";
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
      
      // Simulate route calculation (in a real app, this would call a routing service API)
      // For now, just returning the first saved route as a mock
      const routes = await storage.getSavedRoutes();
      const calculatedRoute = routes[0];
      
      if (!calculatedRoute) {
        return res.status(404).json({ message: "No route found" });
      }
      
      // Customize the route based on provided preferences
      if (validatedData.preferences) {
        calculatedRoute.preferences = {
          ...calculatedRoute.preferences,
          ...validatedData.preferences
        };
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

  // Route search
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

  const httpServer = createServer(app);

  return httpServer;
}
