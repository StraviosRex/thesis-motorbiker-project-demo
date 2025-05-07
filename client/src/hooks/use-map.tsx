import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { Coordinates, RouteSegment, PointOfInterest } from "@/lib/utils";

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
  const [map, setMap] = React.useState<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const routeLayerRef = React.useRef<L.LayerGroup | null>(null);
  const markersLayerRef = React.useRef<L.LayerGroup | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined" && !map) {
      const mapInstance = L.map(containerId, {
        center: options.center || [49.0, 10.0], // Central Europe
        zoom: options.zoom || 5,
      });

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      // Create layers for routes and markers
      routeLayerRef.current = L.layerGroup().addTo(mapInstance);
      markersLayerRef.current = L.layerGroup().addTo(mapInstance);

      setMap(mapInstance);
      setMapLoaded(true);

      return () => {
        mapInstance.remove();
      };
    }
  }, [containerId, options.center, options.zoom, map]);

  const clearRoutes = React.useCallback(() => {
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    }
  }, []);

  const clearMarkers = React.useCallback(() => {
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
  }, []);

  const addRoute = React.useCallback(
    (route: MapRoute) => {
      if (!map || !routeLayerRef.current) return;

      const waypoints = [
        L.latLng(route.start.lat, route.start.lng),
        ...(route.waypoints || []).map((wp) => L.latLng(wp.lat, wp.lng)),
        L.latLng(route.end.lat, route.end.lng),
      ];

      const routeColor = route.color || (route.isScenic ? "#22C55E" : route.isFerry ? "#0EA5E9" : "#FF5722");
      
      // Different line style for ferry routes
      const lineOptions = {
        color: routeColor,
        weight: 5,
        opacity: 0.7,
        dashArray: route.isFerry ? "10, 10" : null,
      };

      if (waypoints.length >= 2) {
        // Simple polyline for now
        const polyline = L.polyline(waypoints, lineOptions);
        routeLayerRef.current.addLayer(polyline);
      }
    },
    [map]
  );

  const addMarker = React.useCallback(
    (position: Coordinates, options: L.MarkerOptions = {}, popupContent?: string) => {
      if (!map || !markersLayerRef.current) return;

      const marker = L.marker([position.lat, position.lng], options);
      
      if (popupContent) {
        marker.bindPopup(popupContent);
      }
      
      markersLayerRef.current.addLayer(marker);
      return marker;
    },
    [map]
  );

  const addPointOfInterest = React.useCallback(
    (poi: PointOfInterest) => {
      if (!map || !markersLayerRef.current) return;

      const poiIcon = L.divIcon({
        className: 'poi-marker',
        html: `<div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
              </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      const popupContent = `
        <div class="poi-popup">
          <h3 class="font-bold">${poi.name}</h3>
          <p>${poi.description}</p>
          <div class="flex mt-1">
            ${Array(5).fill(0).map((_, i) => 
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ${i < poi.rating ? 'text-yellow-500' : 'text-gray-300'}" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>`
            ).join('')}
            <span class="ml-1 text-xs">(${poi.reviews} reviews)</span>
          </div>
        </div>
      `;

      const marker = L.marker([poi.coordinates.lat, poi.coordinates.lng], { icon: poiIcon })
        .bindPopup(popupContent);
      
      markersLayerRef.current.addLayer(marker);
      return marker;
    },
    [map]
  );

  const fitBounds = React.useCallback(
    (bounds: L.LatLngBoundsExpression) => {
      if (map) {
        map.fitBounds(bounds);
      }
    },
    [map]
  );

  return {
    map,
    mapLoaded,
    addRoute,
    addMarker,
    addPointOfInterest,
    clearRoutes,
    clearMarkers,
    fitBounds,
  };
}
