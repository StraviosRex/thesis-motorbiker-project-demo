/**
 * Curated lookup table of major European motorcycle-relevant ferry routes.
 *
 * Prices reflect a motorcycle + one rider, approximate low/high season range.
 * Sources: individual operator websites (DFDS, Brittany Ferries, Superfast, etc.)
 * as of 2024/2025 tariffs.
 *
 * findFerryPrices() accepts the start/end coordinates of an ORS-detected ferry
 * step and returns the best matching known route within a geo-proximity threshold.
 */

export interface FerryPriceResult {
  routeName: string;
  startPortName: string;
  endPortName: string;
  operator: string;
  priceMin: number;
  priceMax: number;
  priceUnit: string;
  duration: string;
  schedule: string;
  bookingUrl: string;
}

interface KnownFerryRoute extends FerryPriceResult {
  startCoords: { lat: number; lng: number };
  endCoords: { lat: number; lng: number };
}

const KNOWN_FERRY_ROUTES: KnownFerryRoute[] = [
  // ── English Channel ──────────────────────────────────────────────────────────
  {
    routeName: "Dover – Calais",
    startPortName: "Dover", startCoords: { lat: 51.1279, lng: 1.3134 },
    endPortName: "Calais",  endCoords:   { lat: 50.9513, lng: 1.8587 },
    operator: "DFDS / P&O Ferries",
    priceMin: 50, priceMax: 130, priceUnit: "per motorcycle + rider",
    duration: "1h 30min", schedule: "Up to 50 crossings/day",
    bookingUrl: "https://www.dfds.com/en/passenger-ferries/yourbooking",
  },
  {
    routeName: "Harwich – Hook of Holland",
    startPortName: "Harwich",         startCoords: { lat: 51.9454, lng: 1.2596 },
    endPortName:   "Hook of Holland", endCoords:   { lat: 51.9773, lng: 4.1319 },
    operator: "Stena Line",
    priceMin: 80, priceMax: 220, priceUnit: "per motorcycle + rider",
    duration: "6h 30min (day) / 8h (night)",
    schedule: "2 departures/day",
    bookingUrl: "https://www.stenaline.co.uk/ferry-routes/harwich-hook-of-holland",
  },
  {
    routeName: "Amsterdam (IJmuiden) – Newcastle",
    startPortName: "IJmuiden",  startCoords: { lat: 52.4582, lng: 4.5986 },
    endPortName:   "Newcastle", endCoords:   { lat: 54.9783, lng: -1.6178 },
    operator: "DFDS",
    priceMin: 100, priceMax: 280, priceUnit: "per motorcycle + rider",
    duration: "16–17h", schedule: "1 departure/day",
    bookingUrl: "https://www.dfds.com/en/passenger-ferries/yourbooking",
  },

  // ── Bay of Biscay ────────────────────────────────────────────────────────────
  {
    routeName: "Portsmouth – Bilbao",
    startPortName: "Portsmouth", startCoords: { lat: 50.7984, lng: -1.0912 },
    endPortName:   "Bilbao",     endCoords:   { lat: 43.3503, lng: -3.0498 },
    operator: "Brittany Ferries",
    priceMin: 120, priceMax: 420, priceUnit: "per motorcycle + rider",
    duration: "24–35h", schedule: "3–4 departures/week",
    bookingUrl: "https://www.brittany-ferries.co.uk/ferry-routes/portsmouth-bilbao",
  },
  {
    routeName: "Portsmouth – Santander",
    startPortName: "Portsmouth", startCoords: { lat: 50.7984, lng: -1.0912 },
    endPortName:   "Santander",  endCoords:   { lat: 43.4623, lng: -3.8099 },
    operator: "Brittany Ferries",
    priceMin: 110, priceMax: 400, priceUnit: "per motorcycle + rider",
    duration: "24h", schedule: "2–3 departures/week",
    bookingUrl: "https://www.brittany-ferries.co.uk/ferry-routes/portsmouth-santander",
  },

  // ── Adriatic Sea ─────────────────────────────────────────────────────────────
  {
    routeName: "Ancona – Patras",
    startPortName: "Ancona", startCoords: { lat: 43.6229, lng: 13.5089 },
    endPortName:   "Patras", endCoords:   { lat: 38.2466, lng: 21.7346 },
    operator: "Superfast Ferries / ANEK Lines",
    priceMin: 80, priceMax: 240, priceUnit: "per motorcycle + rider",
    duration: "21h", schedule: "Daily (peak season)",
    bookingUrl: "https://www.superfast.com",
  },
  {
    routeName: "Bari – Patras",
    startPortName: "Bari",   startCoords: { lat: 41.1171, lng: 16.8719 },
    endPortName:   "Patras", endCoords:   { lat: 38.2466, lng: 21.7346 },
    operator: "Superfast Ferries",
    priceMin: 75, priceMax: 210, priceUnit: "per motorcycle + rider",
    duration: "15–16h", schedule: "Daily",
    bookingUrl: "https://www.superfast.com",
  },
  {
    routeName: "Brindisi – Igoumenitsa",
    startPortName: "Brindisi",     startCoords: { lat: 40.6279, lng: 17.9402 },
    endPortName:   "Igoumenitsa",  endCoords:   { lat: 39.5004, lng: 20.2738 },
    operator: "Grimaldi Lines",
    priceMin: 60, priceMax: 160, priceUnit: "per motorcycle + rider",
    duration: "8–9h", schedule: "Daily",
    bookingUrl: "https://www.grimaldi-lines.com",
  },
  {
    routeName: "Venice – Patras",
    startPortName: "Venice", startCoords: { lat: 45.4408, lng: 12.3155 },
    endPortName:   "Patras", endCoords:   { lat: 38.2466, lng: 21.7346 },
    operator: "Minoan Lines",
    priceMin: 90, priceMax: 260, priceUnit: "per motorcycle + rider",
    duration: "30h", schedule: "3–4 per week",
    bookingUrl: "https://www.minoan.gr",
  },
  {
    routeName: "Bari – Durrës",
    startPortName: "Bari",   startCoords: { lat: 41.1171, lng: 16.8719 },
    endPortName:   "Durrës", endCoords:   { lat: 41.3246, lng: 19.4565 },
    operator: "Adria Ferries",
    priceMin: 50, priceMax: 140, priceUnit: "per motorcycle + rider",
    duration: "8–9h", schedule: "Daily",
    bookingUrl: "https://www.adriaferries.com",
  },

  // ── Tyrrhenian / Sicily ──────────────────────────────────────────────────────
  {
    routeName: "Genoa – Palermo",
    startPortName: "Genoa",   startCoords: { lat: 44.4056, lng: 8.9463 },
    endPortName:   "Palermo", endCoords:   { lat: 38.1157, lng: 13.3615 },
    operator: "Grimaldi Lines / GNV",
    priceMin: 70, priceMax: 200, priceUnit: "per motorcycle + rider",
    duration: "20h", schedule: "Daily",
    bookingUrl: "https://www.gnv.it/en",
  },
  {
    routeName: "Naples – Palermo",
    startPortName: "Naples",  startCoords: { lat: 40.8518, lng: 14.2681 },
    endPortName:   "Palermo", endCoords:   { lat: 38.1157, lng: 13.3615 },
    operator: "SNAV / GNV",
    priceMin: 55, priceMax: 150, priceUnit: "per motorcycle + rider",
    duration: "10–11h", schedule: "Daily",
    bookingUrl: "https://www.gnv.it/en",
  },
  {
    routeName: "Civitavecchia – Palermo",
    startPortName: "Civitavecchia", startCoords: { lat: 42.0938, lng: 11.7948 },
    endPortName:   "Palermo",       endCoords:   { lat: 38.1157, lng: 13.3615 },
    operator: "GNV",
    priceMin: 60, priceMax: 170, priceUnit: "per motorcycle + rider",
    duration: "13–14h", schedule: "4–7 per week",
    bookingUrl: "https://www.gnv.it/en",
  },

  // ── Western Mediterranean ─────────────────────────────────────────────────────
  {
    routeName: "Barcelona – Palma (Mallorca)",
    startPortName: "Barcelona", startCoords: { lat: 41.3851, lng: 2.1734 },
    endPortName:   "Palma",     endCoords:   { lat: 39.5696, lng: 2.6502 },
    operator: "Baleàlia Ferries",
    priceMin: 60, priceMax: 170, priceUnit: "per motorcycle + rider",
    duration: "7–8h", schedule: "Daily",
    bookingUrl: "https://www.balearia.com",
  },
  {
    routeName: "Marseille – Ajaccio (Corsica)",
    startPortName: "Marseille", startCoords: { lat: 43.2965, lng: 5.3698 },
    endPortName:   "Ajaccio",   endCoords:   { lat: 41.9193, lng: 8.7386 },
    operator: "La Méridionale",
    priceMin: 70, priceMax: 190, priceUnit: "per motorcycle + rider",
    duration: "12h", schedule: "Daily (peak season)",
    bookingUrl: "https://www.lameridionale.fr/en",
  },

  // ── Aegean Sea ────────────────────────────────────────────────────────────────
  {
    routeName: "Piraeus – Heraklion (Crete)",
    startPortName: "Piraeus",   startCoords: { lat: 37.9430, lng: 23.6460 },
    endPortName:   "Heraklion", endCoords:   { lat: 35.3387, lng: 25.1442 },
    operator: "Minoan Lines / ANEK",
    priceMin: 40, priceMax: 130, priceUnit: "per motorcycle + rider",
    duration: "8–9h", schedule: "Daily",
    bookingUrl: "https://www.minoan.gr",
  },
  {
    routeName: "Piraeus – Rhodes",
    startPortName: "Piraeus", startCoords: { lat: 37.9430, lng: 23.6460 },
    endPortName:   "Rhodes",  endCoords:   { lat: 36.4341, lng: 28.2176 },
    operator: "Blue Star Ferries",
    priceMin: 55, priceMax: 150, priceUnit: "per motorcycle + rider",
    duration: "14–18h", schedule: "Daily",
    bookingUrl: "https://www.bluestarferries.com/en-gb",
  },
  {
    routeName: "Igoumenitsa – Corfu",
    startPortName: "Igoumenitsa", startCoords: { lat: 39.5004, lng: 20.2738 },
    endPortName:   "Corfu",       endCoords:   { lat: 39.6243, lng: 19.9217 },
    operator: "Ionian Ferries",
    priceMin: 20, priceMax: 55, priceUnit: "per motorcycle + rider",
    duration: "1h 45min", schedule: "Hourly in peak season",
    bookingUrl: "https://www.ionianferries.gr",
  },
  // ── Cyclades (Greek Islands) ──────────────────────────────────────────────────
  {
    routeName: "Piraeus – Mykonos",
    startPortName: "Piraeus", startCoords: { lat: 37.9475, lng: 23.6461 },
    endPortName:   "Mykonos", endCoords:   { lat: 37.4467, lng: 25.3289 },
    operator: "Blue Star Ferries",
    priceMin: 45, priceMax: 120, priceUnit: "per motorcycle + rider",
    duration: "2h 45min (high-speed) / 5h (regular)",
    schedule: "3 departures/day in peak season",
    bookingUrl: "https://www.bluestarferries.com/en-gb",
  },
  {
    routeName: "Mykonos – Naxos",
    startPortName: "Mykonos", startCoords: { lat: 37.4467, lng: 25.3289 },
    endPortName:   "Naxos",   endCoords:   { lat: 37.1036, lng: 25.3762 },
    operator: "SeaJets / Blue Star Ferries",
    priceMin: 25, priceMax: 70, priceUnit: "per motorcycle + rider",
    duration: "1h 10min", schedule: "2–3 per day",
    bookingUrl: "https://www.seajets.com",
  },
  {
    routeName: "Naxos – Santorini",
    startPortName: "Naxos",     startCoords: { lat: 37.1036, lng: 25.3762 },
    endPortName:   "Santorini", endCoords:   { lat: 36.3932, lng: 25.4615 },
    operator: "Blue Star Ferries",
    priceMin: 30, priceMax: 90, priceUnit: "per motorcycle + rider",
    duration: "1h 20min (high-speed) / 3h (regular)",
    schedule: "2 per day",
    bookingUrl: "https://www.bluestarferries.com/en-gb",
  },

  // ── Baltic Sea ────────────────────────────────────────────────────────────────
  {
    routeName: "Stockholm – Tallinn",
    startPortName: "Stockholm", startCoords: { lat: 59.3293, lng: 18.0686 },
    endPortName:   "Tallinn",   endCoords:   { lat: 59.4370, lng: 24.7536 },
    operator: "Tallink Silja",
    priceMin: 80, priceMax: 220, priceUnit: "per motorcycle + rider",
    duration: "16h", schedule: "Daily",
    bookingUrl: "https://www.tallinksilja.com/stockholm-tallinn",
  },
  {
    routeName: "Stockholm – Helsinki",
    startPortName: "Stockholm", startCoords: { lat: 59.3293, lng: 18.0686 },
    endPortName:   "Helsinki",  endCoords:   { lat: 60.1699, lng: 24.9384 },
    operator: "Viking Line / Tallink",
    priceMin: 80, priceMax: 210, priceUnit: "per motorcycle + rider",
    duration: "16–17h", schedule: "Daily",
    bookingUrl: "https://www.vikingline.com/en/routes/stockholm-helsinki",
  },
  {
    routeName: "Helsinki – Tallinn",
    startPortName: "Helsinki", startCoords: { lat: 60.1699, lng: 24.9384 },
    endPortName:   "Tallinn",  endCoords:   { lat: 59.4370, lng: 24.7536 },
    operator: "Tallink",
    priceMin: 40, priceMax: 110, priceUnit: "per motorcycle + rider",
    duration: "2h", schedule: "Multiple daily",
    bookingUrl: "https://www.tallinksilja.com/helsinki-tallinn",
  },
  {
    routeName: "Rostock – Trelleborg",
    startPortName: "Rostock",    startCoords: { lat: 54.0924, lng: 12.0991 },
    endPortName:   "Trelleborg", endCoords:   { lat: 55.3769, lng: 13.1567 },
    operator: "TT-Line",
    priceMin: 60, priceMax: 160, priceUnit: "per motorcycle + rider",
    duration: "5–6h", schedule: "Multiple daily",
    bookingUrl: "https://www.ttline.com/en/routes/rostock-trelleborg",
  },
  {
    routeName: "Gedser – Rostock",
    startPortName: "Gedser",  startCoords: { lat: 54.5700, lng: 11.9303 },
    endPortName:   "Rostock", endCoords:   { lat: 54.0924, lng: 12.0991 },
    operator: "Scandlines",
    priceMin: 50, priceMax: 130, priceUnit: "per motorcycle + rider",
    duration: "2h", schedule: "Hourly",
    bookingUrl: "https://www.scandlines.com/routes/gedser-rostock",
  },
  {
    routeName: "Copenhagen – Oslo",
    startPortName: "Copenhagen", startCoords: { lat: 55.6761, lng: 12.5683 },
    endPortName:   "Oslo",       endCoords:   { lat: 59.9139, lng: 10.7522 },
    operator: "DFDS",
    priceMin: 80, priceMax: 220, priceUnit: "per motorcycle + rider",
    duration: "17h (overnight)", schedule: "Daily",
    bookingUrl: "https://www.dfds.com/en/passenger-ferries/yourbooking",
  },
];

