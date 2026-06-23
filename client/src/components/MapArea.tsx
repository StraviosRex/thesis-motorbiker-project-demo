import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useMap } from "@/hooks/use-map";
import { MapLegend } from "./MapLegend";
import { useQuery } from "@tanstack/react-query";
import { SavedRoute, RouteSegment, PointOfInterest, BikeClass, BIKE_CLASSES } from "@/lib/utils";

interface MapAreaProps {
  routeId?: number;
  onToggleSidebar: () => void;
  onToggleRoutePanel?: () => void;
  showLegend?: boolean;
  bikeClass?: BikeClass | null;
  onBikeClassChange?: (cls: BikeClass | null) => void;
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

export function MapArea({ routeId, onToggleSidebar, onToggleRoutePanel, showLegend = true, bikeClass, onBikeClassChange }: MapAreaProps) {
  const [mapStyle, setMapStyle] = useState<MapStyle>("roads");
  const [showPOIs, setShowPOIs] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showBikeMenu, setShowBikeMenu] = useState(false);

  const selectedBike = bikeClass ? BIKE_CLASSES.find(c => c.id === bikeClass) : null;
  const [poiFilters, setPOIFilters] = useState({
    restaurant: true,
    gas_station: true,
    hotel: true,
    attraction: true,
    motorcycle_repair: true,
    motorcycle_parking: true,
    hospital: true,
  });
  const { mapLoaded, addRoute, addMarker, addPointOfInterest, clearRoutes, clearMarkers, fitBounds, addWeatherMarker, clearWeatherMarkers, setBaseMap } = useMap("map-container");
  
  useEffect(() => {
    if (mapLoaded) {
      setBaseMap(mapStyle);
    }
  }, [mapLoaded, mapStyle, setBaseMap]);
  // Check for dynamic route in sessionStorage
  const [dynamicRoute, setDynamicRoute] = useState<SavedRoute | null>(null);
  
  useEffect(() => {
    // Listen for dynamic route calculation events (no sessionStorage to avoid security errors)
    const handleDynamicRoute = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setDynamicRoute(customEvent.detail);
      }
    };
    
