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

interface POI {
  id: string;
  name: string;
  type: 'restaurant' | 'gas_station' | 'hotel' | 'attraction' | 'hospital';
  coordinates: { lat: number; lng: number };
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

export function MapArea({ routeId, onToggleSidebar, onToggleRoutePanel, showLegend = true }: MapAreaProps) {
  const [mapStyle, setMapStyle] = useState<MapStyle>("roads");
  const [showPOIs, setShowPOIs] = useState(false);
  const [poiFilters, setPOIFilters] = useState({
    restaurant: true,
    gas_station: true,
    hotel: true,
    attraction: true,
  });
  const { map, mapLoaded, addRoute, addMarker, addPointOfInterest, clearRoutes, clearMarkers, fitBounds } = useMap("map-container");
  
  // Check for dynamic route in sessionStorage
  const [dynamicRoute, setDynamicRoute] = useState<SavedRoute | null>(null);
  
  useEffect(() => {
    // Listen for dynamic route calculation events (no sessionStorage to avoid security errors)
    const handleDynamicRoute = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('[MapArea] Received dynamicRouteCalculated event:', customEvent.detail);
      if (customEvent.detail) {
        console.log('[MapArea] Setting dynamic route:', customEvent.detail.name);
        setDynamicRoute(customEvent.detail);
      }
    };
    
    window.addEventListener('dynamicRouteCalculated', handleDynamicRoute);
    console.log('[MapArea] Event listener registered for dynamicRouteCalculated');
    return () => window.removeEventListener('dynamicRouteCalculated', handleDynamicRoute);
  }, []);
  
  const { data: fetchedRouteData } = useQuery<SavedRoute>({
    queryKey: [`/api/routes/${routeId}`],
    enabled: routeId !== undefined && routeId > 0,
  });
  
  // Clear dynamic route when a saved route is selected
  useEffect(() => {
    if (routeId && routeId > 0) {
      setDynamicRoute(null);
      sessionStorage.removeItem('dynamicRoute');
    }
  }, [routeId]);
  
  // Use dynamic route only if no saved route is selected
  const routeData = (routeId && routeId > 0) ? fetchedRouteData : (dynamicRoute || fetchedRouteData);

