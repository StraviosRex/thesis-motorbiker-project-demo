import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SavedRoute, formatDate } from "@/lib/utils";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export function SavedRoutes() {
  const [, setLocation] = useLocation();
  
  const { data: savedRoutes, isLoading, error } = useQuery<SavedRoute[]>({
    queryKey: ['/api/routes/saved'],
  });

  if (isLoading) {
    return (
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Saved Routes</h3>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-light-bg p-3 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-48 mb-2" />
                </div>
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="flex justify-between mt-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Saved Routes</h3>
        <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
          Failed to load saved routes. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium text-gray-700 mb-2">Saved Routes</h3>
      <div className="space-y-2">
        {savedRoutes && savedRoutes.length > 0 ? (
          savedRoutes.map((route) => (
            <div 
              key={route.id} 
              className="bg-light-bg p-3 rounded-md hover:bg-blue-100 cursor-pointer transition duration-150"
              onClick={() => setLocation(`/routes/${route.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm">{route.name}</h4>
                  <p className="text-xs text-gray-500">{route.description}</p>
                </div>
                <div className="text-gray-400">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-gray-500">{route.distance.toLocaleString()} km • {Math.ceil(parseInt(route.duration) / 60 / 24)} days</span>
                <span className="text-primary">{formatDate(route.dates.start)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-light-bg p-4 rounded-md text-center text-gray-500 text-sm">
            <p>No saved routes yet</p>
            <p className="mt-1 text-xs">Your saved routes will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
