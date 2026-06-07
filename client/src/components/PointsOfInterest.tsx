import { PointOfInterest } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PointsOfInterestProps {
  points: PointOfInterest[];
}

export function PointsOfInterest({ points }: PointsOfInterestProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedPoints = showAll ? points : points.slice(0, 3);
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'rest':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        );
      case 'shop':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        );
      case 'viewpoint':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      case 'meeting':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        );
      case 'fuel':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 2a1 1 0 011-1h8a1 1 0 011 1v13.586l-4-4-4 4V2zm9.707 14.293l-4-4-4 4-1.414-1.414 4-4-4-4L6.707 1.707l4 4 4-4 1.414 1.414-4 4 4 4-1.414 1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'repair':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5A1 1 0 0110 9h3a1 1 0 110 2h-3a1 1 0 110 2h1a1 1 0 010 2H7a1 1 0 110-2h1a1 1 0 110-2H7a1 1 0 010-2h3a1 1 0 00-.867-1.5z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'rest': return 'bg-red-100';
      case 'shop': return 'bg-blue-100';
      case 'viewpoint': return 'bg-green-100';
      case 'meeting': return 'bg-purple-100';
      case 'fuel': return 'bg-yellow-100';
      case 'repair': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  if (!points || points.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="font-medium text-primary mb-3">Points of Interest</h3>
      
      <div className="space-y-3">
        {displayedPoints.map((poi) => (
          <div key={poi.id} className="flex items-start bg-light-bg p-2 rounded-md">
            <div className="flex-shrink-0 mr-2">
              <div className={`h-8 w-8 rounded-full ${getColorForType(poi.type)} flex items-center justify-center`}>
                {getIconForType(poi.type)}
              </div>
            </div>
            <div>
              <div className="font-medium text-sm">{poi.name}</div>
              <div className="text-xs text-gray-600">{poi.description}</div>
              <div className="mt-1 flex items-center">
                <div className="text-yellow-500 flex">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${i < poi.rating ? 'text-yellow-500' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs ml-1">({poi.reviews} reviews)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {points.length > 3 && (
        <Button 
          variant="link" 
          size="sm" 
          className="mt-2 w-full text-primary"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : `Show ${points.length - 3} More Points of Interest`}
        </Button>
      )}
    </div>
  );
}
