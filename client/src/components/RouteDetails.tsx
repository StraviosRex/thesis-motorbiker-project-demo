import { Button } from "@/components/ui/button";
import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { SavedRoute, Location, formatDistance, formatDuration, BikeClass, BIKE_CLASSES, getRouteCompatibility } from "@/lib/utils";
import { PointsOfInterest } from "./PointsOfInterest";
import { Accommodation } from "./Accommodation";
import { FerryInfo } from "./FerryInfo";
import { WeatherWidget } from "./WeatherWidget";

interface RouteDetailsProps {
  routeId?: number;
  routeData?: SavedRoute;
  onClose?: () => void;
  bikeClass?: BikeClass | null;
  className?: string;
}

/** Chevron icon that rotates when open */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export function RouteDetails({ routeId, routeData: propRouteData, onClose, bikeClass, className }: RouteDetailsProps) {
  const { data: fetchedRouteData, isLoading, error } = useQuery<SavedRoute>({
    queryKey: [`/api/routes/${routeId}`],
    enabled: routeId !== undefined && !propRouteData,
  });

  const routeData = propRouteData ?? fetchedRouteData;

  const [checkedFerryPrices, setCheckedFerryPrices] = useState<Record<number, number>>({});
  const [costOpen, setCostOpen] = useState(true);
  const [segmentsOpen, setSegmentsOpen] = useState(true);

  const distanceInKm   = routeData ? Number(routeData.distance) : 0;
  const durationInMins = routeData ? parseInt(routeData.duration) : 0;
  const ridingDays     = durationInMins > 0 ? Math.max(1, Math.ceil(durationInMins / (8 * 60))) : 1;

  const fuelCost          = Math.round(distanceInKm * 0.05 * 1.7);
  const accommodationCost = Math.max(0, ridingDays - 1) * 70;
  const foodCost          = ridingDays * 30;
  const ferryCost         = Math.round(
    (routeData?.ferryRoutes ?? []).reduce((sum, fr) => {
      const checked = checkedFerryPrices[fr.id];
      return sum + (checked !== undefined ? checked : Number(fr.price));
    }, 0)
  );
  const totalEstimatedCost = fuelCost + accommodationCost + foodCost + ferryCost;

  /** All unique named locations along the route (start → waypoints → overnight stops → end) */
  function getAllRouteLocations(route: SavedRoute): Location[] {
    const seen = new Set<string>();
    const locs: Location[] = [];
    const add = (loc: Location) => {
      if (!seen.has(loc.name)) { seen.add(loc.name); locs.push(loc); }
    };
    add(route.startLocation);
    route.segments.forEach(segment => {
      segment.waypoints.forEach(wp => add(wp));
      add(segment.endLocation);
    });
    return locs;
  }

  return (
    <div
      id="route-panel"
      className={`flex flex-col bg-slate-900 w-full sm:w-80 h-full shadow-2xl border-l border-slate-700/50 overflow-hidden ${className}`}
    >
      {/* Panel header */}
      <div className="px-4 py-3.5 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-950 to-slate-900 shrink-0">
        <h2 className="font-montserrat font-black text-white tracking-tight">Route Details</h2>
        {onClose && (
          <button
            id="close-route-panel"
            className="p-1.5 rounded-full hover:bg-slate-700 transition text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading && !propRouteData ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4 bg-slate-800" />
            <Skeleton className="h-4 w-1/2 bg-slate-800" />
            <div className="flex justify-between mt-4 gap-2">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-12 flex-1 bg-slate-800" />)}
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/20 text-red-400 text-sm">
            Failed to load route details. Please try again later.
          </div>
        ) : routeData ? (
          <>
            {/* Route summary — fixed header */}
            <div className="px-4 pt-4 pb-3 bg-slate-800/40 border-b border-slate-700 shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-white leading-tight">
                    {routeData.startLocation.name} → {routeData.endLocation.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(() => {
                      const checkpoints: string[] = [];
                      routeData.segments.forEach((segment, index) => {
                        segment.waypoints.forEach((wp) => checkpoints.push(wp.name));
                        if (index < routeData.segments.length - 1) {
                          checkpoints.push(segment.endLocation.name);
                        }
                      });
                      return checkpoints.length > 0 ? `Via ${checkpoints.join(", ")}` : null;
                    })()}
                  </p>
                </div>
                <div className="flex shrink-0">
                  {[
                    { title: "Edit route", icon: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" },
                    { title: "Share route", icon: "M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" },
                    { title: "Save route", icon: "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" },
                  ].map(({ title, icon }) => (
                    <Button
                      key={title}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-slate-700 text-slate-500 hover:text-orange-400 transition"
                      title={title}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d={icon} />
                      </svg>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-3 grid grid-cols-4 gap-1">
                {[
                  { label: "Distance", value: formatDistance(routeData.distance) },
                  { label: "Duration", value: formatDuration(parseInt(routeData.duration)) },
                  { label: "Ferries", value: String(routeData.ferryRoutes.length) },
                  { label: "Est. Cost", value: `€${totalEstimatedCost}`, accent: true },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="bg-slate-800 rounded-lg px-2 py-2 text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
                    <div className={`font-bold text-sm mt-0.5 ${accent ? "text-orange-400" : "text-white"}`}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Bike compatibility */}
              {bikeClass && routeData && (() => {
                const compat = getRouteCompatibility(routeData, bikeClass);
                const cls    = BIKE_CLASSES.find(c => c.id === bikeClass)!;
                const style  =
                  compat.score === 'excellent' ? 'bg-green-900/30 border-green-700/50 text-green-300' :
                  compat.score === 'good'      ? 'bg-blue-900/30  border-blue-700/50  text-blue-300'  :
                  compat.score === 'caution'   ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300' :
                                                 'bg-red-900/30   border-red-700/50   text-red-300';
                return (
                  <div className={`mt-2.5 border rounded-lg p-2.5 text-xs ${style}`}>
                    <div className="flex items-center gap-1.5 font-bold text-sm mb-1">
                      <span>{cls.emoji}</span>
                      <span>{compat.label}</span>
                    </div>
                    {compat.tips.length > 0 && (
                      <ul className="space-y-0.5 text-[11px] opacity-90">
                        {compat.tips.map((tip, i) => (
                          <li key={i} className="flex gap-1"><span>•</span><span>{tip}</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto sidebar-scrollbar">

              {/* ── COST BREAKDOWN (collapsible) ── */}
              <div className="border-b border-slate-700">
                <button
                  onClick={() => setCostOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition"
                >
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trip Cost Estimate</span>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-bold text-sm">€{totalEstimatedCost}</span>
                    <Chevron open={costOpen} />
                  </div>
                </button>
                {costOpen && (
                  <div className="px-4 pb-3">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs">
                      {[
                        { label: "Fuel", val: `€${fuelCost}` },
                        { label: "Accommodation", val: `€${accommodationCost}` },
                        { label: "Food (~€30/day)", val: `€${foodCost}` },
                        { label: `Ferries${Object.keys(checkedFerryPrices).length > 0 ? ' (verified)' : ''}`, val: `€${ferryCost}` },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex justify-between text-white py-0.5">
                          <span>{label}</span><span>{val}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-600 mt-2 pt-2 flex justify-between font-bold text-white">
                        <span>Total</span>
                        <span className="text-orange-400">€{totalEstimatedCost}</span>
                      </div>
                      <p className="mt-1.5 text-[10px] text-slate-400">Avg 5L/100km at €1.70/L. Accom. €70/night.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── ROUTE SEGMENTS (collapsible) ── */}
              <div className="border-b border-slate-700">
                <button
                  onClick={() => setSegmentsOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition"
                >
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Route Segments</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">{routeData.segments.length} day{routeData.segments.length !== 1 ? 's' : ''}</span>
                    <Chevron open={segmentsOpen} />
                  </div>
                </button>
                {segmentsOpen && (
                  <div className="px-4 pb-4 space-y-3">
                    {routeData.segments.map((segment, index) => (
                      <div key={segment.id} className="border border-slate-700 rounded-lg overflow-hidden">
                        {/* Segment header */}
                        <div className={`flex justify-between items-center px-3 py-2 border-b border-slate-700 ${segment.isScenic ? 'bg-green-900/20' : 'bg-slate-800'}`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-8 rounded-full shrink-0 ${segment.isScenic ? 'bg-green-500' : 'bg-orange-500'}`} />
                            <div>
                              <div className="font-bold text-white text-sm leading-tight">Day {index + 1}: {segment.title}</div>
                              {segment.isScenic && (
                                <div className="text-[10px] text-green-400 font-medium">Scenic route</div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 shrink-0">{formatDistance(segment.distance)}</div>
                        </div>

                        {/* Segment body — timeline */}
                        <div className="p-3 bg-slate-900/50 space-y-0">
                          {/* Start */}
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center shrink-0">
                              <div className="h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center mt-0.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              </div>
                            </div>
                            <div className="pb-2">
                              <div className="font-semibold text-white text-sm leading-tight">{segment.startLocation.name}</div>
                              <div className="text-xs text-slate-400">Depart {segment.startTime}</div>
                            </div>
                          </div>

                          {/* Waypoints */}
                          {segment.waypoints.map((waypoint, idx) => (
                            <Fragment key={idx}>
                              <div className="ml-[7px] h-8 border-l-2 border-dashed border-slate-700" />
                              <div className="flex items-start gap-3">
                                <div className="shrink-0">
                                  <div className={`h-4 w-4 rounded-full flex items-center justify-center mt-0.5 ${segment.isScenic ? 'bg-green-500' : 'bg-orange-400'}`}>
                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                  </div>
                                </div>
                                <div className="pb-2">
                                  <div className="font-semibold text-white text-sm leading-tight">{waypoint.name}</div>
                                  <div className="text-xs text-slate-400">Waypoint</div>
                                </div>
                              </div>
                            </Fragment>
                          ))}

                          <div className="ml-[7px] h-8 border-l-2 border-dashed border-slate-700" />

                          {/* End */}
                          <div className="flex items-start gap-3">
                            <div className="shrink-0">
                              <div className="h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center mt-0.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm leading-tight">{segment.endLocation.name}</div>
                              <div className="text-xs text-slate-400">Arrive {segment.endTime}</div>
                            </div>
                          </div>

                          {/* Road surface bar */}
                          {segment.surfaceData && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Road Surface</div>
                              <div className="flex h-2 rounded-full overflow-hidden w-full">
                                {segment.surfaceData.asphalt > 0 && (
                                  <div style={{ width: `${segment.surfaceData.asphalt}%` }} className="bg-slate-500" title={`Asphalt ${segment.surfaceData.asphalt}%`} />
                                )}
                                {segment.surfaceData.gravel > 0 && (
                                  <div style={{ width: `${segment.surfaceData.gravel}%` }} className="bg-amber-400" title={`Gravel ${segment.surfaceData.gravel}%`} />
                                )}
                                {segment.surfaceData.dirt > 0 && (
                                  <div style={{ width: `${segment.surfaceData.dirt}%` }} className="bg-orange-700" title={`Dirt/Mud ${segment.surfaceData.dirt}%`} />
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-3 mt-1 text-[10px] text-slate-400">
                                {segment.surfaceData.asphalt > 0 && (
                                  <span className="flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-sm bg-slate-500" />{segment.surfaceData.asphalt}% asphalt
                                  </span>
                                )}
                                {segment.surfaceData.gravel > 0 && (
                                  <span className="flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-sm bg-amber-400" />{segment.surfaceData.gravel}% gravel
                                  </span>
                                )}
                                {segment.surfaceData.dirt > 0 && (
                                  <span className="flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-sm bg-orange-700" />{segment.surfaceData.dirt}% dirt
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Speed limits */}
                          {segment.speedLimits && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {segment.speedLimits.motorway && (
                                <span className="text-[10px] bg-blue-900/40 border border-blue-700/50 rounded px-1.5 py-0.5 text-blue-300 font-medium">
                                  Motorway {segment.speedLimits.motorway} km/h
                                </span>
                              )}
                              <span className="text-[10px] bg-green-900/40 border border-green-700/50 rounded px-1.5 py-0.5 text-green-300 font-medium">
                                Rural {segment.speedLimits.rural} km/h
                              </span>
                              <span className="text-[10px] bg-orange-900/40 border border-orange-700/50 rounded px-1.5 py-0.5 text-orange-300 font-medium">
                                Urban {segment.speedLimits.urban} km/h
                              </span>
                            </div>
                          )}

                          {/* Notes */}
                          {segment.notes && (
                            <div className="mt-3 bg-slate-800 border border-slate-700/60 rounded-md p-2.5">
                              <div className="flex items-start gap-1.5 text-sm text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span>{segment.notes}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── WEATHER — all cities along the route ── */}
              <div className="border-b border-slate-700">
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Weather</span>
                  <span className="text-slate-400 text-[10px]">{getAllRouteLocations(routeData).length} cities</span>
                </div>
                <div className="px-4 pb-3">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden divide-y divide-slate-700/60">
                    {getAllRouteLocations(routeData).map((loc) => (
                      <WeatherWidget
                        key={loc.id}
                        locationName={loc.name}
                        coordinates={loc.coordinates}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* ── POINTS OF INTEREST ── */}
              <div className="border-b border-slate-700">
                <PointsOfInterest points={routeData.pointsOfInterest} />
              </div>

              {/* ── ACCOMMODATION ── */}
              <div className="border-b border-slate-700">
                <Accommodation accommodations={routeData.accommodations} />
              </div>

              {/* ── FERRY INFO ── */}
              <div className="pb-4">
                <FerryInfo
                  includeFerries={routeData.preferences.includeFerries}
                  ferryRoutes={routeData.ferryRoutes}
                  onPriceChecked={(id, min, max) =>
                    setCheckedFerryPrices(prev => ({ ...prev, [id]: Math.round((min + max) / 2) }))
                  }
                />
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-sm">Select a route to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
