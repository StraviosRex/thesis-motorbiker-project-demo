import { Coordinates } from "@/lib/utils";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

interface GeocodeResult {
  coordinates: Coordinates;
  displayName: string;
}

const CACHE_DIR = join(process.cwd(), "cache", "geocoding");
const GEOCODE_CACHE_FILE = join(CACHE_DIR, "forward.json");
const REVERSE_CACHE_FILE = join(CACHE_DIR, "reverse.json");

const CITY_FALLBACKS: Record<string, GeocodeResult> = {
  prague: {
    coordinates: { lat: 50.0755, lng: 14.4378 },
    displayName: "Prague, Czech Republic",
  },
  praha: {
    coordinates: { lat: 50.0755, lng: 14.4378 },
    displayName: "Prague, Czech Republic",
  },
  istanbul: {
    coordinates: { lat: 41.0082, lng: 28.9784 },
    displayName: "Istanbul, Turkey",
  },
  rome: {
    coordinates: { lat: 41.9028, lng: 12.4964 },
    displayName: "Rome, Italy",
  },
  athens: {
    coordinates: { lat: 37.9838, lng: 23.7275 },
    displayName: "Athens, Greece",
  },
  berlin: {
    coordinates: { lat: 52.52, lng: 13.405 },
    displayName: "Berlin, Germany",
  },
  vienna: {
    coordinates: { lat: 48.2082, lng: 16.3738 },
    displayName: "Vienna, Austria",
  },
  paris: {
    coordinates: { lat: 48.8566, lng: 2.3522 },
    displayName: "Paris, France",
  },
};

const normalizeLocationName = (value: string): string =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

const reverseCacheKey = (coordinates: Coordinates): string =>
  `${coordinates.lat.toFixed(4)},${coordinates.lng.toFixed(4)}`;

function readJsonCache<T>(filePath: string, fallback: T): T {
  try {
    if (!existsSync(filePath)) return fallback;
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJsonCache<T>(filePath: string, value: T) {
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    writeFileSync(filePath, JSON.stringify(value));
  } catch (error) {
    console.warn("[GeocodingService] Failed to write cache:", (error as Error).message);
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GeocodingService {
  private baseUrl = "https://nominatim.openstreetmap.org";
  private lastRequestTime = 0;
  private minRequestInterval = 1000; // 1 second between requests
  private geocodeCache = readJsonCache<Record<string, GeocodeResult>>(GEOCODE_CACHE_FILE, {});
  private reverseCache = readJsonCache<Record<string, string>>(REVERSE_CACHE_FILE, {});
  private requestQueue: Promise<void> = Promise.resolve();

  private async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  private async enqueueRequest<T>(operation: () => Promise<T>): Promise<T> {
    const runAfterPrevious = this.requestQueue.then(async () => {
      await this.waitForRateLimit();
      return operation();
    });

    this.requestQueue = runAfterPrevious.then(
      () => undefined,
      () => undefined
    );

    return runAfterPrevious;
  }

  async geocode(locationName: string): Promise<{
    coordinates: Coordinates;
    displayName: string;
  } | null> {
    console.log(`[GeocodingService] Geocoding: ${locationName}`);
    const cacheKey = normalizeLocationName(locationName);
    const cached = this.geocodeCache[cacheKey];
    if (cached) {
      return cached;
    }

    const fallback = CITY_FALLBACKS[cacheKey];

    // Request multiple results and filter for Europe
    const response = await this.fetchWithRateLimit(
      `${this.baseUrl}/search?q=${encodeURIComponent(locationName)}&format=json&limit=5&countrycodes=cz,de,fr,it,es,pt,gb,ie,nl,be,at,ch,pl,hu,ro,bg,gr,hr,si,sk,rs,ba,mk,al,me,xk,dk,se,no,fi,ee,lv,lt,tr`
    );

    if (!response.ok) {
      console.error('[GeocodingService] API Error:', response.status);
      if (fallback) {
        console.warn(`[GeocodingService] Using local fallback for: ${locationName}`);
        this.cacheGeocode(cacheKey, fallback);
        return fallback;
      }
      return null;
    }

    const data: NominatimResponse[] = await response.json();

    if (data.length === 0) {
      console.warn(`[GeocodingService] No results for: ${locationName}`);
      if (fallback) {
        console.warn(`[GeocodingService] Using local fallback for: ${locationName}`);
        this.cacheGeocode(cacheKey, fallback);
        return fallback;
      }
      return null;
    }

    const result = data[0];
    console.log(`[GeocodingService] Found: ${result.display_name}`);

    const geocodeResult = {
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
      displayName: result.display_name,
    };
    this.cacheGeocode(cacheKey, geocodeResult);
    return geocodeResult;
  }

  async reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    console.log(`[GeocodingService] Reverse geocoding: ${coordinates.lat}, ${coordinates.lng}`);
    const cacheKey = reverseCacheKey(coordinates);
    const cached = this.reverseCache[cacheKey];
    if (cached) {
      return cached;
    }

    const response = await this.fetchWithRateLimit(
      `${this.baseUrl}/reverse?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json`
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

    if (city) {
      this.reverseCache[cacheKey] = city;
      writeJsonCache(REVERSE_CACHE_FILE, this.reverseCache);
    }

    return city;
  }

  private async fetchWithRateLimit(url: string): Promise<Response> {
    let response: Response | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      response = await this.enqueueRequest(() =>
        fetch(url, {
          headers: {
            "User-Agent": "MotoRoute-Europe/1.0",
          },
        })
      );

      if (response.status !== 429) {
        return response;
      }

      const waitMs = 2000 * (attempt + 1);
      console.warn(`[GeocodingService] Rate limited, retrying in ${waitMs}ms`);
      await sleep(waitMs);
    }

    return response!;
  }

  private cacheGeocode(cacheKey: string, result: GeocodeResult) {
    this.geocodeCache[cacheKey] = result;
    writeJsonCache(GEOCODE_CACHE_FILE, this.geocodeCache);
  }
}

export const geocodingService = new GeocodingService();
