import { useState } from "react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SavedRoutes } from "./SavedRoutes";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { BikeClass, BIKE_CLASSES } from "@/lib/utils";

interface RoutePlannerProps {
  onCalculateRoute: () => void;
  onToggleSidebar?: () => void;
  bikeClass?: BikeClass | null;
  onBikeClassChange?: (cls: BikeClass | null) => void;
  startLocation?: string;
  endLocation?: string;
  onStartChange?: (v: string) => void;
  onEndChange?: (v: string) => void;
  startDate?: string;
  endDate?: string;
  onCalculatingChange?: (v: boolean) => void;
  className?: string;
}

export function RoutePlanner({
  onCalculateRoute, onToggleSidebar, bikeClass, onBikeClassChange,
  startLocation = "", endLocation = "",
  onStartChange, onEndChange, startDate = "", endDate = "", onCalculatingChange,
  className
}: RoutePlannerProps) {
  const [, setLocation] = useLocation();
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [preferences, setPreferences] = useState({
    scenicRoutes: false,
    avoidHighways: true,
    includeFerries: true
  });

  const calculateRouteMutation = useMutation({
    mutationFn: async () => {
      if (!startLocation || !endLocation) {
        throw new Error("Start and destination locations are required");
      }
      sessionStorage.removeItem('dynamicRoute');
      return await apiRequest("POST", "/api/routes/calculate", {
        startLocation,
        endLocation,
        waypoints,
        preferences,
        bikeClass: bikeClass ?? null,
        dates: { start: startDate, end: endDate }
      });
    },
    onMutate: () => { onCalculatingChange?.(true); },
    onSettled: () => { onCalculatingChange?.(false); },
    onSuccess: async (res) => {
      const routeData = await res.json();
      if (routeData?.id === 0) {
        setLocation('/');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('dynamicRouteCalculated', { detail: routeData }));
        }, 100);
      } else if (routeData?.id && routeData.id > 0) {
        setLocation(`/routes/${routeData.id}`);
      }
      if (onToggleSidebar && window.innerWidth < 768) onToggleSidebar();
      onCalculateRoute();
      toast({ title: "Route calculated", description: `From ${startLocation} to ${endLocation}` });
    },
    onError: (error) => {
      console.error("Failed to calculate route:", error);
      toast({ title: "Failed to calculate route", description: error.message, variant: "destructive" });
    }
  });

  // Allow the header "Go" button to trigger the same mutation
  React.useEffect(() => {
    const handler = () => calculateRouteMutation.mutate();
    window.addEventListener('headerCalculateRoute', handler);
    return () => window.removeEventListener('headerCalculateRoute', handler);
  }, [startLocation, endLocation, waypoints, preferences, bikeClass, startDate, endDate]);

  const handleAddWaypoint = () => setWaypoints([...waypoints, ""]);
  const updateWaypoint = (index: number, value: string) => {
    const w = [...waypoints];
    w[index] = value;
    setWaypoints(w);
  };
  const handlePreferenceChange = (key: keyof typeof preferences, checked: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: checked }));
  };

  return (
    <div
      id="sidebar"
      className={`app-panel flex flex-col w-full sm:w-72 md:w-64 h-full border-r shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-950 to-slate-900 shrink-0">
        <h2 className="font-montserrat font-black text-white tracking-tight">Route Planner</h2>
        {onToggleSidebar && (
          <button
            id="close-sidebar"
            className="md:hidden p-1.5 rounded-full hover:bg-slate-700 transition"
            onClick={onToggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar px-4 py-4 space-y-4">
        <form
          onSubmit={(e) => { e.preventDefault(); calculateRouteMutation.mutate(); }}
          className="space-y-3"
        >
          {/* Route endpoints (shown on mobile since header inputs are hidden) */}
          <div className="md:hidden space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Start Point
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter starting location"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 pr-8 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-9"
                  value={startLocation}
                  onChange={(e) => onStartChange?.(e.target.value)}
                  required
                />
                <div className="absolute right-2.5 top-2 text-slate-500 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Destination
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter destination"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 pr-8 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-9"
                  value={endLocation}
                  onChange={(e) => onEndChange?.(e.target.value)}
                  required
                />
                <div className="absolute right-2.5 top-2 text-slate-500 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Waypoints */}
          {waypoints.map((waypoint, index) => (
            <div key={index}>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Waypoint {index + 1}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter waypoint location"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 pr-8 focus-visible:ring-orange-500 h-9"
                  value={waypoint}
                  onChange={(e) => updateWaypoint(index, e.target.value)}
                />
                <div className="absolute right-2.5 top-2 text-slate-500 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 text-sm font-medium transition"
            onClick={handleAddWaypoint}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Waypoint
          </button>

          {/* Bike class selector */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Your Bike</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {BIKE_CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  title={`${cls.name}\n${cls.exampleBikes}`}
                  onClick={() => onBikeClassChange?.(bikeClass === cls.id ? null : cls.id)}
                  className={`inline-flex items-center gap-2.5 text-xs font-semibold rounded-lg px-3 py-2 h-11 transition border
                    ${bikeClass === cls.id
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-orange-500/60 hover:text-orange-400'
                    }`}
                >
                  <img src={cls.icon} alt={cls.name} className="w-7 h-7 object-contain shrink-0" />
                  <span className="leading-tight">{cls.shortName}</span>
                </button>
              ))}
            </div>
            {bikeClass && (
              <p className="mt-2 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-md p-2 leading-snug">
                {BIKE_CLASSES.find(c => c.id === bikeClass)?.routeHint}
              </p>
            )}
          </div>

          {/* Route preferences */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Preferences</h3>
            <div className="space-y-2.5">
              {[
                { id: 'scenic-routes', key: 'scenicRoutes' as const, label: 'Prefer scenic routes' },
                { id: 'avoid-highways', key: 'avoidHighways' as const, label: 'Avoid highways' },
                { id: 'include-ferries', key: 'includeFerries' as const, label: 'Include ferry crossings' },
              ].map(({ id, key, label }) => (
                <div key={id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={id}
                    checked={preferences[key]}
                    onCheckedChange={(checked) => handlePreferenceChange(key, checked as boolean)}
                    className="border-slate-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <label htmlFor={id} className="text-sm text-slate-300 cursor-pointer select-none leading-none">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

        </form>

        {/* Saved routes */}
        <div className="border-t border-slate-700 pt-4">
          <SavedRoutes />
        </div>
      </div>
    </div>
  );
}
