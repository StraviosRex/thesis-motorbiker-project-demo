import { Accommodation as AccommodationType } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AccommodationProps {
  accommodations: AccommodationType[];
}

export function Accommodation({ accommodations }: AccommodationProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedAccommodations = showAll ? accommodations : accommodations.slice(0, 2);

  if (!accommodations || accommodations.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="font-medium text-primary mb-3">Accommodation Options</h3>
      
      <div className="space-y-3">
        {displayedAccommodations.map((accommodation) => (
          <div key={accommodation.id} className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="p-3">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">{accommodation.name}</h4>
                  <div className="text-sm text-gray-600">{accommodation.description}</div>
                </div>
                <div className="text-accent font-medium">€{accommodation.price}</div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <div className="flex items-center">
                  <div className="text-yellow-500 flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="ml-1">{accommodation.rating.toFixed(1)} ({accommodation.reviews})</span>
                </div>
                {accommodation.features[0] && (
                  <div className="flex items-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{accommodation.features[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {accommodations.length > 2 && (
        <Button 
          className="mt-3 w-full px-4 py-2 bg-white border border-primary text-primary rounded-md hover:bg-light-bg transition duration-150"
          variant="outline"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : `View ${accommodations.length - 2} More Accommodations`}
        </Button>
      )}
    </div>
  );
}
