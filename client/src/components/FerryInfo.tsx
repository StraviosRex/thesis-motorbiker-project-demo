import { useState } from "react";
import { FerryRoute } from "@/lib/utils";

interface FerryPriceResult {
  routeName: string;
  startPortName: string;
  endPortName: string;
  operator: string;
  priceMin: number;
  priceMax: number;
  priceUnit: string;
  duration: string;
  schedule: string;
  bookingUrl: string;
}

type PriceState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; data: FerryPriceResult }
  | { status: "error"; message: string };

interface FerryInfoProps {
  includeFerries: boolean;
  ferryRoutes?: FerryRoute[];
  onPriceChecked?: (ferryId: number, priceMin: number, priceMax: number) => void;
}

export function FerryInfo({ includeFerries, ferryRoutes = [], onPriceChecked }: FerryInfoProps) {
  const hasFerryRoutes = includeFerries && ferryRoutes.length > 0;
  const [priceStates, setPriceStates] = useState<Record<number, PriceState>>({});

  async function checkPrices(ferry: FerryRoute) {
    const { lat: startLat, lng: startLng } = ferry.startPort.coordinates;
    const { lat: endLat,   lng: endLng   } = ferry.endPort.coordinates;

    setPriceStates(prev => ({ ...prev, [ferry.id]: { status: "loading" } }));

    try {
      const params = new URLSearchParams({
        startLat: String(startLat), startLng: String(startLng),
        endLat:   String(endLat),   endLng:   String(endLng),
      });
      const res = await fetch(`/api/ferry-prices?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      const data: FerryPriceResult = await res.json();
      setPriceStates(prev => ({ ...prev, [ferry.id]: { status: "loaded", data } }));
      onPriceChecked?.(ferry.id, data.priceMin, data.priceMax);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setPriceStates(prev => ({ ...prev, [ferry.id]: { status: "error", message } }));
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ferry Crossings</span>
        {hasFerryRoutes && (
          <span className="text-slate-600 text-[10px]">{ferryRoutes.length} route{ferryRoutes.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {hasFerryRoutes ? (
        <div className="space-y-2">
          {ferryRoutes.map((ferry) => {
            const ps = priceStates[ferry.id] ?? { status: "idle" };
            return (
              <div key={ferry.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition">
                <div className="p-3">
                  {/* Ferry name + ports */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm text-white leading-tight">{ferry.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" />
                        </svg>
                        {ferry.startPort.name} → {ferry.endPort.name}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {ps.status === "loaded" ? (
                        <div className="text-orange-400 font-bold text-sm">
                          €{ps.data.priceMin}–{ps.data.priceMax}
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs">€{ferry.price} <span className="text-slate-600">est.</span></div>
                      )}
                    </div>
                  </div>

                  {/* Status-dependent footer */}
                  {ps.status === "idle" && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{ferry.operator} · {ferry.schedule}</span>
                      <button
                        onClick={() => checkPrices(ferry)}
                        className="text-orange-400 hover:text-orange-300 font-medium transition"
                      >
                        Check prices →
                      </button>
                    </div>
                  )}

                  {ps.status === "loading" && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Fetching prices…
                    </div>
                  )}

                  {ps.status === "loaded" && (
                    <div className="mt-2 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>{ps.data.operator}</span>
                        <span className="text-slate-500">{ps.data.priceUnit}</span>
                      </div>
                      <div className="text-slate-500">{ps.data.duration} · {ps.data.schedule}</div>
                      <a
                        href={ps.data.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium transition"
                      >
                        Book on operator site
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    </div>
                  )}

                  {ps.status === "error" && (
                    <div className="mt-2 flex items-center justify-between text-xs text-red-400">
                      <span>Could not fetch prices</span>
                      <button onClick={() => checkPrices(ferry)} className="text-orange-400 hover:text-orange-300 font-medium transition">
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-400">
          {includeFerries
            ? "No ferry crossings required for this route."
            : "Ferry crossings are disabled for this route."}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Need different ferry options?</span>
        <button className="text-orange-400 hover:text-orange-300 font-medium transition">
          Explore routes →
        </button>
      </div>
    </div>
  );
}
