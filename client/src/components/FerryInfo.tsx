import { useState } from "react";
import { Button } from "@/components/ui/button";
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

  // Per-ferry price state keyed by ferry route id
  const [priceStates, setPriceStates] = useState<Record<number, PriceState>>({});

  async function checkPrices(ferry: FerryRoute) {
    const { lat: startLat, lng: startLng } = ferry.startPort.coordinates;
    const { lat: endLat,   lng: endLng   } = ferry.endPort.coordinates;

    setPriceStates(prev => ({ ...prev, [ferry.id]: { status: "loading" } }));

    try {
      const params = new URLSearchParams({
        startLat: String(startLat),
        startLng: String(startLng),
        endLat:   String(endLat),
        endLng:   String(endLng),
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
    <div className="p-4 border-t border-gray-200">
      <h3 className="font-medium text-primary mb-3">Ferry Crossings Nearby</h3>

      <div className="bg-ferry-blue bg-opacity-10 p-3 rounded-md text-sm">
        {hasFerryRoutes ? (
          <div className="space-y-2">
            {ferryRoutes.map((ferry) => {
              const ps = priceStates[ferry.id] ?? { status: "idle" };
              return (
                <div key={ferry.id} className="bg-white border border-blue-200 rounded-md p-2">
                  <div className="font-medium text-primary text-sm">{ferry.name}</div>
                  <div className="text-xs text-gray-600">
                    {ferry.startPort.name} to {ferry.endPort.name}
                  </div>

                  {/* Default / idle state — show placeholder price and check button */}
                  {ps.status === "idle" && (
                    <div className="mt-1 flex justify-between items-center text-xs">
                      <span>{ferry.operator}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">€{ferry.price} (est.)</span>
                        <button
                          onClick={() => checkPrices(ferry)}
                          className="text-blue-600 hover:underline"
                        >
                          Check prices
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Loading spinner */}
                  {ps.status === "loading" && (
                    <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Fetching prices…
                    </div>
                  )}

                  {/* Loaded — show real data */}
                  {ps.status === "loaded" && (
                    <>
                      <div className="mt-1 flex justify-between text-xs">
                        <span>{ps.data.operator}</span>
                        <span className="font-medium text-accent">
                          €{ps.data.priceMin}–€{ps.data.priceMax}
                          <span className="text-gray-400 font-normal ml-1">{ps.data.priceUnit}</span>
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {ps.data.duration} · {ps.data.schedule}
                      </div>
                      <a
                        href={ps.data.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                      >
                        Book on operator site →
                      </a>
                    </>
                  )}

                  {/* Error */}
                  {ps.status === "error" && (
                    <div className="mt-1 text-xs text-red-500 flex justify-between items-center">
                      <span>Could not fetch prices</span>
                      <button
                        onClick={() => checkPrices(ferry)}
                        className="text-blue-600 hover:underline ml-2"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : includeFerries ? (
          <p>No ferry crossings required for this route.</p>
        ) : (
          <p>Ferry crossings are disabled for this route.</p>
        )}
        <p className="mt-2">Need a different route with ferry options?</p>
        <Button className="mt-2 px-3 py-1 bg-ferry-blue text-white text-xs rounded-md hover:bg-blue-600 transition duration-150">
          Explore Ferry Routes
        </Button>
      </div>
    </div>
  );
}