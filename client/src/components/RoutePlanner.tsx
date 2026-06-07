import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SavedRoutes } from "./SavedRoutes";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface RoutePlannerProps {
  onCalculateRoute: () => void;
  onToggleSidebar?: () => void;
  className?: string;
}

export function RoutePlanner({ onCalculateRoute, onToggleSidebar, className }: RoutePlannerProps) {
  const [, setLocation] = useLocation();
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
      
      // Clear any previous dynamic route
      sessionStorage.removeItem('dynamicRoute');
      
      return await apiRequest("POST", "/api/routes/calculate", {
        startLocation,
        endLocation,
        waypoints,
        preferences,
        dates: {
          start: startDate,
          end: endDate
        }
      });
    },
    onSuccess: async (res) => {
      const routeData = await res.json();
      console.log("Route calculated:", routeData);

      // Store route data for dynamic routes
      if (routeData?.id === 0) {
        console.log('[RoutePlanner] Dynamic route calculated, dispatching event');
        // Navigate to home to clear any existing routeId
        setLocation('/');
        // Trigger a custom event to notify MapArea (don't use sessionStorage)
        setTimeout(() => {
          const event = new CustomEvent('dynamicRouteCalculated', { detail: routeData });
          window.dispatchEvent(event);
          console.log('[RoutePlanner] Event dispatched:', event);
        }, 100);
      } else if (routeData?.id && routeData.id > 0) {
        // Navigate to curated route
        console.log('[RoutePlanner] Curated route found, navigating to:', routeData.id);
        setLocation(`/routes/${routeData.id}`);
      }
      
      // Close the sidebar on mobile
      if (onToggleSidebar && window.innerWidth < 768) {
        onToggleSidebar();
      }
      
      // Proceed with route calculation
      onCalculateRoute();
      
      toast({
        title: "Route calculated",
        description: `From ${startLocation} to ${endLocation}`,
      });
    },
    onError: (error) => {
      console.error("Failed to calculate route:", error);
      toast({
        title: "Failed to calculate route",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddWaypoint = () => {
    setWaypoints([...waypoints, ""]);
  };

  const updateWaypoint = (index: number, value: string) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    setWaypoints(newWaypoints);
  };

  const handleCalculateRoute = () => {
    calculateRouteMutation.mutate();
  };

  const handlePreferenceChange = (key: keyof typeof preferences, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  return (
    <div id="sidebar" className={`bg-white w-64 h-full shadow-lg ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-montserrat font-semibold text-primary text-lg">Route Planner</h2>
          {onToggleSidebar && (
            <button 
              id="close-sidebar" 
              className="md:hidden p-1 rounded-full hover:bg-gray-200"
              onClick={onToggleSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 custom-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem - 65px)' }}>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCalculateRoute();
        }}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Point</label>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Enter starting location" 
                className="pr-8" 
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                required
              />
              <div className="absolute right-2 top-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Enter destination" 
                className="pr-8" 
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                required
              />
              <div className="absolute right-2 top-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {waypoints.map((waypoint, index) => (
            <div className="mb-4" key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waypoint {index + 1}</label>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Enter waypoint location" 
                  className="pr-8" 
                  value={waypoint}
                  onChange={(e) => updateWaypoint(index, e.target.value)}
                />
                <div className="absolute right-2 top-2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mb-4">
            <button 
              type="button" 
              id="add-waypoint" 
              className="flex items-center text-primary text-sm font-medium"
              onClick={handleAddWaypoint}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Waypoint
            </button>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Route Preferences</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox 
                  id="scenic-routes" 
                  checked={preferences.scenicRoutes}
                  onCheckedChange={(checked) => handlePreferenceChange('scenicRoutes', checked as boolean)}
                  className="h-4 w-4 text-accent rounded"
                />
                <label htmlFor="scenic-routes" className="ml-2 text-sm text-gray-700">Prefer scenic routes</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="avoid-highways" 
                  checked={preferences.avoidHighways}
                  onCheckedChange={(checked) => handlePreferenceChange('avoidHighways', checked as boolean)}
                  className="h-4 w-4 text-accent rounded"
                />
                <label htmlFor="avoid-highways" className="ml-2 text-sm text-gray-700">Avoid highways</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="include-ferries" 
                  checked={preferences.includeFerries}
                  onCheckedChange={(checked) => handlePreferenceChange('includeFerries', checked as boolean)}
                  className="h-4 w-4 text-accent rounded"
                />
                <label htmlFor="include-ferries" className="ml-2 text-sm text-gray-700">Include ferry crossings</label>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Trip Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <Input 
                  type="date" 
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <Input 
                  type="date" 
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent-light text-white font-medium py-2 px-4 rounded-md transition duration-150 flex items-center justify-center"
            disabled={calculateRouteMutation.isPending}
          >
            {calculateRouteMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Calculate Route
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6">
          <SavedRoutes />
        </div>
      </div>
    </div>
  );
}
