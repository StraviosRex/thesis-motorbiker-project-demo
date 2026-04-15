import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { Coordinates, PointOfInterest } from "@/lib/utils";

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
  const mapRef = React.useRef<L.Map | null>(null);
  const routeLayerRef = React.useRef<L.LayerGroup | null>(null);
  const markersLayerRef = React.useRef<L.LayerGroup | null>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  React.useEffect(() => {
    if (mapRef.current) return;

    const mapInstance = L.map(containerId, {
      center: options.center || [49.0, 10.0],
      zoom: options.zoom || 5,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    routeLayerRef.current = L.layerGroup().addTo(mapInstance);
    markersLayerRef.current = L.layerGroup().addTo(mapInstance);

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

  const addRoute = React.useCallback((route: MapRoute) => {
    if (!mapRef.current || !routeLayerRef.current) return;

    const waypoints = [
      L.latLng(route.start.lat, route.start.lng),
      ...(route.waypoints || []).map((wp) => L.latLng(wp.lat, wp.lng)),
      L.latLng(route.end.lat, route.end.lng),
    ];

    const routeColor =
      route.color ||
      (route.isScenic ? "#22C55E" : route.isFerry ? "#0EA5E9" : "#FF5722");

    const lineOptions = {
      color: routeColor,
      weight: 5,
      opacity: 0.7,
      dashArray: route.isFerry ? "10, 10" : undefined,
    };

    if (waypoints.length >= 2) {
      const polyline = L.polyline(waypoints, lineOptions);
      routeLayerRef.current.addLayer(polyline);
    }
  }, []);

  const addMarker = React.useCallback(
    (
      position: Coordinates,
      markerOptions: L.MarkerOptions = {},
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
          `<svg xmlns="http://www.w3.org/2000/svg" style="width:14px;height:14px;display:inline;fill:${i < poi.rating ? "#EAB308" : "#D1D5DB"}" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>`
      )
      .join("");

    const popupContent = `
      <div style="min-width:160px">
        <strong>${poi.name}</strong>
        <p style="margin:4px 0;font-size:12px">${poi.description}</p>
        <div style="display:flex;align-items:center;gap:2px;margin-top:4px">
          ${stars}
          <span style="font-size:11px;margin-left:4px">(${poi.reviews} reviews)</span>
        </div>
      </div>
    `;

    L.marker([poi.coordinates.lat, poi.coordinates.lng], { icon: poiIcon })
      .bindPopup(popupContent)
      .addTo(markersLayerRef.current);
  }, []);

  const fitBounds = React.useCallback(
    (bounds: L.LatLngBoundsExpression) => {
      mapRef.current?.fitBounds(bounds);
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
  };
}
