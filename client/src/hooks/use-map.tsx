import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { Coordinates, PointOfInterest } from "@/lib/utils";

async function fetchRoadGeometry(
  start: Coordinates,
  end: Coordinates,
  waypoints: Coordinates[]
): Promise<Coordinates[] | null> {
  try {
    const coords = [start, ...waypoints, end]
      .map(c => `${c.lng},${c.lat}`)
      .join(";");
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const coordinates = data.routes?.[0]?.geometry?.coordinates as number[][] | undefined;
    if (!coordinates?.length) return null;
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return null;
  }
}

interface UseMapOptions {
  center?: [number, number];
  zoom?: number;
}

interface MapRoute {
  start: Coordinates;
  end: Coordinates;
  waypoints?: Coordinates[];
  color?: string;
  isScenic?: boolean;
  isFerry?: boolean;
}

export function useMap(containerId: string, options: UseMapOptions = {}) {
  const mapRef = React.useRef<any | null>(null);
  const routeLayerRef = React.useRef<any | null>(null);
  const markersLayerRef = React.useRef<any | null>(null);
  const weatherLayerRef = React.useRef<any | null>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  React.useEffect(() => {
    if (mapRef.current) return;

    const mapInstance = L.map(containerId, {
      center: options.center || [49.0, 10.0],
      zoom: options.zoom || 5,
    });

    // Use CartoDB tiles which show English/Latin names
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapInstance);

    routeLayerRef.current = L.layerGroup().addTo(mapInstance);
    markersLayerRef.current = L.layerGroup().addTo(mapInstance);
    weatherLayerRef.current = L.layerGroup().addTo(mapInstance);

    mapRef.current = mapInstance;
    setMapLoaded(true);

    return () => {
      mapInstance.remove();
      mapRef.current = null;
    };
  }, [containerId]);

  const clearRoutes = React.useCallback(() => {
    routeLayerRef.current?.clearLayers();
  }, []);

  const clearMarkers = React.useCallback(() => {
    markersLayerRef.current?.clearLayers();
  }, []);

  const addRoute = React.useCallback(async (route: MapRoute) => {
    if (!mapRef.current || !routeLayerRef.current) return;

    const routeColor =
      route.color ||
      (route.isScenic ? "#22C55E" : route.isFerry ? "#0EA5E9" : "#FF5722");

    const lineOptions = {
      color: routeColor,
      weight: 5,
      opacity: 0.7,
      dashArray: route.isFerry ? "10, 10" : undefined,
    };

    const fallbackPoints = [
      L.latLng(route.start.lat, route.start.lng),
      ...(route.waypoints || []).map((wp) => L.latLng(wp.lat, wp.lng)),
      L.latLng(route.end.lat, route.end.lng),
    ];

    // Ferry legs: keep straight dashed line — no road geometry exists across water
    if (route.isFerry) {
      routeLayerRef.current?.addLayer(L.polyline(fallbackPoints, lineOptions));
      return;
    }

    // Fetch actual road geometry from OSRM
    const geometry = await fetchRoadGeometry(route.start, route.end, route.waypoints || []);

    // Guard: map may have been unmounted while fetch was in-flight
    if (!routeLayerRef.current) return;

    if (geometry && geometry.length >= 2) {
      const points = geometry.map(c => L.latLng(c.lat, c.lng));
      routeLayerRef.current.addLayer(L.polyline(points, lineOptions));
    } else {
      // OSRM unavailable or no route found — fall back to straight line
      routeLayerRef.current.addLayer(L.polyline(fallbackPoints, lineOptions));
    }
  }, []);

  const addMarker = React.useCallback(
    (
      position: Coordinates,
      markerOptions: any = {},
      popupContent?: string
    ) => {
      if (!mapRef.current || !markersLayerRef.current) return;

      const marker = L.marker([position.lat, position.lng], markerOptions);
      if (popupContent) marker.bindPopup(popupContent);
      markersLayerRef.current.addLayer(marker);
      return marker;
    },
    []
  );

  const addPointOfInterest = React.useCallback((poi: PointOfInterest) => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const poiIcon = L.divIcon({
      className: "poi-marker",
      html: `<div style="width:24px;height:24px;background:#EF4444;border-radius:50%;display:flex;align-items:center;justify-content:center;">
              <svg xmlns="http://www.w3.org/2000/svg" style="width:14px;height:14px;fill:white;" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    const stars = Array(5)
      .fill(0)
      .map(
        (_, i) =>
          `<svg xmlns="http://www.w3.org/2000/svg" style="width:14px;height:14px;display:inline;fill:${i < poi.rating ? "#facc15" : "#475569"}" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>`
      )
      .join("");

    const popupContent = `
      <div style="min-width:160px;font-family:sans-serif">
        <strong style="color:#f1f5f9;font-size:13px">${poi.name}</strong>
        <p style="margin:4px 0;font-size:12px;color:#94a3b8">${poi.description}</p>
        <div style="display:flex;align-items:center;gap:2px;margin-top:4px">
          ${stars}
          <span style="font-size:11px;margin-left:4px;color:#64748b">(${poi.reviews} reviews)</span>
        </div>
      </div>
    `;

    L.marker([poi.coordinates.lat, poi.coordinates.lng], { icon: poiIcon })
      .bindPopup(popupContent)
      .addTo(markersLayerRef.current);
  }, []);

  const fitBounds = React.useCallback(
    (bounds: any) => {
      mapRef.current?.fitBounds(bounds);
    },
    []
  );

  const clearWeatherMarkers = React.useCallback(() => {
    weatherLayerRef.current?.clearLayers();
  }, []);

  const addWeatherMarker = React.useCallback(
    (name: string, lat: number, lng: number, weatherData: any) => {
      if (!mapRef.current || !weatherLayerRef.current) return;

      const code = weatherData.current.weathercode;
      const emoji =
        code === 0 ? "☀️" :
        code <= 2  ? "🌤️" :
        code === 3 ? "☁️" :
        code <= 48 ? "🌫️" :
        code <= 57 ? "🌦️" :
        code <= 67 ? "🌧️" :
        code <= 77 ? "❄️" :
        code <= 82 ? "🌦️" :
        code <= 86 ? "🌨️" : "⛈️";

      const temp = weatherData.current.temperature;
      const wind = weatherData.current.windspeed;
      const condition = weatherData.current.condition;

      const icon = L.divIcon({
        className: "",
        html: `<div style="background:none;border:none;padding:0;transform:translate(12px,-44px)"><div style="background:white;border:2px solid #93C5FD;border-radius:20px;padding:5px 10px;font-size:14px;font-weight:600;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,0.22);font-family:sans-serif;color:#1e3a5f;line-height:1.3;">${emoji} ${temp}°C</div></div>`,
        iconAnchor: [0, 0],
        iconSize: [1, 1],
      });

      const popup = `
        <div style="min-width:150px;font-family:sans-serif">
          <div style="font-weight:600;margin-bottom:4px">${name}</div>
          <div style="font-size:14px">${emoji} ${temp}°C · ${condition}</div>
          <div style="font-size:11px;color:#666;margin-top:3px">Wind: ${wind} km/h</div>
        </div>`;

      L.marker([lat, lng], { icon }).bindPopup(popup).addTo(weatherLayerRef.current);
    },
    []
  );

  return {
    map: mapRef.current,
    mapLoaded,
    addRoute,
    addMarker,
    addPointOfInterest,
    clearRoutes,
    clearMarkers,
    fitBounds,
    addWeatherMarker,
    clearWeatherMarkers,
  };
}
