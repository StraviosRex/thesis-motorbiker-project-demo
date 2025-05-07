import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Helmet } from "react-helmet";

export default function Home() {
  useEffect(() => {
    document.title = "MotoRoute Europe - Motorcycle Route Planner";
  }, []);

  return (
    <>
      <Helmet>
        <title>MotoRoute Europe - Motorcycle Route Planner</title>
        <meta 
          name="description" 
          content="Plan your perfect motorcycle trip across Europe with MotoRoute. Find scenic roads, ferry connections, accommodations and points of interest." 
        />
        <meta property="og:title" content="MotoRoute Europe - Motorcycle Route Planner" />
        <meta 
          property="og:description" 
          content="Plan your perfect motorcycle trip across Europe with MotoRoute. Find scenic roads, ferry connections, accommodations and points of interest." 
        />
        <meta property="og:type" content="website" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </Helmet>
      <AppLayout showRoutePlanner={true} showRouteDetails={false} />
    </>
  );
}
