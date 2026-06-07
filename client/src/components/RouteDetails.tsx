import { Button } from "@/components/ui/button";
import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { SavedRoute, formatDistance, formatDuration } from "@/lib/utils";
import { PointsOfInterest } from "./PointsOfInterest";
import { Accommodation } from "./Accommodation";
import { FerryInfo } from "./FerryInfo";
import { WeatherWidget } from "./WeatherWidget";

interface RouteDetailsProps {
  routeId?: number;
  routeData?: SavedRoute;
  onClose?: () => void;
  className?: string;
}

export function RouteDetails({ routeId, routeData: propRouteData, onClose, className }: RouteDetailsProps) {
  const { data: fetchedRouteData, isLoading, error } = useQuery<SavedRoute>({
    queryKey: [`/api/routes/${routeId}`],
    enabled: routeId !== undefined && !propRouteData,
  });

  const routeData = propRouteData ?? fetchedRouteData;

  // Tracks verified price midpoints per ferry id, updated when user clicks "Check prices"
  const [checkedFerryPrices, setCheckedFerryPrices] = useState<Record<number, number>>({});

  const distanceInKm = routeData ? Number(routeData.distance) : 0;
  const durationInMinutes = routeData ? parseInt(routeData.duration) : 0;
  const ridingDays = durationInMinutes > 0 ? Math.max(1, Math.ceil(durationInMinutes / (8 * 60))) : 1;

  const fuelCost = Math.round(distanceInKm * 0.05 * 1.7);
  const accommodationCost = Math.max(0, ridingDays - 1) * 70;
  const foodCost = ridingDays * 30;
  const ferryCost = Math.round((routeData?.ferryRoutes ?? []).reduce((sum, ferryRoute) => {
    const checked = checkedFerryPrices[ferryRoute.id];
    return sum + (checked !== undefined ? checked : Number(ferryRoute.price));
  }, 0));
  const totalEstimatedCost = fuelCost + accommodationCost + foodCost + ferryCost;

  return (
    <div id="route-panel" className={`bg-white w-80 h-full shadow-lg overflow-hidden ${className}`}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-primary text-white">
          <h2 className="font-montserrat font-semibold text-lg">Route Details</h2>
          {onClose && (
            <button 
              id="close-route-panel" 
              className="p-1 rounded-full hover:bg-primary-light"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {isLoading && !propRouteData ? (
          <div className="p-4 bg-light-bg">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-20" />
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600">
            <p>Failed to load route details. Please try again later.</p>
          </div>
        ) : routeData ? (
          <>
            <div className="p-4 bg-light-bg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{routeData.startLocation.name} to {routeData.endLocation.name}</h3>
                  <p className="text-sm text-gray-600">
                    Via {routeData.segments.map((segment, index) => 
                      index === 0 ? segment.endLocation.name : 
                      index === routeData.segments.length - 1 ? "" : 
                      `${segment.endLocation.name}${index < routeData.segments.length - 2 ? ", " : ""}`)
                    }
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="p-1 rounded-full hover:bg-blue-100" title="Edit route">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="p-1 rounded-full hover:bg-blue-100" title="Share route">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="p-1 rounded-full hover:bg-blue-100" title="Save route">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between text-sm">
                <div className="text-center">
                  <div className="text-gray-600">Distance</div>
                  <div className="font-medium text-base">{formatDistance(routeData.distance)}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Duration</div>
                  <div className="font-medium text-base">{formatDuration(parseInt(routeData.duration))}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Ferries</div>
                  <div className="font-medium text-base">{routeData.ferryRoutes.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Est. Cost</div>
                  <div className="font-medium text-base text-accent">€{totalEstimatedCost}</div>
                </div>
              </div>

              <div className="mt-3 bg-white border border-gray-200 rounded-md p-3 text-xs text-gray-600">
                <div className="font-medium text-primary mb-2">Estimated Trip Cost Breakdown</div>
                <div className="flex justify-between"><span>Fuel</span><span>€{fuelCost}</span></div>
                <div className="flex justify-between"><span>Accommodation</span><span>€{accommodationCost}</span></div>
                <div className="flex justify-between"><span>Food (~€30/day)</span><span>€{foodCost}</span></div>
                <div className="flex justify-between"><span>Ferries{Object.keys(checkedFerryPrices).length > 0 ? ' (verified)' : ''}</span><span>€{ferryCost}</span></div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-medium text-gray-800">
                  <span>Total</span>
                  <span>€{totalEstimatedCost}</span>
                </div>
                <p className="mt-2 text-[11px] text-gray-500">Based on avg motorcycle 5L/100km at €1.70/L. Accommodation est. €70/night. Ferries from listed crossings.</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4">
                <h3 className="font-medium text-primary mb-3">Route Segments</h3>
                
                {/* Route segments */}
                <div className="space-y-4">
                  {routeData.segments.map((segment, index) => (
                    <div key={segment.id} className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">Day {index + 1}: {segment.title}</div>
                          <div className="text-sm text-gray-500">{formatDistance(segment.distance)}</div>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <div className="flex items-start">
                          <div className="mt-1 mr-3">
                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{segment.startLocation.name}</div>
                            <div className="text-sm text-gray-500">Start at {segment.startTime}</div>
                          </div>
                        </div>
                        
                        {segment.waypoints.map((waypoint, idx) => (
                          <Fragment key={idx}>
                            <div className="ml-[7px] h-10 border-l-2 border-dashed border-gray-300 my-1"></div>
                            <div className="flex items-start">
                              <div className="mt-1 mr-3">
                                <div className={`h-4 w-4 rounded-full ${segment.isScenic ? "bg-scenic-green" : "bg-primary"} flex items-center justify-center`}>
                                  <div className="h-2 w-2 rounded-full bg-white"></div>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">{waypoint.name}</div>
                                <div className="text-sm text-gray-500">Waypoint</div>
                              </div>
                            </div>
                          </Fragment>
                        ))}
                        
                        <div className="ml-[7px] h-10 border-l-2 border-dashed border-gray-300 my-1"></div>
                        
                        <div className="flex items-start">
                          <div className="mt-1 mr-3">
                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{segment.endLocation.name}</div>
                            <div className="text-sm text-gray-500">Arrive by {segment.endTime}</div>
                          </div>
                        </div>
                        
                        {segment.notes && (
                          <div className="mt-3 bg-light-bg rounded-md p-2">
                            <div className="flex items-center text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent mr-1" viewBox="0 0 20 20" fill="currentColor">
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
              </div>
              
              {/* Weather */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="font-medium text-primary mb-3">Weather</h3>
                <div className="space-y-2">
                  <WeatherWidget
                    locationName={routeData.startLocation.name}
                    coordinates={routeData.startLocation.coordinates}
                  />
                  <WeatherWidget
                    locationName={routeData.endLocation.name}
                    coordinates={routeData.endLocation.coordinates}
                  />
                </div>
              </div>

              {/* Points of Interest Section */}
              <PointsOfInterest points={routeData.pointsOfInterest} />
              
              {/* Accommodation Options */}
              <Accommodation accommodations={routeData.accommodations} />
              
              {/* Ferry Options */}
              <FerryInfo
                includeFerries={routeData.preferences.includeFerries}
                ferryRoutes={routeData.ferryRoutes}
                onPriceChecked={(id, min, max) =>
                  setCheckedFerryPrices(prev => ({ ...prev, [id]: Math.round((min + max) / 2) }))
                }
              />
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>Select a route to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
