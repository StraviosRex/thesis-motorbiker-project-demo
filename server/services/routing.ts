import { Coordinates } from "@/lib/utils";
import polyline from "@mapbox/polyline";

interface ORSCoordinate {
  lng: number;
  lat: number;
}

interface ORSRouteResponse {
  routes: Array<{
    summary: {
      distance: number; // in meters
      duration: number; // in seconds
    };
    geometry: string | {
      coordinates: number[][]; // [lng, lat][]
    };
    segments: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        distance: number;
        duration: number;
        instruction: string;
        name: string;
        way_points: number[];
      }>;
    }>;
  }>;
}

interface RouteSegment {
  day: number;
  startCoords: Coordinates;
  endCoords: Coordinates;
  waypoints: Coordinates[];
  distance: number; // in km
  duration: number; // in minutes
}

export interface FerryStep {
  name: string;
  startCoords: Coordinates;
  endCoords: Coordinates;
}

export class RoutingService {
  private apiKey: string;
  private baseUrl = "https://api.openrouteservice.org/v2";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async calculateRoute(
    start: Coordinates,
    end: Coordinates,
    preferences?: {
      avoidHighways?: boolean;
      scenicRoutes?: boolean;
    }
  ): Promise<{
    distance: number; // in km
    duration: number; // in minutes
    segments: RouteSegment[];
    geometry: Coordinates[];
    roadNames: string[];
    ferrySteps: FerryStep[];
  }> {
    const coordinates = [
      [start.lng, start.lat],
      [end.lng, end.lat],
    ];

    const requestBody: any = {
      coordinates,
      preference: preferences?.scenicRoutes ? "recommended" : "fastest",
      units: "km",
      geometry: true,
      instructions: true,
    };

    // Add options to avoid highways if requested
    if (preferences?.avoidHighways) {
      requestBody.options = {
        avoid_features: ["highways"],
      };
    }

    console.log('[RoutingService] Calling OpenRouteService API...');
    
    const response = await fetch(`${this.baseUrl}/directions/driving-car`, {
      method: "POST",
      headers: {
        Authorization: this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RoutingService] API Error:', response.status, errorText);
      throw new Error(`OpenRouteService API error: ${response.status} - ${errorText}`);
    }

    const data: ORSRouteResponse = await response.json();
    const route = data.routes[0];

    if (!route) {
      throw new Error("No route found");
    }

    const totalDistance = route.summary.distance; // in km
    const totalDuration = Math.round(route.summary.duration / 60); // convert to minutes

    console.log(`[RoutingService] Route calculated: ${totalDistance.toFixed(0)}km, ${totalDuration}min`);

    // Decode geometry (OpenRouteService returns encoded polyline)
    let routeCoordinates: number[][];
    
    if (typeof route.geometry === 'string') {
      // Decode the polyline string
      const decoded = polyline.decode(route.geometry);
      // polyline.decode returns [lat, lng] pairs, we need to swap them
      routeCoordinates = decoded.map(([lat, lng]: number[]) => [lng, lat]);
    } else if (route.geometry && route.geometry.coordinates) {
      routeCoordinates = route.geometry.coordinates;
    } else {
      console.error('[RoutingService] Invalid route geometry:', JSON.stringify(route, null, 2));
      throw new Error("Route geometry is missing from API response");
    }

    // Convert to our Coordinates format
    const geometry: Coordinates[] = routeCoordinates.map(
      ([lng, lat]: number[]) => ({ lat, lng })
    );

    // Break route into daily segments (max 400km per day)
    const segments = this.createDailySegments(
      geometry,
      totalDistance,
      totalDuration
    );

    // Extract road names and ferry steps from ORS steps
    const roadNameSet = new Set<string>();
    const ferrySteps: FerryStep[] = [];

    for (const orsSegment of route.segments) {
      for (const step of orsSegment.steps) {
        if (step.name && step.name.trim() && step.name !== '-') {
          roadNameSet.add(step.name);
        }
        const isFerry = (step as any).type === 11 ||
          step.instruction.toLowerCase().includes('ferry');
        if (isFerry) {
          const startIdx = step.way_points[0];
          const endIdx = step.way_points[step.way_points.length - 1];
          if (startIdx < geometry.length && endIdx < geometry.length) {
            ferrySteps.push({
              name: step.name || 'Ferry crossing',
              startCoords: geometry[startIdx],
              endCoords: geometry[endIdx],
            });
          }
        }
      }
    }

    return {
      distance: totalDistance,
      duration: totalDuration,
      segments,
      geometry,
      roadNames: Array.from(roadNameSet).slice(0, 20),
      ferrySteps,
    };
  }

  private createDailySegments(
    geometry: Coordinates[],
    totalDistance: number,
    totalDuration: number
  ): RouteSegment[] {
    const MAX_DAILY_DISTANCE = 400; // km
    const numDays = Math.ceil(totalDistance / MAX_DAILY_DISTANCE);
    const segments: RouteSegment[] = [];

    if (numDays === 1) {
      // Single day trip
      return [
        {
          day: 1,
          startCoords: geometry[0],
          endCoords: geometry[geometry.length - 1],
          waypoints: geometry.slice(1, -1),
          distance: totalDistance,
          duration: totalDuration,
        },
      ];
    }

    // Multi-day trip - divide geometry into segments
    const pointsPerSegment = Math.floor(geometry.length / numDays);
    
    for (let day = 0; day < numDays; day++) {
      const startIdx = day * pointsPerSegment;
      const endIdx = day === numDays - 1 ? geometry.length - 1 : (day + 1) * pointsPerSegment;
      
      const segmentGeometry = geometry.slice(startIdx, endIdx + 1);
      const segmentDistance = totalDistance / numDays; // Approximate
      const segmentDuration = totalDuration / numDays; // Approximate

      segments.push({
        day: day + 1,
        startCoords: segmentGeometry[0],
        endCoords: segmentGeometry[segmentGeometry.length - 1],
        waypoints: segmentGeometry.slice(1, -1),
        distance: segmentDistance,
        duration: segmentDuration,
      });
    }

    return segments;
  }
}

export function createRoutingService(): RoutingService | null {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  
  if (!apiKey || apiKey === 'your_key_here') {
    console.warn('[RoutingService] No API key configured. Dynamic routing disabled.');
    return null;
  }

  return new RoutingService(apiKey);
}
