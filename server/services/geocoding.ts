import { Coordinates } from "@/lib/utils";

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

export class GeocodingService {
  private baseUrl = "https://nominatim.openstreetmap.org";
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

  async geocode(locationName: string): Promise<{
    coordinates: Coordinates;
    displayName: string;
  } | null> {
    console.log(`[GeocodingService] Geocoding: ${locationName}`);

    // Wait to respect rate limit
    await this.waitForRateLimit();

    // Request multiple results and filter for Europe
    const response = await fetch(
      `${this.baseUrl}/search?q=${encodeURIComponent(locationName)}&format=json&limit=5&countrycodes=cz,de,fr,it,es,pt,gb,ie,nl,be,at,ch,pl,hu,ro,bg,gr,hr,si,sk,rs,ba,mk,al,me,xk,dk,se,no,fi,ee,lv,lt,tr`,
      {
        headers: {
          "User-Agent": "MotoRoute-Europe/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      console.error('[GeocodingService] API Error:', response.status);
      return null;
    }

    const data: NominatimResponse[] = await response.json();

    if (data.length === 0) {
      console.warn(`[GeocodingService] No results for: ${locationName}`);
      return null;
    }

    const result = data[0];
    console.log(`[GeocodingService] Found: ${result.display_name}`);

    return {
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
      displayName: result.display_name,
    };
  }

  async reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    console.log(`[GeocodingService] Reverse geocoding: ${coordinates.lat}, ${coordinates.lng}`);

    // Wait to respect rate limit
    await this.waitForRateLimit();

    const response = await fetch(
      `${this.baseUrl}/reverse?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json`,
      {
        headers: {
          "User-Agent": "MotoRoute-Europe/1.0",
        },
      }
    );

    if (!response.ok) {
      console.error('[GeocodingService] API Error:', response.status);
      return null;
    }

    const data: any = await response.json();
    
    // Try to get city name, fallback to display_name
    const city = data.address?.city || 
                 data.address?.town || 
                 data.address?.village || 
                 data.display_name;

    return city;
  }
}

export const geocodingService = new GeocodingService();
