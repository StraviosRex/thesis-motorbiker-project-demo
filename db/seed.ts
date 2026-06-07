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
    const gothenburg = await seedLocation("Gothenburg", 57.7089, 11.9746, "Sweden");
    const prague = await seedLocation("Prague", 50.0755, 14.4378, "Czech Republic");
    const salzburg = await seedLocation("Salzburg", 47.8095, 13.0550, "Austria");
    const verona = await seedLocation("Verona", 45.4384, 10.9916, "Italy");
    const linz = await seedLocation("Linz", 48.3069, 14.2858, "Austria");
    const trento = await seedLocation("Trento", 46.0748, 11.1217, "Italy");
    const orvieto = await seedLocation("Orvieto", 42.7185, 12.1116, "Italy");
    const vienna = await seedLocation("Vienna", 48.2082, 16.3738, "Austria");
    const ljubljana = await seedLocation("Ljubljana", 46.0569, 14.5058, "Slovenia");
    const rijeka = await seedLocation("Rijeka", 45.3271, 14.4422, "Croatia");
    const zadar = await seedLocation("Zadar", 44.1194, 15.2314, "Croatia");
    const split = await seedLocation("Split", 43.5081, 16.4402, "Croatia");
    const dubrovnik = await seedLocation("Dubrovnik", 42.6507, 18.0944, "Croatia");
    const barcelona = await seedLocation("Barcelona", 41.3874, 2.1686, "Spain");
    const valencia = await seedLocation("Valencia", 39.4699, -0.3763, "Spain");
    const granada = await seedLocation("Granada", 37.1773, -3.5986, "Spain");
    const seville = await seedLocation("Seville", 37.3891, -5.9845, "Spain");
    const lisbon = await seedLocation("Lisbon", 38.7223, -9.1393, "Portugal");
    const porto = await seedLocation("Porto", 41.1579, -8.6291, "Portugal");
    const madrid = await seedLocation("Madrid", 40.4168, -3.7038, "Spain");
    const edinburgh = await seedLocation("Edinburgh", 55.9533, -3.1883, "United Kingdom");
    const glasgow = await seedLocation("Glasgow", 55.8642, -4.2518, "United Kingdom");
    const fortWilliam = await seedLocation("Fort William", 56.8198, -5.1052, "United Kingdom");
    const inverness = await seedLocation("Inverness", 57.4778, -4.2247, "United Kingdom");
    const glencoe = await seedLocation("Glencoe", 56.6823, -5.0244, "United Kingdom");
    const skye = await seedLocation("Isle of Skye", 57.2736, -6.2155, "United Kingdom");
    const athens = await seedLocation("Athens", 37.9838, 23.7275, "Greece");
    const piraeus = await seedLocation("Piraeus", 37.9475, 23.6461, "Greece");
    const mykonos = await seedLocation("Mykonos", 37.4467, 25.3289, "Greece");
    const paros = await seedLocation("Paros", 37.0856, 25.1489, "Greece");
    const naxos = await seedLocation("Naxos", 37.1036, 25.3762, "Greece");
    const santorini = await seedLocation("Santorini", 36.3932, 25.4615, "Greece");
    
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

    const pragueRomeRoute = await seedRoute(
      "Prague to Rome Grand Tour",
      "Prague to Rome via Salzburg, Innsbruck, Verona, and Florence",
      prague.id,
      rome.id,
      1360,
      "960", // 16h in minutes
      {
        scenicRoutes: true,
        avoidHighways: true,
        includeFerries: false
      },
      {
        start: "2024-06-10",
        end: "2024-06-18"
      }
    );

    const adriaticRoute = await seedRoute(
      "Adriatic Coastal Ride",
      "Vienna to Dubrovnik along the Croatian coast",
      vienna.id,
      dubrovnik.id,
      1120,
      "1320",
      {
        scenicRoutes: true,
        avoidHighways: true,
        includeFerries: false
      },
      {
        start: "2024-05-12",
        end: "2024-05-16"
      }
    );

    const iberianRoute = await seedRoute(
      "Iberian Grand Loop",
      "Barcelona to Barcelona via southern Spain and Portugal",
      barcelona.id,
      barcelona.id,
      3280,
      "3180",
      {
        scenicRoutes: true,
        avoidHighways: false,
        includeFerries: false
      },
      {
        start: "2024-09-08",
        end: "2024-09-19"
      }
    );

    const scottishRoute = await seedRoute(
      "Scottish Highlands",
      "Edinburgh loop through the Highlands and Isle of Skye",
      edinburgh.id,
      edinburgh.id,
      920,
      "1740",
      {
        scenicRoutes: true,
        avoidHighways: true,
        includeFerries: false
      },
      {
        start: "2024-07-10",
        end: "2024-07-15"
      }
    );

    const greekRoute = await seedRoute(
      "Greek Island Hop",
      "Athens to Santorini via the Cyclades by ferry",
      athens.id,
      santorini.id,
      340,
      "1620",
      {
        scenicRoutes: true,
        avoidHighways: false,
        includeFerries: true
      },
      {
        start: "2024-06-20",
        end: "2024-06-24"
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

    // Seed route segments for Scandinavian Tour
    const scandinavianSegment1 = await seedRouteSegment(
      scandinavianRoute.id,
      1,
      "Copenhagen to Gothenburg",
      copenhagen.id,
      gothenburg.id,
      315,
      "08:00",
      "13:30",
      "Cross into Sweden and follow the west-coast corridor",
      true
    );

    const scandinavianSegment2 = await seedRouteSegment(
      scandinavianRoute.id,
      2,
      "Gothenburg to Oslo",
      gothenburg.id,
      oslo.id,
      335,
      "09:00",
      "14:30",
      "Scenic final stage to Oslo",
      true
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

    // Seed route segments for Prague to Rome
    const pragueRomeSegment1 = await seedRouteSegment(
      pragueRomeRoute.id,
      1,
      "Prague to Salzburg",
      prague.id,
      salzburg.id,
      380,
      "08:00",
      "13:30",
      "Easy first day with river valley riding sections",
      true
    );

    const pragueRomeSegment2 = await seedRouteSegment(
      pragueRomeRoute.id,
      2,
      "Salzburg to Innsbruck",
      salzburg.id,
      innsbruck.id,
      185,
      "09:00",
      "12:30",
      "Short alpine transfer day",
      true
    );

    const pragueRomeSegment3 = await seedRouteSegment(
      pragueRomeRoute.id,
      3,
      "Innsbruck to Verona",
      innsbruck.id,
      verona.id,
      285,
      "08:30",
      "14:30",
      "Cross Brenner corridor into northern Italy",
      true
    );

    const pragueRomeSegment4 = await seedRouteSegment(
      pragueRomeRoute.id,
      4,
      "Verona to Florence",
      verona.id,
      florence.id,
      235,
      "09:00",
      "13:30",
      "Rolling roads through Emilia-Romagna and Tuscany",
      true
    );

    const pragueRomeSegment5 = await seedRouteSegment(
      pragueRomeRoute.id,
      5,
      "Florence to Rome",
      florence.id,
      rome.id,
      275,
      "08:30",
      "13:30",
      "Classic final run to Rome",
      false
    );

    // Seed route segments for Adriatic Coastal Ride
    const adriaticSegment1 = await seedRouteSegment(
      adriaticRoute.id,
      1,
      "Vienna to Rijeka",
      vienna.id,
      rijeka.id,
      510,
      "08:00",
      "16:30",
      "Cross Slovenia before reaching the coast",
      true
    );

    const adriaticSegment2 = await seedRouteSegment(
      adriaticRoute.id,
      2,
      "Rijeka to Split",
      rijeka.id,
      split.id,
      410,
      "09:00",
      "16:00",
      "Follow scenic Adriatic roads",
      true
    );

    const adriaticSegment3 = await seedRouteSegment(
      adriaticRoute.id,
      3,
      "Split to Dubrovnik",
      split.id,
      dubrovnik.id,
      200,
      "09:00",
      "13:30",
      "Short final coastal stage",
      true
    );

    // Seed route segments for Iberian Grand Loop
    const iberianSegment1 = await seedRouteSegment(
      iberianRoute.id,
      1,
      "Barcelona to Valencia",
      barcelona.id,
      valencia.id,
      350,
      "08:30",
      "13:30",
      null,
      true
    );

    const iberianSegment2 = await seedRouteSegment(
      iberianRoute.id,
      2,
      "Valencia to Seville",
      valencia.id,
      seville.id,
      660,
      "08:00",
      "17:30",
      "Long transfer through Andalusia",
      false
    );

    const iberianSegment3 = await seedRouteSegment(
      iberianRoute.id,
      3,
      "Seville to Lisbon",
      seville.id,
      lisbon.id,
      460,
      "09:00",
      "15:30",
      null,
      true
    );

    const iberianSegment4 = await seedRouteSegment(
      iberianRoute.id,
      4,
      "Lisbon to Madrid",
      lisbon.id,
      madrid.id,
      640,
      "08:30",
      "17:00",
      null,
      false
    );

    const iberianSegment5 = await seedRouteSegment(
      iberianRoute.id,
      5,
      "Madrid to Barcelona",
      madrid.id,
      barcelona.id,
      1170,
      "08:00",
      "18:30",
      "Final return to the Mediterranean",
      false
    );

    // Seed route segments for Scottish Highlands
    const scottishSegment1 = await seedRouteSegment(
      scottishRoute.id,
      1,
      "Edinburgh to Fort William",
      edinburgh.id,
      fortWilliam.id,
      270,
      "08:30",
      "13:30",
      null,
      true
    );

    const scottishSegment2 = await seedRouteSegment(
      scottishRoute.id,
      2,
      "Fort William to Inverness",
      fortWilliam.id,
      inverness.id,
      260,
      "09:00",
      "15:00",
      "Drive through dramatic Highland valleys",
      true
    );

    const scottishSegment3 = await seedRouteSegment(
      scottishRoute.id,
      3,
      "Inverness to Edinburgh",
      inverness.id,
      edinburgh.id,
      390,
      "08:00",
      "14:30",
      null,
      true
    );

    // Seed route segments for Greek Island Hop
    const greekSegment1 = await seedRouteSegment(
      greekRoute.id,
      1,
      "Athens to Mykonos",
      athens.id,
      mykonos.id,
      190,
      "07:30",
      "12:30",
      "Port transfer and ferry crossing",
      true
    );

    const greekSegment2 = await seedRouteSegment(
      greekRoute.id,
      2,
      "Mykonos to Naxos",
      mykonos.id,
      naxos.id,
      90,
      "09:00",
      "12:00",
      "Short inter-island ferry",
      true
    );

    const greekSegment3 = await seedRouteSegment(
      greekRoute.id,
      3,
      "Naxos to Santorini",
      naxos.id,
      santorini.id,
      60,
      "10:00",
      "12:00",
      "Final ferry into Santorini",
      true
    );

    // Seed waypoints for Prague to Rome
    await seedWaypoint(pragueRomeSegment1.id, linz.id, 1);
    await seedWaypoint(pragueRomeSegment3.id, trento.id, 1);
    await seedWaypoint(pragueRomeSegment5.id, orvieto.id, 1);

    // Seed waypoints for additional routes
    await seedWaypoint(adriaticSegment1.id, ljubljana.id, 1);
    await seedWaypoint(adriaticSegment2.id, zadar.id, 1);
    await seedWaypoint(iberianSegment2.id, granada.id, 1);
    await seedWaypoint(iberianSegment4.id, porto.id, 1);
    await seedWaypoint(scottishSegment1.id, glasgow.id, 1);
    await seedWaypoint(scottishSegment2.id, glencoe.id, 1);
    await seedWaypoint(scottishSegment2.id, skye.id, 2);
    await seedWaypoint(greekSegment1.id, piraeus.id, 1);
    await seedWaypoint(greekSegment2.id, paros.id, 1);

    // Seed POIs for Prague to Rome
    await seedPointOfInterest(
      pragueRomeRoute.id,
      "Prague Castle Panorama",
      "Historic hilltop complex with sweeping city views",
      "viewpoint",
      prague.id,
      4.9,
      1320
    );

    await seedPointOfInterest(
      pragueRomeRoute.id,
      "Mirabell Gardens Stop",
      "Relaxed central stop near Salzburg old town",
      "rest",
      salzburg.id,
      4.7,
      860
    );

    await seedPointOfInterest(
      pragueRomeRoute.id,
      "Nordkette Panorama",
      "High mountain viewpoint above Innsbruck",
      "viewpoint",
      innsbruck.id,
      4.8,
      640
    );

    await seedPointOfInterest(
      pragueRomeRoute.id,
      "Verona Arena District",
      "Historic center with easy evening walking access",
      "meeting",
      verona.id,
      4.6,
      910
    );

    await seedPointOfInterest(
      pragueRomeRoute.id,
      "Piazzale Michelangelo",
      "Iconic Florence overlook at sunset",
      "viewpoint",
      florence.id,
      4.9,
      1750
    );

    await seedPointOfInterest(
      pragueRomeRoute.id,
      "Roma Sud Rider Fuel Stop",
      "Reliable fuel and break stop before central Rome",
      "fuel",
      rome.id,
      4.5,
      420
    );

    await seedPointOfInterest(
      adriaticRoute.id,
      "Rijeka Seafront Promenade",
      "Historic waterfront area for an evening stop",
      "rest",
      rijeka.id,
      4.5,
      640
    );

    await seedPointOfInterest(
      iberianRoute.id,
      "Alhambra Approach View",
      "Classic viewpoint above Granada",
      "viewpoint",
      granada.id,
      4.8,
      1220
    );

    await seedPointOfInterest(
      scottishRoute.id,
      "Quiraing Viewpoint",
      "Iconic Isle of Skye panorama",
      "viewpoint",
      skye.id,
      4.9,
      980
    );

    await seedPointOfInterest(
      greekRoute.id,
      "Oia Sunset Spot",
      "Famous Santorini clifftop sunset viewpoint",
      "viewpoint",
      santorini.id,
      4.9,
      2540
    );

    // Seed accommodations for Prague to Rome
    await seedAccommodation(
      pragueRomeRoute.id,
      "Moto Loft Prague",
      "Central stay with secure bike parking",
      118,
      prague.id,
      4.6,
      210,
      ["Secure parking", "Late check-in"]
    );

    await seedAccommodation(
      pragueRomeRoute.id,
      "Rider Base Salzburg",
      "Comfort hotel near old town access roads",
      132,
      salzburg.id,
      4.5,
      188,
      ["Covered parking", "Breakfast included"]
    );

    await seedAccommodation(
      pragueRomeRoute.id,
      "Alpine Riders Hotel Innsbruck",
      "Motorcycle-friendly stop with mountain views",
      146,
      innsbruck.id,
      4.7,
      276,
      ["Secure parking", "Gear drying room"]
    );

    await seedAccommodation(
      pragueRomeRoute.id,
      "Verona Garage Suites",
      "Old town access with private garage spaces",
      139,
      verona.id,
      4.4,
      163,
      ["Private garage", "Air conditioning"]
    );

    await seedAccommodation(
      pragueRomeRoute.id,
      "Florence Touring House",
      "Comfort rooms with quick arterial road access",
      152,
      florence.id,
      4.6,
      241,
      ["Secure parking", "Laundry"]
    );

    await seedAccommodation(
      pragueRomeRoute.id,
      "Roma Centro Biker Suites",
      "Final-night stay with guarded parking nearby",
      168,
      rome.id,
      4.5,
      317,
      ["Guarded parking", "24h reception"]
    );

    await seedAccommodation(
      adriaticRoute.id,
      "Dalmatia Rider House",
      "Simple rider base with secure bike parking",
      122,
      split.id,
      4.4,
      154,
      ["Secure parking", "Sea view"]
    );

    await seedAccommodation(
      iberianRoute.id,
      "Andalusia Touring Inn",
      "Convenient overnight stop for long Iberian stages",
      128,
      seville.id,
      4.5,
      203,
      ["Garage", "Breakfast included"]
    );

    await seedAccommodation(
      scottishRoute.id,
      "Highland Riders Lodge",
      "Cozy lodge near Highland scenic roads",
      136,
      fortWilliam.id,
      4.6,
      219,
      ["Drying room", "Parking"]
    );

    await seedAccommodation(
      greekRoute.id,
      "Cyclades Port Hotel",
      "Ferry-friendly stay close to the harbor",
      142,
      mykonos.id,
      4.5,
      271,
      ["Port shuttle", "Luggage storage"]
    );

    // Seed ferry routes
    await seedFerryRoute(
      scandinavianRoute.id,
      "Helsingor to Helsingborg",
      copenhagen.id,
      oslo.id,
      "20m",
      32,
      "ForSea Ferries",
      "Every 30 minutes"
    );

    await seedFerryRoute(
      greekRoute.id,
      "Piraeus to Mykonos",
      piraeus.id,
      mykonos.id,
      "2h 45m",
      58,
      "Blue Star Ferries",
      "08:00, 12:30, 17:30"
    );

    await seedFerryRoute(
      greekRoute.id,
      "Mykonos to Naxos",
      mykonos.id,
      naxos.id,
      "1h 10m",
      34,
      "SeaJets",
      "10:15, 15:45"
    );

    await seedFerryRoute(
      greekRoute.id,
      "Naxos to Santorini",
      naxos.id,
      santorini.id,
      "1h 20m",
      36,
      "Blue Star Ferries",
      "11:20, 18:10"
    );
    
    // No ferries for other routes
    
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

async function seedFerryRoute(
  routeId: number,
  name: string,
  startPortId: number,
  endPortId: number,
  duration: string,
  price: number,
  operator: string,
  schedule: string
) {
  const existingFerryRoute = await db.query.ferryRoutes.findFirst({
    where: (ferries, { and, eq }) => and(
      eq(ferries.routeId, routeId),
      eq(ferries.name, name),
      eq(ferries.startPortId, startPortId),
      eq(ferries.endPortId, endPortId)
    )
  });

  if (existingFerryRoute) return existingFerryRoute;

  const [newFerryRoute] = await db.insert(ferryRoutes).values({
    routeId,
    name,
    startPortId,
    endPortId,
    duration,
    price: price.toString(),
    operator,
    schedule
  }).returning();

  return newFerryRoute;
}

seed();
