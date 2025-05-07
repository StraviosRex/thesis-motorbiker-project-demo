import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Locations (cities, waypoints, POIs, etc.)
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const locationsRelations = relations(locations, ({ many }) => ({
  routeStartLocations: many(savedRoutes, { relationName: "startLocations" }),
  routeEndLocations: many(savedRoutes, { relationName: "endLocations" }),
  segmentStartLocations: many(routeSegments, { relationName: "segmentStartLocations" }),
  segmentEndLocations: many(routeSegments, { relationName: "segmentEndLocations" }),
  waypointLocations: many(waypoints, { relationName: "waypointLocations" }),
  poiLocations: many(pointsOfInterest, { relationName: "poiLocations" }),
  accommodationLocations: many(accommodations, { relationName: "accommodationLocations" }),
  ferryStartPorts: many(ferryRoutes, { relationName: "ferryStartPorts" }),
  ferryEndPorts: many(ferryRoutes, { relationName: "ferryEndPorts" }),
}));

// Saved routes
export const savedRoutes = pgTable("saved_routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  startLocationId: integer("start_location_id").references(() => locations.id).notNull(),
  endLocationId: integer("end_location_id").references(() => locations.id).notNull(),
  distance: decimal("distance", { precision: 10, scale: 2 }).notNull(),
  duration: text("duration").notNull(),
  preferences: jsonb("preferences").notNull().$type<{
    scenicRoutes: boolean;
    avoidHighways: boolean;
    includeFerries: boolean;
  }>(),
  dates: jsonb("dates").notNull().$type<{
    start: string;
    end: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  isPublic: boolean("is_public").default(false)
});

export const savedRoutesRelations = relations(savedRoutes, ({ one, many }) => ({
  startLocation: one(locations, {
    fields: [savedRoutes.startLocationId],
    references: [locations.id],
    relationName: "startLocations"
  }),
  endLocation: one(locations, {
    fields: [savedRoutes.endLocationId],
    references: [locations.id],
    relationName: "endLocations"
  }),
  segments: many(routeSegments),
  pointsOfInterest: many(pointsOfInterest),
  accommodations: many(accommodations),
  ferryRoutes: many(ferryRoutes)
}));

// Route segments
export const routeSegments = pgTable("route_segments", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").references(() => savedRoutes.id).notNull(),
  day: integer("day").notNull(),
  title: text("title").notNull(),
  startLocationId: integer("start_location_id").references(() => locations.id).notNull(),
  endLocationId: integer("end_location_id").references(() => locations.id).notNull(),
  distance: decimal("distance", { precision: 10, scale: 2 }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  notes: text("notes"),
  isScenic: boolean("is_scenic").default(false)
});

export const routeSegmentsRelations = relations(routeSegments, ({ one, many }) => ({
  route: one(savedRoutes, {
    fields: [routeSegments.routeId],
    references: [savedRoutes.id],
  }),
  startLocation: one(locations, {
    fields: [routeSegments.startLocationId],
    references: [locations.id],
    relationName: "segmentStartLocations"
  }),
  endLocation: one(locations, {
    fields: [routeSegments.endLocationId],
    references: [locations.id],
    relationName: "segmentEndLocations"
  }),
  waypoints: many(waypoints)
}));

// Waypoints
export const waypoints = pgTable("waypoints", {
  id: serial("id").primaryKey(),
  segmentId: integer("segment_id").references(() => routeSegments.id).notNull(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  order: integer("order").notNull()
});

export const waypointsRelations = relations(waypoints, ({ one }) => ({
  segment: one(routeSegments, {
    fields: [waypoints.segmentId],
    references: [routeSegments.id],
  }),
  location: one(locations, {
    fields: [waypoints.locationId],
    references: [locations.id],
    relationName: "waypointLocations"
  })
}));

// Points of interest
export const pointsOfInterest = pgTable("points_of_interest", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").references(() => savedRoutes.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull(),
  reviews: integer("reviews").notNull()
});

export const pointsOfInterestRelations = relations(pointsOfInterest, ({ one }) => ({
  route: one(savedRoutes, {
    fields: [pointsOfInterest.routeId],
    references: [savedRoutes.id],
  }),
  location: one(locations, {
    fields: [pointsOfInterest.locationId],
    references: [locations.id],
    relationName: "poiLocations"
  })
}));

// Accommodations
export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").references(() => savedRoutes.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull(),
  reviews: integer("reviews").notNull(),
  features: jsonb("features").notNull().$type<string[]>()
});

export const accommodationsRelations = relations(accommodations, ({ one }) => ({
  route: one(savedRoutes, {
    fields: [accommodations.routeId],
    references: [savedRoutes.id],
  }),
  location: one(locations, {
    fields: [accommodations.locationId],
    references: [locations.id],
    relationName: "accommodationLocations"
  })
}));

// Ferry routes
export const ferryRoutes = pgTable("ferry_routes", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").references(() => savedRoutes.id).notNull(),
  name: text("name").notNull(),
  startPortId: integer("start_port_id").references(() => locations.id).notNull(),
  endPortId: integer("end_port_id").references(() => locations.id).notNull(),
  duration: text("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  operator: text("operator").notNull(),
  schedule: text("schedule").notNull()
});

export const ferryRoutesRelations = relations(ferryRoutes, ({ one }) => ({
  route: one(savedRoutes, {
    fields: [ferryRoutes.routeId],
    references: [savedRoutes.id],
  }),
  startPort: one(locations, {
    fields: [ferryRoutes.startPortId],
    references: [locations.id],
    relationName: "ferryStartPorts"
  }),
  endPort: one(locations, {
    fields: [ferryRoutes.endPortId],
    references: [locations.id],
    relationName: "ferryEndPorts"
  })
}));

// Users table (auth related)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  routes: many(savedRoutes)
}));

// Schema validation
export const insertLocationSchema = createInsertSchema(locations);
export const insertSavedRouteSchema = createInsertSchema(savedRoutes);
export const insertRouteSegmentSchema = createInsertSchema(routeSegments);
export const insertWaypointSchema = createInsertSchema(waypoints);
export const insertPointOfInterestSchema = createInsertSchema(pointsOfInterest);
export const insertAccommodationSchema = createInsertSchema(accommodations);
export const insertFerryRouteSchema = createInsertSchema(ferryRoutes);
export const insertUserSchema = createInsertSchema(users);

// Types
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type SavedRoute = typeof savedRoutes.$inferSelect;
export type InsertSavedRoute = z.infer<typeof insertSavedRouteSchema>;

export type RouteSegment = typeof routeSegments.$inferSelect;
export type InsertRouteSegment = z.infer<typeof insertRouteSegmentSchema>;

export type Waypoint = typeof waypoints.$inferSelect;
export type InsertWaypoint = z.infer<typeof insertWaypointSchema>;

export type PointOfInterest = typeof pointsOfInterest.$inferSelect;
export type InsertPointOfInterest = z.infer<typeof insertPointOfInterestSchema>;

export type Accommodation = typeof accommodations.$inferSelect;
export type InsertAccommodation = z.infer<typeof insertAccommodationSchema>;

export type FerryRoute = typeof ferryRoutes.$inferSelect;
export type InsertFerryRoute = z.infer<typeof insertFerryRouteSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
