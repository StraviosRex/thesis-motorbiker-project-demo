import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  id: number;
  name: string;
  coordinates: Coordinates;
}

export interface RouteSegment {
  id: number;
  day: number;
  title: string;
  distance: number;
  startLocation: Location;
  endLocation: Location;
  startTime: string;
  endTime: string;
  waypoints: Location[];
  geometry?: Coordinates[];
  notes?: string;
  isScenic?: boolean;
  surfaceData?: { asphalt: number; gravel: number; dirt: number };
  speedLimits?: { motorway?: number; rural: number; urban: number };
}

export interface PointOfInterest {
  id: number;
  name: string;
  description: string;
  type: 'rest' | 'shop' | 'viewpoint' | 'meeting' | 'fuel' | 'repair';
  coordinates: Coordinates;
  rating: number;
  reviews: number;
}

export interface Accommodation {
  id: number;
  name: string;
  description: string;
  price: number;
  location: Location;
  rating: number;
  reviews: number;
  features: string[];
}

export interface FerryRoute {
  id: number;
  name: string;
  startPort: Location;
  endPort: Location;
  duration: string;
  price: number;
  operator: string;
  schedule: string;
}

export interface RoutePreferences {
  scenicRoutes: boolean;
  avoidHighways: boolean;
  includeFerries: boolean;
}

export type BikeClass = 'adventure' | 'touring' | 'cruiser' | 'sports' | 'roadster' | 'scooter';

export interface BikeClassInfo {
  id: BikeClass;
  name: string;
  shortName: string;
  emoji: string;
  icon: string;
  description: string;
  maxDailyKm: number;
  allowGravel: boolean;
  avoidHighways: boolean;
  exampleBikes: string;
  routeHint: string;
}

export const BIKE_CLASSES: BikeClassInfo[] = [
  {
    id: 'adventure',
    name: 'Adventure / Dual-Sport',
    shortName: 'ADV',
    emoji: '🏔️',
    icon: '/bikes/adventure.png',
    description: 'Long-distance tourers who love rough terrain and remote mountain passes.',
    maxDailyKm: 400,
    allowGravel: true,
    avoidHighways: false,
    exampleBikes: 'BMW GS, Honda Africa Twin, KTM Adventure',
    routeHint: 'Handles any terrain. Massive fuel range means fewer stops and wilder paths.',
  },
  {
    id: 'touring',
    name: 'Touring / Grand Touring',
    shortName: 'GT',
    emoji: '🛣️',
    icon: '/bikes/touring.png',
    description: 'Pure comfort over massive distances. Often carries a passenger.',
    maxDailyKm: 450,
    allowGravel: false,
    avoidHighways: false,
    exampleBikes: 'Honda Goldwing, BMW RT, Harley Electra Glide',
    routeHint: 'Smooth tarmac only. Prefers wide sweeping curves — avoid tight hairpins.',
  },
  {
    id: 'cruiser',
    name: 'Cruiser / Chopper',
    shortName: 'Cruiser',
    emoji: '🤠',
    icon: '/bikes/cruiser.png',
    description: 'Low-slung, relaxed riding on sweeping coastal highways and valley floors.',
    maxDailyKm: 275,
    allowGravel: false,
    avoidHighways: false,
    exampleBikes: 'Harley Softail, Indian Chief, Kawasaki Vulcan',
    routeHint: 'Smooth asphalt only — no gravel or potholes. Gentle sweepers, no tight hairpins. Break every 90 min. Flag any leg over 350 km as Heavy Endurance.',
  },
  {
    id: 'sports',
    name: 'Sports / Sport-Touring',
    shortName: 'Sport',
    emoji: '🏁',
    icon: '/bikes/sports.png',
    description: 'Speed, agility, and leaning deep into corners.',
    maxDailyKm: 275,
    allowGravel: false,
    avoidHighways: true,
    exampleBikes: 'Yamaha R1, Kawasaki Ninja, Ducati Multistrada V4',
    routeHint: 'Lives for twisties on high-quality asphalt. Avoid straight highways.',
  },
  {
    id: 'roadster',
    name: 'Roadster / Street / Café Racer',
    shortName: 'Roadster',
    emoji: '💨',
    icon: '/bikes/roadster.png',
    description: 'Standard everyday bikes. Great for day rides and urban exploring.',
    maxDailyKm: 225,
    allowGravel: false,
    avoidHighways: true,
    exampleBikes: 'Ducati Monster, Yamaha MT-07, Triumph Bonneville',
    routeHint: 'No windshield means wind fatigue at speed. Prefer scenic regional roads.',
  },
  {
    id: 'scooter',
    name: 'Scooter / Maxi-Scooter',
    shortName: 'Scooter',
    emoji: '🛵',
    icon: '/bikes/scooter.png',
    description: 'Commuters and casual tourists — popular for island hopping.',
    maxDailyKm: 150,
    allowGravel: false,
    avoidHighways: true,
    exampleBikes: 'Vespa, Yamaha TMAX, Honda Forza',
    routeHint: 'Lower speed limits and frequent urban stops. Maxi-scooters can handle highways.',
  },
];

