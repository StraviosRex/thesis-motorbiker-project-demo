import { Coordinates } from "@/lib/utils";

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    tourism?: string;
    cuisine?: string;
    brand?: string;
    operator?: string;
    phone?: string;
    website?: string;
    opening_hours?: string;
    stars?: string;
    addr_street?: string;
    addr_city?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export interface POI {
  id: string;
  name: string;
  type: 'restaurant' | 'gas_station' | 'hotel' | 'attraction' | 'hospital' | 'motorcycle_repair' | 'motorcycle_parking';
  coordinates: Coordinates;
  details?: {
    cuisine?: string;
    brand?: string;
    operator?: string;
    phone?: string;
    website?: string;
    opening_hours?: string;
    stars?: string;
    address?: string;
    [key: string]: string | undefined;
  };
}

export class POIService {
  private baseUrl = "https://overpass-api.de/api/interpreter";
  private lastRequestTime = 0;
  private minRequestInterval = 1000; // 1 second between requests

  private async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  async getPOIsInBoundingBox(
    south: number, west: number, north: number, east: number,
    maxResults: number = 40
  ): Promise<POI[]> {
    const bbox = `${south},${west},${north},${east}`;
    const query = `[out:json][timeout:30];(node["amenity"="restaurant"](${bbox});node["amenity"="fuel"](${bbox});node["tourism"="hotel"](${bbox});node["tourism"="attraction"](${bbox});node["shop"="motorcycle"](${bbox});node["shop"="motorcycle_repair"](${bbox});node["amenity"="car_repair"](${bbox});node["amenity"="motorcycle_parking"](${bbox});node["motorcycle:theme"="yes"](${bbox});node["motorcycle:parking"="yes"](${bbox}););out ${maxResults};`;
    try {
      const url = `${this.baseUrl}?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'MotoRoute-Europe/1.0' },
      });
      if (!response.ok) {
        console.error('[POIService] BBox query failed:', response.status);
        return [];
      }
      const data: OverpassResponse = await response.json();
      return this.convertToPOIs(data.elements);
    } catch (error) {
      console.error('[POIService] BBox query error:', error);
      return [];
    }
  }

  async getPOIsInBoundingBoxForRoute(route: { startLocation: any; endLocation: any; segments: any[] }): Promise<POI[]> {
    const allPOIs: POI[] = [];
    const waypoints: Coordinates[] = [];

    if (route.startLocation?.coordinates) {
      waypoints.push(route.startLocation.coordinates);
    }

    for (const segment of (route.segments ?? [])) {
      const coords: { lat: number; lng: number }[] = [];
      if (segment.startLocation?.coordinates) {
        coords.push(segment.startLocation.coordinates);
        waypoints.push(segment.startLocation.coordinates);
      }
      if (segment.endLocation?.coordinates) {
        coords.push(segment.endLocation.coordinates);
        waypoints.push(segment.endLocation.coordinates);
      }
      for (const wp of (segment.waypoints ?? [])) {
        if (wp.coordinates) {
          coords.push(wp.coordinates);
          waypoints.push(wp.coordinates);
        }
      }

      if (coords.length < 2) continue;

      const lats = coords.map(c => c.lat);
      const lngs = coords.map(c => c.lng);
      const padding = 0.3;
      const south = Math.min(...lats) - padding;
      const north = Math.max(...lats) + padding;
      const west = Math.min(...lngs) - padding;
      const east = Math.max(...lngs) + padding;

      console.log(`[POIService] Segment bbox: ${south.toFixed(2)},${west.toFixed(2)},${north.toFixed(2)},${east.toFixed(2)}`);

      await this.waitForRateLimit();
      const pois = await this.queryMotorcyclePOIs(south, west, north, east);
      allPOIs.push(...pois);
    }

    if (route.endLocation?.coordinates) {
      waypoints.push(route.endLocation.coordinates);
    }

    const uniquePOIs = Array.from(
      new Map(allPOIs.map(poi => [poi.id, poi])).values()
    );

    const dedupedWaypoints = waypoints.filter((wp, i, arr) =>
      i === arr.findIndex(p => p.lat === wp.lat && p.lng === wp.lng)
    );

    const result: POI[] = [];
    const usedIds = new Set<string>();

    for (const wp of dedupedWaypoints) {
      const nearby = uniquePOIs
        .filter(poi => !usedIds.has(poi.id))
        .filter(poi => {
          const dLat = poi.coordinates.lat - wp.lat;
          const dLng = poi.coordinates.lng - wp.lng;
          return Math.sqrt(dLat * dLat + dLng * dLng) < 0.4;
        })
        .sort((a, b) => {
          const dA = Math.pow(a.coordinates.lat - wp.lat, 2) + Math.pow(a.coordinates.lng - wp.lng, 2);
          const dB = Math.pow(b.coordinates.lat - wp.lat, 2) + Math.pow(b.coordinates.lng - wp.lng, 2);
          return dA - dB;
        });

      // Balance by type: take up to 2 nearest of each type per waypoint
      const byType = nearby.reduce((acc, poi) => {
        if (!acc[poi.type]) acc[poi.type] = [];
        acc[poi.type].push(poi);
        return acc;
      }, {} as Record<string, POI[]>);

      for (const type of this.PRIORITY_TYPES) {
        const typePOIs = byType[type];
        if (typePOIs && typePOIs.length > 0) {
          for (const poi of typePOIs.slice(0, 2)) {
            usedIds.add(poi.id);
            result.push(poi);
          }
        }
        delete byType[type];
      }

      // Any remaining types get up to 1 each
      for (const typePOIs of Object.values(byType)) {
        if (typePOIs.length > 0) {
          const poi = typePOIs[0];
          usedIds.add(poi.id);
          result.push(poi);
        }
      }
    }

    console.log(`[POIService] Route total: ${uniquePOIs.length} unique POIs, returning ${result.length} near ${dedupedWaypoints.length} waypoints`);
    return result;
  }

  private async queryMotorcyclePOIs(
    south: number, west: number, north: number, east: number
  ): Promise<POI[]> {
    const bbox = `${south},${west},${north},${east}`;
    const query = `[out:json][timeout:35];(node["shop"="motorcycle"](${bbox});node["shop"="motorcycle_repair"](${bbox});node["amenity"="fuel"](${bbox});node["amenity"="motorcycle_parking"](${bbox});node["motorcycle:theme"="yes"](${bbox});node["motorcycle:parking"="yes"](${bbox}););out 50;`;

    try {
      const url = `${this.baseUrl}?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'MotoRoute-Europe/1.0' },
      });
      if (!response.ok) {
        console.error('[POIService] Motorcycle bbox query failed:', response.status);
        return [];
      }
      const data: OverpassResponse = await response.json();
      return this.convertToPOIs(data.elements);
    } catch (error) {
      console.error('[POIService] Motorcycle bbox query error:', error);
      return [];
    }
  }

  async getPOIsAlongRoute(waypoints: Coordinates[], radiusKm: number = 5, poisPerLocation: number = 5): Promise<POI[]> {
    console.log(`[POIService] Fetching POIs along route with ${waypoints.length} waypoints, ${poisPerLocation} per location`);

    // Use all waypoints (don't sample) to ensure every location gets POIs
    const allPOIs: POI[] = [];
    const poisByLocation: POI[][] = [];

    for (const waypoint of waypoints) {
      await this.waitForRateLimit();
      
      const pois = await this.getPOIsNearPoint(waypoint, radiusKm);
      
      // Get top POIs for this location (distributed by type)
      const topPOIs = this.getTopPOIsPerLocation(pois, poisPerLocation);
      poisByLocation.push(topPOIs);
      
      console.log(`[POIService] Found ${pois.length} POIs near waypoint, selected ${topPOIs.length}`);
    }

    // Flatten and remove duplicates
    const flatPOIs = poisByLocation.flat();
    const uniquePOIs = Array.from(
      new Map(flatPOIs.map(poi => [poi.id, poi])).values()
    );

    console.log(`[POIService] Total: ${uniquePOIs.length} unique POIs across ${waypoints.length} locations`);
    return uniquePOIs;
  }

  // Fixed priority order for balanced per-checkpoint distribution.
  // Motorcycle-relevant types come first so they are never crowded out.
  private readonly PRIORITY_TYPES: POI['type'][] = [
    'gas_station',
    'motorcycle_repair',
    'motorcycle_parking',
    'hotel',
    'restaurant',
  ];

  private getTopPOIsPerLocation(pois: POI[], maxPerLocation: number): POI[] {
    const perType = Math.max(1, Math.floor(maxPerLocation / this.PRIORITY_TYPES.length));

    const byType = pois.reduce((acc, poi) => {
      if (!acc[poi.type]) acc[poi.type] = [];
      acc[poi.type].push(poi);
      return acc;
    }, {} as Record<string, POI[]>);

    const result: POI[] = [];

    // Take up to perType from each priority type first
    for (const type of this.PRIORITY_TYPES) {
      const typePOIs = byType[type] ?? [];
      result.push(...typePOIs.slice(0, perType));
      delete byType[type];
    }

    // Fill any remaining slots with leftover types (attraction, hospital, etc.)
    for (const typePOIs of Object.values(byType)) {
      if (result.length >= maxPerLocation) break;
      result.push(...(typePOIs as POI[]).slice(0, maxPerLocation - result.length));
    }

    return result.slice(0, maxPerLocation);
  }

  private distributePOIsByType(pois: POI[], maxTotal: number): POI[] {
    // Group by type
    const byType = pois.reduce((acc, poi) => {
      if (!acc[poi.type]) acc[poi.type] = [];
      acc[poi.type].push(poi);
      return acc;
    }, {} as Record<string, POI[]>);

    // Calculate how many of each type to include
    const types = Object.keys(byType);
    const perType = Math.floor(maxTotal / types.length);
    
    const result: POI[] = [];
    for (const type of types) {
      // Take evenly distributed samples from each type
      const typePOIs = byType[type];
      const step = Math.max(1, Math.floor(typePOIs.length / perType));
      
      for (let i = 0; i < typePOIs.length && result.length < maxTotal; i += step) {
        result.push(typePOIs[i]);
      }
    }

    return result;
  }

  private sampleWaypoints(waypoints: Coordinates[], maxSamples: number): Coordinates[] {
    if (waypoints.length <= maxSamples) {
      return waypoints;
    }

    const step = Math.floor(waypoints.length / maxSamples);
    const sampled: Coordinates[] = [];
    
    for (let i = 0; i < waypoints.length; i += step) {
      sampled.push(waypoints[i]);
    }

    return sampled;
  }

  private async getPOIsNearPoint(center: Coordinates, radiusKm: number): Promise<POI[]> {
    const radiusMeters = radiusKm * 1000;

    // Overpass QL query for various POI types - simplified to avoid 406 errors
    const query = `[out:json];(node["amenity"="restaurant"](around:${radiusMeters},${center.lat},${center.lng});node["amenity"="fuel"](around:${radiusMeters},${center.lat},${center.lng});node["tourism"="hotel"](around:${radiusMeters},${center.lat},${center.lng});node["shop"="motorcycle"](around:${radiusMeters},${center.lat},${center.lng});node["shop"="motorcycle_repair"](around:${radiusMeters},${center.lat},${center.lng});node["amenity"="car_repair"](around:${radiusMeters},${center.lat},${center.lng});node["amenity"="motorcycle_parking"](around:${radiusMeters},${center.lat},${center.lng});node["motorcycle:theme"="yes"](around:${radiusMeters},${center.lat},${center.lng});node["motorcycle:parking"="yes"](around:${radiusMeters},${center.lat},${center.lng}););out;`;

    try {
      // Use GET request with data parameter
      const url = `${this.baseUrl}?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'MotoRoute-Europe/1.0',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[POIService] API Error:', response.status, errorText.substring(0, 200));
        return [];
      }

      const data: OverpassResponse = await response.json();
      return this.convertToPOIs(data.elements);
    } catch (error) {
      console.error('[POIService] Error fetching POIs:', error);
      return [];
    }
  }

  private convertToPOIs(elements: OverpassElement[]): POI[] {
    const pois: POI[] = [];
    
    for (const el of elements) {
      if (!el.tags.name) continue;
      
      const type = this.determinePOIType(el.tags);
      if (!type) continue;

      // Build address string
      const addressParts = [el.tags.addr_street, el.tags.addr_city].filter(Boolean);
      const address = addressParts.length > 0 ? addressParts.join(', ') : undefined;

      pois.push({
        id: `${el.type}-${el.id}`,
        name: el.tags.name,
        type,
        coordinates: {
          lat: el.lat,
          lng: el.lon,
        },
        details: {
          cuisine: el.tags.cuisine,
          brand: el.tags.brand,
          operator: el.tags.operator,
          phone: el.tags.phone,
          website: el.tags.website,
          opening_hours: el.tags.opening_hours,
          stars: el.tags.stars,
          address,
        },
      });
    }
    
    return pois;
  }

  private determinePOIType(tags: OverpassElement['tags']): POI['type'] | null {
    if (tags.amenity === 'restaurant') return 'restaurant';
    if (tags.amenity === 'fuel') return 'gas_station';
    if (tags.tourism === 'hotel' || tags.tourism === 'motel') return 'hotel';
    if (tags.tourism === 'attraction') return 'attraction';
    if (tags.amenity === 'hospital') return 'hospital';
    if (tags.amenity === 'motorcycle_parking') return 'motorcycle_parking';
    if (tags.shop === 'motorcycle' || tags.shop === 'motorcycle_repair' || tags.amenity === 'car_repair') return 'motorcycle_repair';
    if (tags['motorcycle:theme'] === 'yes') return 'restaurant';
    if (tags['motorcycle:parking'] === 'yes') return 'attraction';
    return null;
  }
}
