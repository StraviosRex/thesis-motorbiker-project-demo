import { db } from "./index";
import { sql } from "drizzle-orm";
import { locations, savedRoutes, routeSegments, waypoints, pointsOfInterest, accommodations, ferryRoutes } from "@shared/schema";

async function seed() {
  try {
    console.log("Clearing existing data...");
    // TRUNCATE with RESTART IDENTITY resets serial sequences back to 1,
    // so route IDs are stable across reseeds and saved URLs remain valid.
    await db.execute(sql`
      TRUNCATE TABLE
        waypoints,
        route_segments,
        ferry_routes,
        points_of_interest,
        accommodations,
        saved_routes,
        locations
      RESTART IDENTITY CASCADE
    `);

    console.log("Starting to seed database...");

    // ── Locations ──────────────────────────────────────────────────────────
    const berlin      = await seedLocation("Berlin",       52.5200,  13.4050, "Germany");
    const leipzig     = await seedLocation("Leipzig",      51.3397,  12.3731, "Germany");
    const munich      = await seedLocation("Munich",       48.1351,  11.5820, "Germany");
    const innsbruck   = await seedLocation("Innsbruck",    47.2692,  11.4041, "Austria");
    const bolzano     = await seedLocation("Bolzano",      46.4983,  11.3548, "Italy");
    const trento      = await seedLocation("Trento",       46.0748,  11.1217, "Italy");
    const verona      = await seedLocation("Verona",       45.4384,  10.9916, "Italy");
    const florence    = await seedLocation("Florence",     43.7696,  11.2558, "Italy");
    const orvieto     = await seedLocation("Orvieto",      42.7185,  12.1116, "Italy");
    const rome        = await seedLocation("Rome",         41.9028,  12.4964, "Italy");
    const copenhagen  = await seedLocation("Copenhagen",   55.6761,  12.5683, "Denmark");
    const jonkoping   = await seedLocation("Jönköping",    57.7826,  14.1618, "Sweden");
    const gothenburg  = await seedLocation("Gothenburg",   57.7089,  11.9746, "Sweden");
    const malmo       = await seedLocation("Malmö",         55.6050,  13.0038, "Sweden");
    const oslo        = await seedLocation("Oslo",         59.9139,  10.7522, "Norway");
    const prague      = await seedLocation("Prague",       50.0755,  14.4378, "Czech Republic");
    const linz        = await seedLocation("Linz",         48.3069,  14.2858, "Austria");
    const salzburg    = await seedLocation("Salzburg",     47.8095,  13.0550, "Austria");
    const vienna      = await seedLocation("Vienna",       48.2082,  16.3738, "Austria");
    const ljubljana   = await seedLocation("Ljubljana",    46.0569,  14.5058, "Slovenia");
    const rijeka      = await seedLocation("Rijeka",       45.3271,  14.4422, "Croatia");
    const zadar       = await seedLocation("Zadar",        44.1194,  15.2314, "Croatia");
    const split       = await seedLocation("Split",        43.5081,  16.4402, "Croatia");
    const dubrovnik   = await seedLocation("Dubrovnik",    42.6507,  18.0944, "Croatia");
    const barcelona   = await seedLocation("Barcelona",    41.3874,   2.1686, "Spain");
    const zaragoza    = await seedLocation("Zaragoza",     41.6488,  -0.8891, "Spain");
    const madrid      = await seedLocation("Madrid",       40.4168,  -3.7038, "Spain");
    const salamanca   = await seedLocation("Salamanca",    40.9701,  -5.6635, "Spain");
    const porto       = await seedLocation("Porto",        41.1579,  -8.6291, "Portugal");
    const lisbon      = await seedLocation("Lisbon",       38.7223,  -9.1393, "Portugal");
    const seville     = await seedLocation("Seville",      37.3891,  -5.9845, "Spain");
    const granada     = await seedLocation("Granada",      37.1773,  -3.5986, "Spain");
    const valencia    = await seedLocation("Valencia",     39.4699,  -0.3763, "Spain");
    const edinburgh   = await seedLocation("Edinburgh",    55.9533,  -3.1883, "United Kingdom");
    const glasgow     = await seedLocation("Glasgow",      55.8642,  -4.2518, "United Kingdom");
    const glencoe     = await seedLocation("Glencoe",      56.6823,  -5.0244, "United Kingdom");
    const fortWilliam = await seedLocation("Fort William", 56.8198,  -5.1052, "United Kingdom");
    const skye        = await seedLocation("Isle of Skye", 57.2736,  -6.2155, "United Kingdom");
    const inverness   = await seedLocation("Inverness",    57.4778,  -4.2247, "United Kingdom");
    const marseille   = await seedLocation("Marseille",    43.2965,   5.3698, "France");
    const nice        = await seedLocation("Nice",         43.7102,   7.2620, "France");
    const monaco      = await seedLocation("Monaco",       43.7384,   7.4246, "Monaco");
    const genoa       = await seedLocation("Genoa",        44.4056,   8.9463, "Italy");
    const pisa        = await seedLocation("Pisa",         43.7228,  10.4017, "Italy");
    const athens      = await seedLocation("Athens",       37.9838,  23.7275, "Greece");
    const piraeus     = await seedLocation("Piraeus",      37.9475,  23.6461, "Greece");
    const mykonos     = await seedLocation("Mykonos",      37.4467,  25.3289, "Greece");
    const paros       = await seedLocation("Paros",        37.0856,  25.1489, "Greece");
    const naxos       = await seedLocation("Naxos",        37.1036,  25.3762, "Greece");
    const santorini   = await seedLocation("Santorini",    36.3932,  25.4615, "Greece");

    // ── Routes ─────────────────────────────────────────────────────────────
    // Duration = n_days × 420 min (7 h riding/day avg).
    // SavedRoutes card shows: Math.ceil(duration / 480) days.

    // Alpine Adventure — 5 days, 1 450 km
    // Berlin → Munich → Innsbruck → Bolzano → Florence → Rome
    const berlinRomeRoute = await seedRoute(
      "Alpine Adventure",
      "Berlin to Rome via Munich, Innsbruck, Bolzano and Florence",
      berlin.id, rome.id,
      1450, "2100",
      { scenicRoutes: true, avoidHighways: true, includeFerries: false },
      { start: "2023-06-15", end: "2023-06-20" }
    );

    // Scandinavian Tour — 3 days, 980 km
    // Copenhagen → Jönköping → Gothenburg → Oslo
    const scandinavianRoute = await seedRoute(
      "Scandinavian Tour",
      "Copenhagen to Oslo via Jönköping and Gothenburg",
      copenhagen.id, oslo.id,
      980, "1260",
      { scenicRoutes: true, avoidHighways: true, includeFerries: true },
      { start: "2023-08-01", end: "2023-08-04" }
    );

    // Prague to Rome Grand Tour — 4 days, 1 360 km
    // Prague → Salzburg → Bolzano → Florence → Rome
    const pragueRomeRoute = await seedRoute(
      "Prague to Rome Grand Tour",
      "Prague to Rome via Salzburg, Bolzano and Florence",
      prague.id, rome.id,
      1360, "1680",
      { scenicRoutes: true, avoidHighways: true, includeFerries: false },
      { start: "2024-06-10", end: "2024-06-14" }
    );

    // Adriatic Coastal Ride — 3 days, 1 120 km
    // Vienna → Ljubljana → Zadar → Dubrovnik
    const adriaticRoute = await seedRoute(
      "Adriatic Coastal Ride",
      "Vienna to Dubrovnik via Ljubljana and the Croatian coast",
      vienna.id, dubrovnik.id,
      1120, "1260",
      { scenicRoutes: true, avoidHighways: true, includeFerries: false },
      { start: "2024-05-12", end: "2024-05-15" }
    );

    // Iberian Grand Loop — 9 days, 3 075 km
    // Barcelona → Zaragoza → Madrid → Salamanca → Porto → Lisbon → Seville → Granada → Valencia → Barcelona
    const iberianRoute = await seedRoute(
      "Iberian Grand Loop",
      "Barcelona to Barcelona via central Spain, Portugal and Andalusia",
      barcelona.id, barcelona.id,
      3075, "3780",
      { scenicRoutes: true, avoidHighways: false, includeFerries: false },
      { start: "2024-09-08", end: "2024-09-17" }
    );

    // Scottish Highlands — 3 days, 920 km
    // Edinburgh → Fort William → Isle of Skye → Edinburgh (via Inverness + Cairngorms)
    const scottishRoute = await seedRoute(
      "Scottish Highlands",
      "Edinburgh loop through Glencoe, Isle of Skye and the Cairngorms",
      edinburgh.id, edinburgh.id,
      920, "1260",
      { scenicRoutes: true, avoidHighways: true, includeFerries: false },
      { start: "2024-07-10", end: "2024-07-13" }
    );

    // Greek Island Hop — 3 days, 340 km
    const greekRoute = await seedRoute(
      "Greek Island Hop",
      "Athens to Santorini via the Cyclades by ferry",
      athens.id, santorini.id,
      340, "1260",
      { scenicRoutes: true, avoidHighways: false, includeFerries: true },
      { start: "2024-06-20", end: "2024-06-24" }
    );

    // French & Italian Riviera Sweep — 4 days, 880 km
    // Marseille → Nice → Genoa → Pisa → Rome
    // Designed for Cruiser / Chopper: smooth coastal tarmac, sweeping Corniche roads,
    // zero tight hairpins, avg ~220 km/day (well under 275 km cruiser limit).
    const rivieraRoute = await seedRoute(
      "French & Italian Riviera Sweep",
      "Marseille to Rome along the Côte d'Azur and Italian Riviera — smooth coastal sweepers designed for cruisers",
      marseille.id, rome.id,
      880, "1680",
      { scenicRoutes: true, avoidHighways: false, includeFerries: false },
      { start: "2024-08-05", end: "2024-08-09" }
    );

    // ── Segments: Alpine Adventure (5 days) ────────────────────────────────
    // Day 1: Berlin → Munich  580 km  (autobahn south, pause at Leipzig)
    const alpSeg1 = await seedRouteSegment(
      berlinRomeRoute.id, 1, "Berlin to Munich",
      berlin.id, munich.id, 580,
      "08:00", "17:30",
      "Highway blast south to the base of the Alps; stop at Leipzig for fuel and coffee",
      false,
      { asphalt: 100, gravel: 0, dirt: 0 },
      { motorway: 130, rural: 100, urban: 50 }
    );
    // Day 2: Munich → Innsbruck  155 km  (entering the Austrian Alps)
    await seedRouteSegment(
      berlinRomeRoute.id, 2, "Munich to Innsbruck",
      munich.id, innsbruck.id, 155,
      "09:00", "12:30",
      "Short transfer day crossing into Austria; arrive early and explore the old town",
      true,
      { asphalt: 97, gravel: 3, dirt: 0 },
      { motorway: 130, rural: 100, urban: 50 }
    );
    // Day 3: Innsbruck → Bolzano  125 km  (crossing into the Dolomites)
    await seedRouteSegment(
      berlinRomeRoute.id, 3, "Innsbruck to Bolzano",
      innsbruck.id, bolzano.id, 125,
      "09:00", "12:00",
      "World-class mountain roads through the Brenner corridor into the Italian Dolomites",
      true,
      { asphalt: 88, gravel: 10, dirt: 2 },
      { motorway: 130, rural: 90, urban: 50 }
    );
    // Day 4: Bolzano → Florence  355 km  (leaving the mountains, into Tuscany)
    const alpSeg4 = await seedRouteSegment(
      berlinRomeRoute.id, 4, "Bolzano to Florence",
      bolzano.id, florence.id, 355,
      "08:30", "15:30",
      "Descend through Trento and Verona into the rolling plains and on to Tuscany",
      true,
      { asphalt: 90, gravel: 8, dirt: 2 },
      { motorway: 130, rural: 90, urban: 50 }
    );
    // Day 5: Florence → Rome  235 km  (classic finale via Orvieto)
    const alpSeg5 = await seedRouteSegment(
      berlinRomeRoute.id, 5, "Florence to Rome",
      florence.id, rome.id, 235,
      "09:00", "14:00",
      "Scenic final leg dropping through Umbria and Orvieto into the Eternal City",
      false,
      { asphalt: 95, gravel: 4, dirt: 1 },
      { motorway: 130, rural: 90, urban: 50 }
    );

    // ── Segments: Scandinavian Tour (3 days) ───────────────────────────────
    // Day 1: Copenhagen → Jönköping  450 km  (cross into Sweden, ride Lake Vättern)
    const scandSeg1 = await seedRouteSegment(
      scandinavianRoute.id, 1, "Copenhagen to Jönköping",
      copenhagen.id, jonkoping.id, 450,
      "08:00", "16:30",
      "Cross into Sweden via Malmö and ride north alongside the vast Lake Vättern",
      false,
      { asphalt: 99, gravel: 1, dirt: 0 },
      { motorway: 120, rural: 90, urban: 50 }
    );
    // Day 2: Jönköping → Gothenburg  175 km  (west-coast city, rocky archipelago)
    await seedRouteSegment(
      scandinavianRoute.id, 2, "Jönköping to Gothenburg",
      jonkoping.id, gothenburg.id, 175,
      "09:00", "12:30",
      "Short western stage through Swedish forests; Gothenburg offers great city riding and coastal roads",
      true,
      { asphalt: 98, gravel: 2, dirt: 0 },
      { motorway: 120, rural: 90, urban: 50 }
    );
    // Day 3: Gothenburg → Oslo  355 km  (cross the border into Norway)
    await seedRouteSegment(
      scandinavianRoute.id, 3, "Gothenburg to Oslo",
      gothenburg.id, oslo.id, 355,
      "08:30", "15:00",
      "Scenic final stage through fjord country; cross into Norway and follow the E6 into Oslo",
      true,
      { asphalt: 96, gravel: 3, dirt: 1 },
      { motorway: 110, rural: 80, urban: 50 }
    );

    // ── Segments: Prague to Rome Grand Tour (4 days) ───────────────────────
    // Day 1: Prague → Salzburg  380 km  (river valleys, Linz)
    const prSeg1 = await seedRouteSegment(
      pragueRomeRoute.id, 1, "Prague to Salzburg",
      prague.id, salzburg.id, 380,
      "08:00", "14:00",
      "Easy first day through Czech and Austrian countryside; pause in Linz along the Danube",
      true,
      { asphalt: 96, gravel: 3, dirt: 1 },
      { motorway: 130, rural: 90, urban: 50 }
    );
    // Day 2: Salzburg → Bolzano  265 km  (Brenner Pass, Innsbruck lunch)
    const prSeg2 = await seedRouteSegment(
      pragueRomeRoute.id, 2, "Salzburg to Bolzano",
      salzburg.id, bolzano.id, 265,
      "09:00", "14:30",
      "Classic alpine stage over the Brenner Pass; stop in Innsbruck for lunch and the old town",
      true,
      { asphalt: 90, gravel: 8, dirt: 2 },
      { motorway: 130, rural: 90, urban: 50 }
    );
    // Day 3: Bolzano → Florence  420 km  (Dolomites descent, Trento and Verona)
    const prSeg3 = await seedRouteSegment(
      pragueRomeRoute.id, 3, "Bolzano to Florence",
      bolzano.id, florence.id, 420,
      "08:00", "16:00",
      "Descend through the Adige valley via Trento and Verona into Tuscany",
      true,
      { asphalt: 92, gravel: 6, dirt: 2 },
      { motorway: 130, rural: 90, urban: 50 }
    );
    // Day 4: Florence → Rome  295 km  (Umbria, Orvieto)
    const prSeg4 = await seedRouteSegment(
      pragueRomeRoute.id, 4, "Florence to Rome",
      florence.id, rome.id, 295,
      "08:30", "14:00",
      "Classic final run south through Umbria, past Orvieto and into Rome",
      false,
      { asphalt: 97, gravel: 2, dirt: 1 },
      { motorway: 130, rural: 90, urban: 50 }
    );

    // ── Segments: Adriatic Coastal Ride (3 days) ───────────────────────────
    // Day 1: Vienna → Ljubljana  380 km  (motorway south into Slovenia)
    await seedRouteSegment(
      adriaticRoute.id, 1, "Vienna to Ljubljana",
      vienna.id, ljubljana.id, 380,
      "08:00", "14:00",
      "Comfortable first day south through Austria into Slovenia's charming capital",
      true,
      { asphalt: 97, gravel: 2, dirt: 1 },
      { motorway: 130, rural: 90, urban: 50 }
    );
    // Day 2: Ljubljana → Zadar  440 km  (first Adriatic coastal riding)
    const adriSeg2 = await seedRouteSegment(
      adriaticRoute.id, 2, "Ljubljana to Zadar",
      ljubljana.id, zadar.id, 440,
      "08:30", "16:30",
      "Drop to the Adriatic at Rijeka then hit the famous cliff-side coastal road south to Zadar",
      true,
      { asphalt: 93, gravel: 5, dirt: 2 },
      { motorway: 130, rural: 90, urban: 50 }
    );
    // Day 3: Zadar → Dubrovnik  300 km  (spectacular southern Dalmatia)
    const adriSeg3 = await seedRouteSegment(
      adriaticRoute.id, 3, "Zadar to Dubrovnik",
      zadar.id, dubrovnik.id, 300,
      "09:00", "15:00",
      "Breathtaking final coastal stretch through Split and the Pelješac peninsula into Dubrovnik",
      true,
      { asphalt: 96, gravel: 3, dirt: 1 },
      { motorway: 130, rural: 90, urban: 50 }
    );

    // ── Segments: Iberian Grand Loop (9 days) ──────────────────────────────
    // Day 1: Barcelona → Zaragoza  310 km
    await seedRouteSegment(
      iberianRoute.id, 1, "Barcelona to Zaragoza",
      barcelona.id, zaragoza.id, 310,
      "08:30", "13:30",
      "Warm-up day heading inland through Aragon",
      false,
      { asphalt: 98, gravel: 2, dirt: 0 },
      { motorway: 120, rural: 90, urban: 50 }
    );
    // Day 2: Zaragoza → Madrid  325 km
    await seedRouteSegment(
      iberianRoute.id, 2, "Zaragoza to Madrid",
      zaragoza.id, madrid.id, 325,
      "08:30", "14:00",
      "Sweeping roads across the Castilian meseta into the Spanish capital",
      false,
      { asphalt: 97, gravel: 3, dirt: 0 },
      { motorway: 120, rural: 90, urban: 50 }
    );
    // Day 3: Madrid → Salamanca  210 km
    await seedRouteSegment(
      iberianRoute.id, 3, "Madrid to Salamanca",
      madrid.id, salamanca.id, 210,
      "09:00", "13:00",
      "Short stage into the beautiful golden-stone university city near the Portuguese border",
      true,
      { asphalt: 94, gravel: 5, dirt: 1 },
      { motorway: 120, rural: 90, urban: 50 }
    );
    // Day 4: Salamanca → Porto  340 km
    await seedRouteSegment(
      iberianRoute.id, 4, "Salamanca to Porto",
      salamanca.id, porto.id, 340,
      "09:00", "15:00",
      "Cross the Portuguese border through northern mountain roads into vibrant Porto",
      true,
      { asphalt: 88, gravel: 9, dirt: 3 },
      { motorway: 120, rural: 90, urban: 50 }
    );
    // Day 5: Porto → Lisbon  315 km
    await seedRouteSegment(
      iberianRoute.id, 5, "Porto to Lisbon",
      porto.id, lisbon.id, 315,
      "09:00", "15:00",
      "One of the best stretches of the loop — scenic Atlantic coastal road south to the capital",
      true,
      { asphalt: 99, gravel: 1, dirt: 0 },
      { motorway: 120, rural: 90, urban: 50 }
    );
    // Day 6: Lisbon → Seville  460 km
    await seedRouteSegment(
      iberianRoute.id, 6, "Lisbon to Seville",
      lisbon.id, seville.id, 460,
      "08:00", "16:30",
      "Cross back into Spain through the golden Alentejo plains and sunny Andalusia",
      false,
      { asphalt: 95, gravel: 4, dirt: 1 },
      { motorway: 120, rural: 90, urban: 50 }
    );
    // Day 7: Seville → Granada  265 km
    await seedRouteSegment(
      iberianRoute.id, 7, "Seville to Granada",
      seville.id, granada.id, 265,
      "09:00", "14:00",
      "Scenic stage through the pueblos blancos and into Granada beneath the Sierra Nevada",
      true,
      { asphalt: 91, gravel: 7, dirt: 2 },
      { motorway: 120, rural: 90, urban: 50 }
    );
    // Day 8: Granada → Valencia  490 km
    await seedRouteSegment(
      iberianRoute.id, 8, "Granada to Valencia",
      granada.id, valencia.id, 490,
      "08:00", "16:30",
      "Epic mountain stage out of the Sierra Nevada then cruise up the eastern Mediterranean coast",
      true,
      { asphalt: 86, gravel: 11, dirt: 3 },
      { motorway: 120, rural: 90, urban: 50 }
    );
    // Day 9: Valencia → Barcelona  355 km
    await seedRouteSegment(
      iberianRoute.id, 9, "Valencia to Barcelona",
      valencia.id, barcelona.id, 355,
      "08:30", "14:00",
      "Final leg along the turquoise Mediterranean — finish with tapas on Las Ramblas",
      true,
      { asphalt: 99, gravel: 1, dirt: 0 },
      { motorway: 120, rural: 90, urban: 50 }
    );

    // ── Segments: Scottish Highlands (3 days) ──────────────────────────────
    // Day 1: Edinburgh → Fort William  295 km  (via Glasgow and Glencoe)
    const scotSeg1 = await seedRouteSegment(
      scottishRoute.id, 1, "Edinburgh to Fort William",
      edinburgh.id, fortWilliam.id, 295,
      "08:30", "14:30",
      "Head northwest through Glasgow, then the dramatic A82 along Loch Lomond and through Glencoe",
      true,
      { asphalt: 82, gravel: 14, dirt: 4 },
      { motorway: 113, rural: 97, urban: 48 }
    );
    // Day 2: Fort William → Isle of Skye  165 km  (Skye loop: Old Man of Storr)
    await seedRouteSegment(
      scottishRoute.id, 2, "Fort William to Isle of Skye",
      fortWilliam.id, skye.id, 165,
      "09:00", "13:30",
      "Cross to Skye via the bridge; loop the island's dramatic roads past the Quiraing and Old Man of Storr",
      true,
      { asphalt: 78, gravel: 17, dirt: 5 },
      { rural: 97, urban: 48 }
    );
    // Day 3: Isle of Skye → Edinburgh  460 km  (via Inverness and Cairngorms)
    const scotSeg3 = await seedRouteSegment(
      scottishRoute.id, 3, "Isle of Skye to Edinburgh",
      skye.id, edinburgh.id, 460,
      "08:00", "17:00",
      "Return east through Inverness, then south on the A9 through Cairngorms National Park to Edinburgh",
      true,
      { asphalt: 85, gravel: 12, dirt: 3 },
      { motorway: 113, rural: 97, urban: 48 }
    );

    // ── Segments: French & Italian Riviera Sweep (4 days) ─────────────────
    // Day 1: Marseille → Nice  190 km  (Corniche coastal roads, zero hairpins)
    await seedRouteSegment(
      rivieraRoute.id, 1, "Marseille to Nice",
      marseille.id, nice.id, 190,
      "09:00", "13:30",
      "Ride the legendary Corniche Littoral cliff road east — sweeping bends above the Med all the way to Nice",
      true,
      { asphalt: 100, gravel: 0, dirt: 0 },
      { motorway: 130, rural: 90, urban: 50 }
    );
    // Day 2: Nice → Genoa  200 km  (Monaco Principality, Italian Riviera flowers)
    const rivSeg2 = await seedRouteSegment(
      rivieraRoute.id, 2, "Nice to Genoa",
      nice.id, genoa.id, 200,
      "09:00", "13:30",
      "Pass through Monaco then cruise the Italian Riviera on the SS1 Via Aurelia — gentle sweepers through coastal villages and palm-lined boulevards",
      true,
      { asphalt: 100, gravel: 0, dirt: 0 },
      { motorway: 130, rural: 90, urban: 50 }
    );
    // Day 3: Genoa → Pisa  175 km  (Cinque Terre coastal strip)
    await seedRouteSegment(
      rivieraRoute.id, 3, "Genoa to Pisa",
      genoa.id, pisa.id, 175,
      "09:00", "13:00",
      "Hug the Ligurian coast past the Cinque Terre — smooth tarmac, wide views, no technical sections",
      true,
      { asphalt: 100, gravel: 0, dirt: 0 },
      { motorway: 130, rural: 90, urban: 50 }
    );
    // Day 4: Pisa → Rome  315 km  (Via Aurelia coastal highway finale)
    await seedRouteSegment(
      rivieraRoute.id, 4, "Pisa to Rome",
      pisa.id, rome.id, 315,
      "08:30", "14:30",
      "Follow the ancient Via Aurelia south — long flowing straights and gentle bends along the Tyrrhenian coast into the Eternal City",
      true,
      { asphalt: 100, gravel: 0, dirt: 0 },
      { motorway: 130, rural: 90, urban: 50 }
    );

    // ── Segments: Greek Island Hop (3 days) ────────────────────────────────
    const grkSeg1 = await seedRouteSegment(
      greekRoute.id, 1, "Athens to Mykonos",
      athens.id, mykonos.id, 190,
      "07:30", "12:30",
      "Transfer to Piraeus port; high-speed ferry across the sparkling Aegean",
      true,
      { asphalt: 75, gravel: 15, dirt: 10 },
      { rural: 80, urban: 50 }
    );
    const grkSeg2 = await seedRouteSegment(
      greekRoute.id, 2, "Mykonos to Naxos",
      mykonos.id, naxos.id, 90,
      "09:00", "12:00",
      "Short inter-island ferry — optional detour through Paros on the way",
      true,
      { asphalt: 70, gravel: 20, dirt: 10 },
      { rural: 70, urban: 40 }
    );
    await seedRouteSegment(
      greekRoute.id, 3, "Naxos to Santorini",
      naxos.id, santorini.id, 60,
      "10:00", "12:00",
      "Final ferry into the caldera — arrive in time for the famous Oia sunset",
      true,
      { asphalt: 75, gravel: 18, dirt: 7 },
      { rural: 70, urban: 40 }
    );

    // ── Waypoints ──────────────────────────────────────────────────────────
    // Alpine Adventure
    await seedWaypoint(alpSeg1.id, leipzig.id,    1);  // Day 1 fuel stop
    await seedWaypoint(alpSeg4.id, trento.id,     1);  // Day 4 Dolomites
    await seedWaypoint(alpSeg4.id, verona.id,     2);  // Day 4 northern Italy
    await seedWaypoint(alpSeg5.id, orvieto.id,    1);  // Day 5 Umbria

    // Scandinavian Tour
    await seedWaypoint(scandSeg1.id, malmo.id,     1);  // Day 1 Øresund Bridge crossing

    // Prague to Rome
    await seedWaypoint(prSeg1.id, linz.id,        1);  // Day 1 Danube stop
    await seedWaypoint(prSeg2.id, innsbruck.id,   1);  // Day 2 lunch
    await seedWaypoint(prSeg3.id, trento.id,      1);  // Day 3 valley
    await seedWaypoint(prSeg3.id, verona.id,      2);  // Day 3 city
    await seedWaypoint(prSeg4.id, orvieto.id,     1);  // Day 4 Umbria

    // Adriatic
    await seedWaypoint(adriSeg2.id, rijeka.id,    1);  // Day 2 first coast view
    await seedWaypoint(adriSeg3.id, split.id,     1);  // Day 3 Diocletian's Palace

    // Iberian — all cities are segment endpoints, no waypoints needed

    // Scottish Highlands
    await seedWaypoint(scotSeg1.id, glasgow.id,   1);  // Day 1 city gateway
    await seedWaypoint(scotSeg1.id, glencoe.id,   2);  // Day 1 iconic glen
    await seedWaypoint(scotSeg3.id, inverness.id, 1);  // Day 3 Highland capital

    // French & Italian Riviera Sweep
    await seedWaypoint(rivSeg2.id, monaco.id,     1);  // Day 2 — Monaco stop

    // Greek Island Hop
    await seedWaypoint(grkSeg1.id, piraeus.id,    1);  // Day 1 port
    await seedWaypoint(grkSeg2.id, paros.id,      1);  // Day 2 optional island

    // ── Points of Interest ─────────────────────────────────────────────────
    // Alpine Adventure
    await seedPointOfInterest(berlinRomeRoute.id, "Biker's Stop - Munich",
      "Popular motorcycle meeting point with café", "rest", munich.id, 4.8, 124);
    await seedPointOfInterest(berlinRomeRoute.id, "Nordkette Panorama - Innsbruck",
      "High mountain viewpoint accessible by cable car", "viewpoint", innsbruck.id, 4.8, 312);
    await seedPointOfInterest(berlinRomeRoute.id, "Dolomites Viewpoint",
      "Spectacular mountain views above Bolzano", "viewpoint", bolzano.id, 4.9, 215);

    // Prague to Rome
    await seedPointOfInterest(pragueRomeRoute.id, "Prague Castle Panorama",
      "Historic hilltop complex with sweeping city views", "viewpoint", prague.id, 4.9, 1320);
    await seedPointOfInterest(pragueRomeRoute.id, "Mirabell Gardens Stop",
      "Relaxed central stop near Salzburg old town", "rest", salzburg.id, 4.7, 860);
    await seedPointOfInterest(pragueRomeRoute.id, "Brenner Pass Summit",
      "Photo stop at the historic Austria-Italy border crossing", "viewpoint", innsbruck.id, 4.6, 540);
    await seedPointOfInterest(pragueRomeRoute.id, "Piazzale Michelangelo",
      "Iconic Florence overlook at sunset", "viewpoint", florence.id, 4.9, 1750);
    await seedPointOfInterest(pragueRomeRoute.id, "Roma Sud Rider Fuel Stop",
      "Reliable fuel and break stop before central Rome", "fuel", rome.id, 4.5, 420);

    // Adriatic
    await seedPointOfInterest(adriaticRoute.id, "Ljubljana Dragon Bridge",
      "Iconic city landmark and great ride-through spot", "viewpoint", ljubljana.id, 4.6, 780);
    await seedPointOfInterest(adriaticRoute.id, "Zadar Sea Organ",
      "Unique coastal art installation on the Adriatic waterfront", "rest", zadar.id, 4.7, 940);

    // Iberian
    await seedPointOfInterest(iberianRoute.id, "Alhambra Approach View",
      "Classic viewpoint above Granada", "viewpoint", granada.id, 4.8, 1220);
    await seedPointOfInterest(iberianRoute.id, "Salamanca Plaza Mayor",
      "One of the finest baroque squares in Europe", "viewpoint", salamanca.id, 4.9, 1050);

    // Scottish
    await seedPointOfInterest(scottishRoute.id, "Glencoe Valley Viewpoint",
      "Legendary moody Highland glen — unmissable photo stop", "viewpoint", glencoe.id, 4.9, 1340);
    await seedPointOfInterest(scottishRoute.id, "Quiraing Viewpoint",
      "Iconic Isle of Skye panorama", "viewpoint", skye.id, 4.9, 980);

    // Riviera Sweep
    await seedPointOfInterest(rivieraRoute.id, "Corniche d'Or Viewpoint",
      "Clifftop panorama over the azure Med — classic Côte d'Azur scenery", "viewpoint", nice.id, 4.9, 1180);
    await seedPointOfInterest(rivieraRoute.id, "Monaco Harbour Overlook",
      "Pull over above Port Hercule for the iconic F1-circuit view", "viewpoint", monaco.id, 4.8, 2340);
    await seedPointOfInterest(rivieraRoute.id, "Cinque Terre Coast Road",
      "Scenic coastal strip between Genoa and Pisa — stop at any of the five villages", "viewpoint", genoa.id, 4.9, 1760);
    await seedPointOfInterest(rivieraRoute.id, "Leaning Tower Piazza Stop",
      "Quick photo break at Piazza dei Miracoli before the final run to Rome", "rest", pisa.id, 4.7, 3120);

    // Greek
    await seedPointOfInterest(greekRoute.id, "Oia Sunset Spot",
      "Famous Santorini clifftop sunset viewpoint", "viewpoint", santorini.id, 4.9, 2540);

    // ── Accommodations ─────────────────────────────────────────────────────
    // Alpine Adventure
    await seedAccommodation(berlinRomeRoute.id, "Biker's Inn - Munich",
      "Motorcycle-friendly hotel at the base of the Alps", 89, munich.id, 4.3, 98, ["Secure parking"]);
    await seedAccommodation(berlinRomeRoute.id, "Alpine Lodge - Innsbruck",
      "Mountain view rooms with gear drying facilities", 105, innsbruck.id, 4.7, 143, ["Gear drying room", "Secure parking"]);
    await seedAccommodation(berlinRomeRoute.id, "Dolomites Rider House - Bolzano",
      "Biker-friendly B&B in the heart of the Italian Alps", 98, bolzano.id, 4.5, 112, ["Covered parking", "Breakfast included"]);

    // Prague to Rome
    await seedAccommodation(pragueRomeRoute.id, "Moto Loft Prague",
      "Central stay with secure bike parking", 118, prague.id, 4.6, 210, ["Secure parking", "Late check-in"]);
    await seedAccommodation(pragueRomeRoute.id, "Rider Base Salzburg",
      "Comfort hotel near old town access roads", 132, salzburg.id, 4.5, 188, ["Covered parking", "Breakfast included"]);
    await seedAccommodation(pragueRomeRoute.id, "Dolomites Touring Stop - Bolzano",
      "Alpine hotel perfectly placed for the Brenner descent", 126, bolzano.id, 4.6, 174, ["Secure parking", "Gear drying room"]);
    await seedAccommodation(pragueRomeRoute.id, "Florence Touring House",
      "Comfort rooms with quick arterial road access", 152, florence.id, 4.6, 241, ["Secure parking", "Laundry"]);
    await seedAccommodation(pragueRomeRoute.id, "Roma Centro Biker Suites",
      "Final-night stay with guarded parking nearby", 168, rome.id, 4.5, 317, ["Guarded parking", "24h reception"]);

    // Adriatic
    await seedAccommodation(adriaticRoute.id, "Ljubljana Rider Hotel",
      "Central hotel with secure motorcycle parking", 115, ljubljana.id, 4.4, 167, ["Secure parking", "Late check-in"]);
    await seedAccommodation(adriaticRoute.id, "Dalmatia Rider House - Zadar",
      "Simple rider base one block from the Adriatic", 118, zadar.id, 4.4, 154, ["Secure parking", "Sea view"]);

    // Iberian
    await seedAccommodation(iberianRoute.id, "Andalusia Touring Inn",
      "Convenient overnight stop for long Iberian stages", 128, seville.id, 4.5, 203, ["Garage", "Breakfast included"]);
    await seedAccommodation(iberianRoute.id, "Porto Riverside Biker Lodge",
      "Charming riverside stay with motorbike parking", 122, porto.id, 4.6, 189, ["Garage", "Breakfast included"]);

    // Scottish
    await seedAccommodation(scottishRoute.id, "Highland Riders Lodge",
      "Cosy lodge near Highland scenic roads", 136, fortWilliam.id, 4.6, 219, ["Drying room", "Parking"]);
    await seedAccommodation(scottishRoute.id, "Skye Biker B&B",
      "Family-run B&B with epic views of the Cuillin ridge", 142, skye.id, 4.8, 185, ["Secure parking", "Breakfast included"]);

    // Riviera Sweep
    await seedAccommodation(rivieraRoute.id, "Nice Promenade Rider Hotel",
      "Steps from the Promenade des Anglais with secure underground bike parking", 145, nice.id, 4.6, 312, ["Secure underground parking", "Late check-in"]);
    await seedAccommodation(rivieraRoute.id, "Genoa Old Port Lodge",
      "Harbourside hotel with private locked garage for motorcycles", 128, genoa.id, 4.5, 224, ["Private garage", "Breakfast included"]);
    await seedAccommodation(rivieraRoute.id, "Pisa Rider B&B",
      "Friendly B&B run by bikers — five minutes from the tower, covered parking", 98, pisa.id, 4.7, 178, ["Covered parking", "Breakfast included", "Tool kit available"]);

    // Greek
    await seedAccommodation(greekRoute.id, "Cyclades Port Hotel",
      "Ferry-friendly stay close to the harbour", 142, mykonos.id, 4.5, 271, ["Port shuttle", "Luggage storage"]);

    // ── Ferry Routes ───────────────────────────────────────────────────────
    await seedFerryRoute(
      scandinavianRoute.id,
      "Helsingør to Helsingborg",
      copenhagen.id, oslo.id,
      "20m", 32, "ForSea Ferries", "Every 30 minutes"
    );

    await seedFerryRoute(
      greekRoute.id, "Piraeus to Mykonos",
      piraeus.id, mykonos.id,
      "2h 45m", 58, "Blue Star Ferries", "08:00, 12:30, 17:30"
    );

    await seedFerryRoute(
      greekRoute.id, "Mykonos to Naxos",
      mykonos.id, naxos.id,
      "1h 10m", 34, "SeaJets", "10:15, 15:45"
    );

    await seedFerryRoute(
      greekRoute.id, "Naxos to Santorini",
      naxos.id, santorini.id,
      "1h 20m", 36, "Blue Star Ferries", "11:20, 18:10"
    );

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

// ── Helper functions ────────────────────────��───────────────────────────────

async function seedLocation(name: string, lat: number, lng: number, country: string) {
  const [loc] = await db.insert(locations).values({
    name,
    latitude: lat.toString(),
    longitude: lng.toString(),
    country,
  }).returning();
  return loc;
}

async function seedRoute(
  name: string,
  description: string,
  startLocationId: number,
  endLocationId: number,
  distance: number,
  duration: string,
  preferences: { scenicRoutes: boolean; avoidHighways: boolean; includeFerries: boolean },
  dates: { start: string; end: string }
) {
  const [route] = await db.insert(savedRoutes).values({
    name, description, startLocationId, endLocationId,
    distance: distance.toString(),
    duration,
    preferences, dates,
    isPublic: true,
  }).returning();
  return route;
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
  isScenic: boolean,
  surfaceData: { asphalt: number; gravel: number; dirt: number },
  speedLimits: { motorway?: number; rural: number; urban: number }
) {
  const [segment] = await db.insert(routeSegments).values({
    routeId, day, title, startLocationId, endLocationId,
    distance: distance.toString(),
    startTime, endTime, notes, isScenic, surfaceData, speedLimits,
  }).returning();
  return segment;
}

async function seedWaypoint(segmentId: number, locationId: number, order: number) {
  const [wp] = await db.insert(waypoints).values({ segmentId, locationId, order }).returning();
  return wp;
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
  const [poi] = await db.insert(pointsOfInterest).values({
    routeId, name, description, type, locationId,
    rating: rating.toString(),
    reviews,
  }).returning();
  return poi;
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
  const [acc] = await db.insert(accommodations).values({
    routeId, name, description,
    price: price.toString(),
    locationId,
    rating: rating.toString(),
    reviews, features,
  }).returning();
  return acc;
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
  const [ferry] = await db.insert(ferryRoutes).values({
    routeId, name, startPortId, endPortId,
    duration,
    price: price.toString(),
    operator, schedule,
  }).returning();
  return ferry;
}

seed();