/** Haversine distance in kilometres between two lat/lng points. */
function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

/**
 * Match ORS-detected ferry step coordinates against the curated table.
 *
 * Checks both the forward (start→end) and reverse (end→start) directions.
 * Returns the best match if the combined port-to-port distance is within
 * THRESHOLD_KM, or null if no route is close enough.
 */
export function findFerryPrices(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): FerryPriceResult | null {
  const start = { lat: startLat, lng: startLng };
  const end   = { lat: endLat,   lng: endLng };

  // Each known route contributes two distances (one per port); threshold is
  // applied to the sum so a single wildly wrong port doesn't pass.
  const THRESHOLD_KM = 80;

  let best: { route: KnownFerryRoute; score: number } | null = null;

  for (const route of KNOWN_FERRY_ROUTES) {
    const fwd =
      haversineKm(start, route.startCoords) +
      haversineKm(end,   route.endCoords);
    const rev =
      haversineKm(start, route.endCoords) +
      haversineKm(end,   route.startCoords);
    const score = Math.min(fwd, rev);

    if (score < THRESHOLD_KM * 2 && (!best || score < best.score)) {
      best = { route, score };
    }
  }

  if (!best) return null;

  const { startCoords: _s, endCoords: _e, ...result } = best.route;
  return result;
}