    window.addEventListener('dynamicRouteCalculated', handleDynamicRoute);
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
      routeData.segments.forEach((segment: RouteSegment, index: number) => {
        const isFerry = !!(
          segment.notes?.toLowerCase().includes('ferry') ||
          segment.title?.toLowerCase().includes('ferry')
        );
        addRoute({
          start: segment.startLocation.coordinates,
          end: segment.endLocation.coordinates,
          waypoints: segment.waypoints.map(wp => wp.coordinates),
          geometry: segment.geometry,
          isScenic: segment.isScenic,
          isFerry,
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
          (segment.geometry?.length ? segment.geometry : segment.waypoints.map(wp => wp.coordinates))
            .map(point => [point.lat, point.lng])
        )
      ];
      
      fitBounds(bounds as any);
    }
  }, [mapLoaded, routeData, addRoute, addMarker, addPointOfInterest, clearRoutes, clearMarkers, fitBounds, routeId]);

  // Render POIs when enabled, clear when disabled
  useEffect(() => {
    if (!mapLoaded) return;

    // Clear all markers first
    clearMarkers();

    if (pois && showPOIs) {
      // Filter POIs based on active filters
      const filteredPOIs = pois.filter(poi => poiFilters[poi.type as keyof typeof poiFilters]);
      
      // Add POI markers
      filteredPOIs.forEach(poi => {
        const icon = getPOIIcon(poi.type);
        const popupContent = buildPOIPopup(poi, icon);
        addMarker(poi.coordinates, { color: getPOIColor(poi.type) }, popupContent);
      });
    }

    // Re-add route markers if route exists
    if (routeData) {
      addMarker(routeData.startLocation.coordinates, { color: "green" }, `<b>Start:</b> ${routeData.startLocation.name}`);
      addMarker(routeData.endLocation.coordinates, { color: "red" }, `<b>End:</b> ${routeData.endLocation.name}`);
    }
  }, [mapLoaded, pois, showPOIs, poiFilters, addMarker, clearMarkers, routeData]);

  // Fetch and display weather markers for key route locations
  useEffect(() => {
    if (!mapLoaded) return;
    if (!showWeather || !routeData) {
      clearWeatherMarkers();
      return;
    }

    const locs = [
      routeData.startLocation,
      ...routeData.segments.map((s: RouteSegment) => s.endLocation),
    ].filter((loc, i, arr) =>
      arr.findIndex(l => l.coordinates.lat === loc.coordinates.lat && l.coordinates.lng === loc.coordinates.lng) === i
    );

    setWeatherLoading(true);
    clearWeatherMarkers();

    Promise.all(
      locs.map(async (loc) => {
        try {
          const res = await fetch(`/api/weather?lat=${loc.coordinates.lat}&lng=${loc.coordinates.lng}`);
          if (!res.ok) return null;
          const data = await res.json();
          return { loc, data };
        } catch {
          return null;
        }
      })
    ).then(results => {
      results.forEach(r => {
        if (!r) return;
        addWeatherMarker(r.loc.name, r.loc.coordinates.lat, r.loc.coordinates.lng, r.data);
      });
      setWeatherLoading(false);
    }).catch(() => setWeatherLoading(false));
  }, [showWeather, routeData, mapLoaded, addWeatherMarker, clearWeatherMarkers]);

  const getPOIIcon = (type: string): string => {
    const icons: Record<string, string> = {
      restaurant: '🍴',
      gas_station: '⛽',
      hotel: '🏨',
      attraction: '🏛️',
      hospital: '🏥',
      motorcycle_repair: '🔧',
      motorcycle_parking: '🅿️',
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
      motorcycle_repair: '#E67E22',
      motorcycle_parking: '#2ECC71',
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
      <div className="map-toolbar border-b z-10">
        {/* Main toolbar row */}
        <div className="p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="p-2 rounded-md hover:bg-slate-700 transition-colors shrink-0 text-slate-400 hover:text-white"
              title="Toggle sidebar"
              onClick={onToggleSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </Button>
            {/* Map style toggles — desktop only */}
            <div className="hidden md:flex space-x-1">
              <Toggle
                pressed={mapStyle === "roads"}
                onPressedChange={() => setMapStyle("roads")}
                className={`px-3 py-1 text-sm font-medium ${mapStyle === "roads" ? "text-orange-400 bg-slate-700" : "text-slate-400"} rounded-md hover:bg-slate-700 transition-colors`}
              >
                Roads
              </Toggle>
              <Toggle
                pressed={mapStyle === "satellite"}
                onPressedChange={() => setMapStyle("satellite")}
                className={`px-3 py-1 text-sm font-medium ${mapStyle === "satellite" ? "text-orange-400 bg-slate-700" : "text-slate-400"} rounded-md hover:bg-slate-700 transition-colors`}
              >
                Satellite
              </Toggle>
              <Toggle
                pressed={mapStyle === "terrain"}
                onPressedChange={() => setMapStyle("terrain")}
                className={`px-3 py-1 text-sm font-medium ${mapStyle === "terrain" ? "text-orange-400 bg-slate-700" : "text-slate-400"} rounded-md hover:bg-slate-700 transition-colors`}
              >
                Terrain
              </Toggle>
            </div>

            {/* Weather toggle — always visible */}
            <Toggle
              pressed={showWeather}
              onPressedChange={setShowWeather}
              className={`px-2 md:px-3 py-1 text-sm font-medium ${showWeather ? "text-orange-400 bg-slate-700" : "text-slate-400"} rounded-md hover:bg-slate-700 transition-colors`}
            >
              {weatherLoading ? "⏳" : "🌤️"} <span className="hidden sm:inline">Weather</span>
            </Toggle>

            {/* Bike Class selector — always visible */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBikeMenu(v => !v)}
                className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-9 px-2 rounded-full transition
                  ${selectedBike ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'}`}
                title="Select bike class"
              >
                {selectedBike
                  ? <img src={selectedBike.icon} alt={selectedBike.name} className="w-5 h-5 object-contain" />
                  : <span>🏍️</span>
                }
                <span className="hidden sm:inline">{selectedBike ? selectedBike.shortName : 'Bike'}</span>
                <svg className="w-3 h-3 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showBikeMenu && (
                <div className="absolute left-0 top-full mt-1 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 w-64">
                  <p className="text-xs text-slate-500 px-2 pb-1 font-bold uppercase tracking-widest">Select your bike</p>
                  <div className="grid grid-cols-2 gap-1">
                    {BIKE_CLASSES.map((cls) => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          onBikeClassChange?.(bikeClass === cls.id ? null : cls.id);
                          setShowBikeMenu(false);
                        }}
                        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold h-10 p-2 rounded-lg transition
                          ${bikeClass === cls.id ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'}`}
                        title={cls.exampleBikes}
                      >
                        <img src={cls.icon} alt={cls.name} className="w-6 h-6 object-contain" />
                        <span>{cls.shortName}</span>
                      </button>
                    ))}
                  </div>
                  {selectedBike && (
                    <p className="mt-2 px-2 text-xs text-slate-500 leading-snug">{selectedBike.routeHint}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {routeId && routeId > 0 && (
              <Toggle
                pressed={showPOIs}
                onPressedChange={setShowPOIs}
                className={`px-2 md:px-3 py-1 text-sm font-medium ${showPOIs ? "text-orange-400 bg-slate-700" : "text-slate-400"} rounded-md hover:bg-slate-700 transition-colors`}
                disabled={poisLoading}
              >
                {poisLoading ? '⏳' : '📍'} <span className="hidden sm:inline">POIs</span> {pois && showPOIs && `(${pois.length})`}
              </Toggle>
            )}
            <div className="bg-slate-800 border border-slate-700 rounded-md flex">
              <Button variant="ghost" size="icon" className="p-2 hover:bg-slate-700 transition-colors rounded-l-md text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="p-2 hover:bg-slate-700 transition-colors rounded-r-md border-l border-slate-700 text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* POI filter row — shown below when POIs are active, horizontally scrollable on mobile */}
        {showPOIs && routeId && routeId > 0 && (
          <div className="px-2 pb-2 flex gap-1 overflow-x-auto scrollbar-none border-t border-slate-700/60 pt-1.5">
            {([
              { key: 'restaurant',        label: 'Food',    icon: '🍴', active: 'bg-red-900/40 text-red-300 border-red-700/50'     },
              { key: 'gas_station',       label: 'Fuel',    icon: '⛽', active: 'bg-teal-900/40 text-teal-300 border-teal-700/50'   },
              { key: 'hotel',             label: 'Hotels',  icon: '🏨', active: 'bg-blue-900/40 text-blue-300 border-blue-700/50'   },
              { key: 'attraction',        label: 'Sights',  icon: '🏛️', active: 'bg-amber-900/40 text-amber-300 border-amber-700/50'},
              { key: 'motorcycle_repair', label: 'Repair',  icon: '🔧', active: 'bg-orange-900/40 text-orange-300 border-orange-700/50'},
              { key: 'motorcycle_parking',label: 'Parking', icon: '🅿️', active: 'bg-green-900/40 text-green-300 border-green-700/50'},
            ] as const).map(({ key, label, icon, active }) => (
              <Toggle
                key={key}
                pressed={poiFilters[key]}
                onPressedChange={() => setPOIFilters(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`px-2 py-1 text-xs shrink-0 rounded-md border transition ${
                  poiFilters[key] ? active : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
                title={label}
              >
                <span className="inline-block -translate-x-0.5">{icon}</span>
                <span className="hidden sm:inline ml-1">{label}</span>
              </Toggle>
            ))}
          </div>
        )}
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
            className="absolute top-14 right-2 z-20 md:hidden bg-orange-500 hover:bg-orange-400 text-white font-bold shadow-lg shadow-orange-500/30 tracking-wide"
            size="sm"
          >
            Route Details
          </Button>
        )}
      </div>
    </div>
  );
}
