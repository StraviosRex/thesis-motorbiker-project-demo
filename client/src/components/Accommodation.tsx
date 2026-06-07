import { Accommodation as AccommodationType } from "@/lib/utils";
import { useState } from "react";

interface AccommodationProps {
  accommodations: AccommodationType[];
}

export function Accommodation({ accommodations }: AccommodationProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? accommodations : accommodations.slice(0, 3);

  if (!accommodations || accommodations.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Accommodation</span>
        <span className="text-slate-600 text-[10px]">{accommodations.length} options</span>
      </div>

      <div className="space-y-2">
        {displayed.map((acc) => (
          <div key={acc.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition">
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-white leading-tight">{acc.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-snug">{acc.description}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-orange-400 font-bold text-sm">€{acc.price}</div>
                  <div className="text-[10px] text-slate-500">/ night</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${i < Math.round(acc.rating) ? 'text-yellow-400' : 'text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-[10px] text-slate-500 ml-0.5">{acc.rating.toFixed(1)} · {acc.reviews} reviews</span>
                </div>
                {acc.features[0] && (
                  <div className="flex items-center gap-1 text-green-400 text-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {acc.features[0]}
                  </div>
                )}
              </div>

              {acc.features.length > 1 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {acc.features.slice(1).map((f) => (
                    <span key={f} className="text-[10px] bg-slate-700 text-slate-400 rounded px-1.5 py-0.5">{f}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {accommodations.length > 3 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-2.5 w-full text-xs text-orange-400 hover:text-orange-300 font-medium py-1.5 transition"
        >
          {showAll ? "Show less" : `View ${accommodations.length - 3} more options`}
        </button>
      )}
    </div>
  );
}
