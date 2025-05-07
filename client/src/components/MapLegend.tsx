import { cn } from "@/lib/utils";

export function MapLegend({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg shadow-lg p-4 max-w-xs", className)}>
      <div className="flex flex-col">
        <div className="text-sm font-semibold text-primary">Legend</div>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-1 bg-accent rounded-full mr-2"></div>
            <span className="text-xs">Main route</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-scenic-green rounded-full mr-2"></div>
            <span className="text-xs">Scenic alternatives</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-ferry-blue rounded-full mr-2"></div>
            <span className="text-xs">Ferry routes</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xs">Points of interest</span>
          </div>
        </div>
      </div>
    </div>
  );
}
