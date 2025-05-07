import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useMap } from "@/hooks/use-map";
import { MapLegend } from "./MapLegend";
import { useQuery } from "@tanstack/react-query";
import { SavedRoute, RouteSegment, PointOfInterest } from "@/lib/utils";

interface MapAreaProps {
  routeId?: number;
  onToggleSidebar: () => void;
  onToggleRoutePanel?: () => void;
  showLegend?: boolean;
}

type MapStyle = "roads" | "satellite" | "terrain";

export function MapArea({ routeId, onToggleSidebar, onToggleRoutePanel, showLegend = true }: MapAreaProps) {
  const [mapStyle, setMapStyle] = useState<MapStyle>("roads");
  const { map, mapLoaded, addRoute, addMarker, addPointOfInterest, clearRoutes, clearMarkers, fitBounds } = useMap("map-container");
  
  const { data: routeData } = useQuery<SavedRoute>({
    queryKey: ['/api/routes', routeId],
    enabled: !!routeId,
  });

  // Render the route when the data is loaded
  useEffect(() => {
    if (mapLoaded && routeData) {
      // Clear previous routes and markers
      clearRoutes();
      clearMarkers();
      
      // Add markers for start and end locations
      addMarker(routeData.startLocation.coordinates, {}, `<b>Start:</b> ${routeData.startLocation.name}`);
      addMarker(routeData.endLocation.coordinates, {}, `<b>End:</b> ${routeData.endLocation.name}`);
      
      // Add route segments
      routeData.segments.forEach((segment: RouteSegment) => {
        addRoute({
          start: segment.startLocation.coordinates,
          end: segment.endLocation.coordinates,
          waypoints: segment.waypoints.map(wp => wp.coordinates),
          isScenic: segment.isScenic,
        });
      });
      
      // Add points of interest
      routeData.pointsOfInterest.forEach((poi: PointOfInterest) => {
        addPointOfInterest(poi);
      });
      
      // Fit the map to include all route points
      const bounds = [
        [routeData.startLocation.coordinates.lat, routeData.startLocation.coordinates.lng],
        [routeData.endLocation.coordinates.lat, routeData.endLocation.coordinates.lng],
        ...routeData.segments.flatMap(segment => 
          segment.waypoints.map(wp => [wp.coordinates.lat, wp.coordinates.lng])
        )
      ];
      
      fitBounds(bounds as any);
    }
  }, [mapLoaded, routeData, addRoute, addMarker, addPointOfInterest, clearRoutes, clearMarkers, fitBounds]);

  // Handle map style change
  useEffect(() => {
    if (map) {
      // In a real implementation, we would change the tile layer here
      console.log(`Changed map style to: ${mapStyle}`);
    }
  }, [map, mapStyle]);
  
  return (
    <div className="flex-1 flex flex-col">
      {/* Map controls */}
      <div className="bg-white p-2 shadow-sm flex items-center justify-between z-10">
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-2 rounded-md hover:bg-gray-100 transition-colors" 
            title="Toggle sidebar"
            onClick={onToggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </Button>
          <div className="hidden md:flex space-x-1">
            <Toggle 
              pressed={mapStyle === "roads"} 
              onPressedChange={() => setMapStyle("roads")}
              className={`px-3 py-1 text-sm font-medium ${mapStyle === "roads" ? "text-primary bg-light-bg" : "text-gray-600"} rounded-md hover:bg-blue-200 transition-colors`}
            >
              Roads
            </Toggle>
            <Toggle 
              pressed={mapStyle === "satellite"} 
              onPressedChange={() => setMapStyle("satellite")}
              className={`px-3 py-1 text-sm font-medium ${mapStyle === "satellite" ? "text-primary bg-light-bg" : "text-gray-600"} rounded-md hover:bg-gray-100 transition-colors`}
            >
              Satellite
            </Toggle>
            <Toggle 
              pressed={mapStyle === "terrain"} 
              onPressedChange={() => setMapStyle("terrain")}
              className={`px-3 py-1 text-sm font-medium ${mapStyle === "terrain" ? "text-primary bg-light-bg" : "text-gray-600"} rounded-md hover:bg-gray-100 transition-colors`}
            >
              Terrain
            </Toggle>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="bg-white rounded-md shadow">
            <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 transition-colors rounded-l-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 transition-colors rounded-r-md border-l border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* The actual map */}
      <div className="flex-1 relative">
        <div id="map-container" className="absolute inset-0 bg-gray-100 z-0"></div>
        
        {/* Map overlay elements */}
        {showLegend && <MapLegend className="absolute bottom-10 left-4 z-20" />}

        {/* Map attribution */}
        <div className="absolute bottom-2 right-2 z-20 text-xs text-black bg-white bg-opacity-70 px-2 py-1 rounded">
          Map data &copy; OpenStreetMap contributors
        </div>
        
        {routeData && onToggleRoutePanel && (
          <Button 
            onClick={onToggleRoutePanel}
            className="absolute top-14 right-2 z-20 md:hidden bg-primary text-white"
            size="sm"
          >
            Route Details
          </Button>
        )}
      </div>
    </div>
  );
}
