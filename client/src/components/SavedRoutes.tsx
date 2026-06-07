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
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Saved Routes</h3>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1.5 bg-slate-700" />
                  <Skeleton className="h-3 w-40 bg-slate-700" />
                </div>
                <Skeleton className="h-6 w-6 rounded bg-slate-700" />
              </div>
              <div className="flex justify-between mt-2">
                <Skeleton className="h-3 w-20 bg-slate-700" />
                <Skeleton className="h-3 w-14 bg-slate-700" />
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
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Saved Routes</h3>
        <div className="bg-red-900/20 border border-red-700/50 p-3 rounded-lg text-red-400 text-sm">
          Failed to load saved routes.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Saved Routes</h3>
      <div className="space-y-1.5">
        {savedRoutes && savedRoutes.length > 0 ? (
          savedRoutes.map((route) => (
            <div
              key={route.id}
              className="group bg-slate-800 border border-slate-700 p-3 rounded-lg hover:border-orange-500/60 hover:bg-slate-750 cursor-pointer transition-all duration-150"
              onClick={() => setLocation(`/routes/${route.id}`)}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-white group-hover:text-orange-400 transition-colors truncate">
                    {route.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{route.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-slate-600 hover:text-orange-400 hover:bg-slate-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </Button>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-slate-500">
                  {route.distance.toLocaleString()} km · {Math.ceil(parseInt(route.duration) / 480)} days
                </span>
                <span className="text-orange-400 font-medium">{formatDate(route.dates.start)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm">No saved routes yet</p>
            <p className="mt-0.5 text-xs text-slate-500">Your saved routes will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
