import { Button } from "@/components/ui/button";
import { FerryRoute } from "@/lib/utils";

interface FerryInfoProps {
  includeFerries: boolean;
  ferryRoutes?: FerryRoute[];
}

export function FerryInfo({ includeFerries, ferryRoutes = [] }: FerryInfoProps) {
  const hasFerryRoutes = includeFerries && ferryRoutes.length > 0;

  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="font-medium text-primary mb-3">Ferry Crossings Nearby</h3>
      
      <div className="bg-ferry-blue bg-opacity-10 p-3 rounded-md text-sm">
        {hasFerryRoutes ? (
          <div className="space-y-2">
            {ferryRoutes.map((ferryRoute) => (
              <div key={ferryRoute.id} className="bg-white border border-blue-200 rounded-md p-2">
                <div className="font-medium text-primary text-sm">{ferryRoute.name}</div>
                <div className="text-xs text-gray-600">{ferryRoute.startPort.name} to {ferryRoute.endPort.name}</div>
                <div className="mt-1 flex justify-between text-xs">
                  <span>{ferryRoute.operator}</span>
                  <span className="font-medium text-accent">€{ferryRoute.price}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{ferryRoute.duration} • {ferryRoute.schedule}</div>
              </div>
            ))}
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