export interface RouteSurfaceSummary {
  sampledSegments: number;
  asphalt: number;
  gravel: number;
  dirt: number;
  roadFit: string;
}
export function getRouteCompatibility(
  route: SavedRoute,
  bikeClass: BikeClass
): { score: 'excellent' | 'good' | 'caution' | 'warning'; label: string; tips: string[]; surface?: RouteSurfaceSummary } {
  const cls = BIKE_CLASSES.find(c => c.id === bikeClass)!;
  const ridingDays = Math.max(1, Math.ceil(parseInt(route.duration) / (8 * 60)));
  const avgDailyKm = route.distance / ridingDays;
  const tips: string[] = [];
  let warnings = 0;
  let cautions = 0;

  if (avgDailyKm > cls.maxDailyKm * 1.3) {
    warnings++;
    tips.push(`High daily distance (~${Math.round(avgDailyKm)} km/day) — above the ${cls.maxDailyKm} km comfort range for ${cls.shortName}.`);
  } else if (avgDailyKm > cls.maxDailyKm) {
    cautions++;
    tips.push(`Average ~${Math.round(avgDailyKm)} km/day — slightly above typical ${cls.shortName} range (${cls.maxDailyKm} km).`);
  }

  const surfaceSegments = route.segments.filter((segment) => Boolean(segment.surfaceData));
  let surface: RouteSurfaceSummary | undefined;

  if (surfaceSegments.length > 0) {
    const sampledDistance = surfaceSegments.reduce((sum, segment) => sum + Math.max(segment.distance, 1), 0);
    const surfacePercent = (kind: "asphalt" | "gravel" | "dirt") => Math.round(
      surfaceSegments.reduce((sum, segment) => sum + (segment.surfaceData?.[kind] ?? 0) * Math.max(segment.distance, 1), 0) / sampledDistance
    );
    const asphalt = surfacePercent("asphalt");
    const gravel = surfacePercent("gravel");
    const dirt = surfacePercent("dirt");
    const looseSurface = gravel + dirt;

    if (cls.allowGravel) {
      const roadFit = looseSurface > 0
        ? `${asphalt}% asphalt and ${looseSurface}% loose surface across mapped segments — a natural fit for this bike.`
        : `${asphalt}% asphalt across mapped segments — smooth, easy progress for this bike.`;
      surface = { sampledSegments: surfaceSegments.length, asphalt, gravel, dirt, roadFit };
      tips.push(roadFit);
    } else if (looseSurface >= 15) {
      warnings++;
      const roadFit = `${looseSurface}% loose surface appears across mapped segments. This route is not ideal for ${cls.shortName} on standard road tyres.`;
      surface = { sampledSegments: surfaceSegments.length, asphalt, gravel, dirt, roadFit };
      tips.push(roadFit);
    } else if (looseSurface > 0) {
      cautions++;
      const roadFit = `${asphalt}% asphalt with ${looseSurface}% gravel or dirt across mapped segments. Slow down or choose a paved alternative where possible.`;
      surface = { sampledSegments: surfaceSegments.length, asphalt, gravel, dirt, roadFit };
      tips.push(roadFit);
    } else {
      const roadFit = `${asphalt}% smooth asphalt across mapped segments — exactly the road surface this bike prefers.`;
      surface = { sampledSegments: surfaceSegments.length, asphalt, gravel, dirt, roadFit };
      tips.push(roadFit);
    }
  }
  const nameLower = route.name.toLowerCase();

  if (bikeClass === 'cruiser') {
    // Per-segment Heavy Endurance check (>350 km in one leg)
    const heavyLegs = route.segments.filter(s => s.distance > 350);
    if (heavyLegs.length > 0) {
      cautions++;
      tips.push(`${heavyLegs.length} leg(s) exceed 350 km — consider adding a rest stop (heavy endurance for a cruiser).`);
    }
    // Hairpin / gravel risk by route name
    if (nameLower.includes('alpine') || nameLower.includes('highland') || nameLower.includes('mountain') || nameLower.includes('dolomit')) {
      warnings++;
      tips.push('Route includes tight mountain sections — scraping footpegs or floorboards is a real risk. Choose alternate valley roads where possible.');
    }
    // Ideal cruiser territory
    if (nameLower.includes('riviera') || nameLower.includes('coast') || nameLower.includes('adriatic') || nameLower.includes('mediterranean')) {
      tips.push('Coastal sweepers — textbook cruiser territory. Smooth tarmac and long flowing curves ahead.');
    }
    // Pothole/gravel note on rough-region routes
    if (nameLower.includes('scottish') || nameLower.includes('balkan')) {
      cautions++;
      tips.push('Regional roads may include surface irregularities that are harsh on cruiser / chopper suspension. Check road quality reports before each leg.');
    }
  }
  if (bikeClass === 'touring' && nameLower.includes('alpine')) {
    cautions++;
    tips.push('Verify alpine segments use wide sweeping roads — avoid extreme hairpin ramps like Stelvio north ramp.');
  }
  if (bikeClass === 'sports' && (nameLower.includes('alpine') || nameLower.includes('adriatic') || nameLower.includes('scottish'))) {
    tips.push('Excellent twisty mountain roads — ideal for aggressive sport riding.');
  }
  if (bikeClass === 'roadster' && avgDailyKm > 200) {
    cautions++;
    tips.push('Long stretches at speed increase wind fatigue. Plan extra breaks every 80–100 km.');
  }
  if (bikeClass === 'adventure' && route.distance > 500) {
    tips.push('Massive fuel range means you can skip tourist fuel stops and take wilder paths.');
  }
  if (bikeClass === 'scooter' && route.distance > 1000) {
    warnings++;
    tips.push('Long-distance route — best on a maxi-scooter (TMAX/Forza) rather than a Vespa.');
  }
  if (bikeClass === 'scooter' && route.ferryRoutes.length > 0) {
    tips.push(`${route.ferryRoutes.length} ferry crossing(s) — great for island hopping!`);
  }

  if (warnings > 0) return { score: 'warning', label: 'Challenging fit', tips, surface };
  if (cautions > 0) return { score: 'caution', label: 'Needs attention', tips, surface };
  if (tips.length > 0) return { score: 'good', label: 'Good road fit', tips, surface };
  return { score: 'excellent', label: 'Excellent road fit', tips, surface };
}

export interface SavedRoute {
  id: number;
  name: string;
  description: string;
  startLocation: Location;
  endLocation: Location;
  distance: number;
  duration: string;
  geometry?: Coordinates[];
  segments: RouteSegment[];
  pointsOfInterest: PointOfInterest[];
  accommodations: Accommodation[];
  ferryRoutes: FerryRoute[];
  dates: {
    start: string;
    end: string;
  };
  createdAt: string;
  preferences: RoutePreferences;
}

export function formatDistance(distance: number): string {
  return `${distance.toLocaleString()} km`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function formatPrice(price: number, currency: string = '€'): string {
  return `${currency}${price}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-EU', {
    month: 'short',
    year: 'numeric',
  });
}