  // Fetch POIs for the route (works for both saved and dynamic routes)
  const { data: pois, isLoading: poisLoading } = useQuery<POI[]>({
    queryKey: [`/api/routes/${routeId}/pois`],
    enabled: showPOIs && routeId !== undefined && routeId > 0,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  console.log('[MapArea] Route data state:', { 
    routeId, 
    hasDynamicRoute: !!dynamicRoute, 
    hasFetchedRoute: !!fetchedRouteData,
    finalRouteData: !!routeData,
    routeName: routeData?.name,
    poisCount: pois?.length
  });

  // Render the route when the data is loaded
  useEffect(() => {
    console.log('[MapArea] Render useEffect triggered', { 
      mapLoaded, 
      hasRouteData: !!routeData, 
      routeId,
      routeName: routeData?.name,
      segmentCount: routeData?.segments?.length
    });
    
    if (mapLoaded && routeData) {
      console.log('[MapArea] Rendering route:', routeData.name, 'with', routeData.segments?.length, 'segments');
      
      // Clear previous routes and markers
      clearRoutes();
      clearMarkers();
      
      // Add markers for start and end locations
      addMarker(routeData.startLocation.coordinates, {}, `<b>Start:</b> ${routeData.startLocation.name}`);
      addMarker(routeData.endLocation.coordinates, {}, `<b>End:</b> ${routeData.endLocation.name}`);
      
      // Add route segments
      routeData.segments.forEach((segment: RouteSegment, index: number) => {
        console.log(`[MapArea] Adding segment ${index + 1}:`, segment.title, {
          start: segment.startLocation.coordinates,
          end: segment.endLocation.coordinates,
          waypointCount: segment.waypoints?.length || 0
        });
        
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
      
      console.log('[MapArea] Fitting bounds with', bounds.length, 'points');
      fitBounds(bounds as any);
    }
  }, [mapLoaded, routeData, addRoute, addMarker, addPointOfInterest, clearRoutes, clearMarkers, fitBounds, routeId]);

  // Render POIs when enabled, clear when disabled
  useEffect(() => {
    if (!mapLoaded) return;

    // Clear all markers first
    clearMarkers();

    if (pois && showPOIs) {
      console.log('[MapArea] Rendering', pois.length, 'POIs');
      
      // Filter POIs based on active filters
      const filteredPOIs = pois.filter(poi => poiFilters[poi.type as keyof typeof poiFilters]);
      
      // Add POI markers
      filteredPOIs.forEach(poi => {
        const icon = getPOIIcon(poi.type);
        const popupContent = buildPOIPopup(poi, icon);
        addMarker(poi.coordinates, { color: getPOIColor(poi.type) }, popupContent);
      });
      
      console.log('[MapArea] Rendered', filteredPOIs.length, 'filtered POIs');
    } else {
      console.log('[MapArea] POIs hidden, markers cleared');
    }

    // Re-add route markers if route exists
    if (routeData) {
      addMarker(routeData.startLocation.coordinates, { color: "green" }, `<b>Start:</b> ${routeData.startLocation.name}`);
      addMarker(routeData.endLocation.coordinates, { color: "red" }, `<b>End:</b> ${routeData.endLocation.name}`);
    }
  }, [mapLoaded, pois, showPOIs, poiFilters, addMarker, clearMarkers, routeData]);

  // Handle map style change
  useEffect(() => {
    if (map) {
      // In a real implementation, we would change the tile layer here
      console.log(`Changed map style to: ${mapStyle}`);
    }
  }, [map, mapStyle]);

  const getPOIIcon = (type: string): string => {
    const icons: Record<string, string> = {
      restaurant: '🍴',
      gas_station: '⛽',
      hotel: '🏨',
      attraction: '🏛️',
      hospital: '🏥',
    };
    return icons[type] || '📍';
  };

  const getPOIColor = (type: string): string => {
    const colors: Record<string, string> = {
      restaurant: '#FF6B6B',
      gas_station: '#4ECDC4',
      hotel: '#45B7D1',
      attraction: '#FFA07A',
      hospital: '#FF4757',
    };
    return colors[type] || '#95A5A6';
  };

  const buildPOIPopup = (poi: POI, icon: string): string => {
    const details = poi.details || {};
    let popup = `<div style="min-width: 200px;">`;
    popup += `<h3 style="margin: 0 0 8px 0; font-size: 16px;">${icon} ${poi.name}</h3>`;
    
    // Type badge
    popup += `<span style="background: ${getPOIColor(poi.type)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">${poi.type.replace('_', ' ')}</span>`;
    
    // Details
    if (details.brand) {
      popup += `<p style="margin: 8px 0 4px 0; font-weight: bold;">🏷️ ${details.brand}</p>`;
    }
    if (details.cuisine) {
      popup += `<p style="margin: 4px 0;">🍽️ ${details.cuisine}</p>`;
    }
    if (details.stars) {
      popup += `<p style="margin: 4px 0;">⭐ ${details.stars} stars</p>`;
    }
    if (details.address) {
      popup += `<p style="margin: 4px 0; font-size: 12px; color: #666;">📍 ${details.address}</p>`;
    }
    if (details.phone) {
      popup += `<p style="margin: 4px 0; font-size: 12px;">📞 <a href="tel:${details.phone}">${details.phone}</a></p>`;
    }
    if (details.website) {
      popup += `<p style="margin: 4px 0; font-size: 12px;">🌐 <a href="${details.website}" target="_blank">Website</a></p>`;
    }
    if (details.opening_hours) {
      popup += `<p style="margin: 4px 0; font-size: 11px; color: #666;">🕐 ${details.opening_hours}</p>`;
    }
    
    popup += `</div>`;
    return popup;
  };
  
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
          {routeId && routeId > 0 && (
            <div className="flex items-center space-x-2">
              <Toggle
                pressed={showPOIs}
                onPressedChange={setShowPOIs}
                className={`px-3 py-1 text-sm font-medium ${showPOIs ? "text-primary bg-light-bg" : "text-gray-600"} rounded-md hover:bg-gray-100 transition-colors`}
                disabled={poisLoading}
              >
                {poisLoading ? '⏳' : '📍'} Show POIs {pois && showPOIs && `(${pois.length})`}
              </Toggle>
              {showPOIs && (
                <div className="flex space-x-1 ml-2">
                  <Toggle
                    pressed={poiFilters.restaurant}
                    onPressedChange={() => setPOIFilters(prev => ({ ...prev, restaurant: !prev.restaurant }))}
                    className={`px-2 py-1 text-xs ${poiFilters.restaurant ? "bg-red-100" : "bg-gray-100"}`}
                    title="Restaurants"
                  >
                    🍴
                  </Toggle>
                  <Toggle
                    pressed={poiFilters.gas_station}
                    onPressedChange={() => setPOIFilters(prev => ({ ...prev, gas_station: !prev.gas_station }))}
                    className={`px-2 py-1 text-xs ${poiFilters.gas_station ? "bg-teal-100" : "bg-gray-100"}`}
                    title="Gas Stations"
                  >
                    ⛽
                  </Toggle>
                  <Toggle
                    pressed={poiFilters.hotel}
                    onPressedChange={() => setPOIFilters(prev => ({ ...prev, hotel: !prev.hotel }))}
                    className={`px-2 py-1 text-xs ${poiFilters.hotel ? "bg-blue-100" : "bg-gray-100"}`}
                    title="Hotels"
                  >
                    🏨
                  </Toggle>
                  <Toggle
                    pressed={poiFilters.attraction}
                    onPressedChange={() => setPOIFilters(prev => ({ ...prev, attraction: !prev.attraction }))}
                    className={`px-2 py-1 text-xs ${poiFilters.attraction ? "bg-orange-100" : "bg-gray-100"}`}
                    title="Attractions"
                  >
                    🏛️
                  </Toggle>
                </div>
              )}
            </div>
          )}
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
