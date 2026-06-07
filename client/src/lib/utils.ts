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
  notes?: string;
  isScenic?: boolean;
}

export interface PointOfInterest {
  id: number;
  name: string;
  description: string;
  type: 'rest' | 'shop' | 'viewpoint' | 'meeting' | 'fuel';
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

export interface SavedRoute {
  id: number;
  name: string;
  description: string;
  startLocation: Location;
  endLocation: Location;
  distance: number;
  duration: string;
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
