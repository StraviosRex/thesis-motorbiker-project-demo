import { cn } from "@/lib/utils";

export function MapLegend({ className }: { className?: string }) {
  return (
    <div className={cn(
      "bg-slate-900/85 backdrop-blur-sm rounded-lg shadow-2xl p-3.5 border border-slate-700/50 max-w-xs",
      className
    )}>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Legend</div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-1.5 bg-orange-500 rounded-full shrink-0" />
          <span className="text-xs text-slate-300">Main route</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-1.5 bg-green-500 rounded-full shrink-0" />
          <span className="text-xs text-slate-300">Scenic route</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-1.5 bg-sky-400 rounded-full shrink-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, #38bdf8 0 4px, transparent 4px 8px)" }} />
          <span className="text-xs text-slate-300">Ferry crossing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-red-500 rounded-full shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-xs text-slate-300">Points of interest</span>
        </div>
      </div>
    </div>
  );
}
