import { Button } from "@/components/ui/button";

interface FerryInfoProps {
  includeFerries: boolean;
}

export function FerryInfo({ includeFerries }: FerryInfoProps) {
  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="font-medium text-primary mb-3">Ferry Crossings Nearby</h3>
      
      <div className="bg-ferry-blue bg-opacity-10 p-3 rounded-md text-sm">
        {includeFerries ? (
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
