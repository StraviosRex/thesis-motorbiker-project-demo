import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SavedRoute } from "@/lib/utils";
import { Helmet } from "react-helmet";

export default function RouteView() {
  const [, params] = useRoute("/routes/:id");
  const routeId = params?.id ? parseInt(params.id) : undefined;
  
  const { data: routeData } = useQuery<SavedRoute>({
    queryKey: ['/api/routes', routeId],
    enabled: !!routeId,
  });

  useEffect(() => {
    if (routeData) {
      document.title = `${routeData.name} - MotoRoute Europe`;
    } else {
      document.title = "Route Details - MotoRoute Europe";
    }
  }, [routeData]);

  return (
    <>
      <Helmet>
        <title>{routeData ? `${routeData.name} - MotoRoute Europe` : "Route Details - MotoRoute Europe"}</title>
        <meta 
          name="description" 
          content={routeData ? `View route from ${routeData.startLocation.name} to ${routeData.endLocation.name} with detailed segments, points of interest, and accommodations.` : "View detailed motorcycle route information on MotoRoute Europe."} 
        />
        <meta property="og:title" content={routeData ? `${routeData.name} - MotoRoute Europe` : "Route Details - MotoRoute Europe"} />
        <meta 
          property="og:description" 
          content={routeData ? `View route from ${routeData.startLocation.name} to ${routeData.endLocation.name} with detailed segments, points of interest, and accommodations.` : "View detailed motorcycle route information on MotoRoute Europe."} 
        />
        <meta property="og:type" content="website" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </Helmet>
      <AppLayout showRoutePlanner={false} showRouteDetails={true} routeId={routeId} />
    </>
  );
}
