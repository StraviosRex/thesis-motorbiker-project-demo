import { useState } from "react";
import { Header } from "./Header";
import { RoutePlanner } from "./RoutePlanner";
import { MapArea } from "./MapArea";
import { RouteDetails } from "./RouteDetails";
import { useMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children?: React.ReactNode;
  showRoutePlanner?: boolean;
  showRouteDetails?: boolean;
  routeId?: number;
}

export function AppLayout({ 
  children, 
  showRoutePlanner = true, 
  showRouteDetails = false, 
  routeId 
}: AppLayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [routePanelOpen, setRoutePanelOpen] = useState(!isMobile && showRouteDetails);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (isMobile && !sidebarOpen) {
      setRoutePanelOpen(false);
    }
  };

  const toggleRoutePanel = () => {
    setRoutePanelOpen(!routePanelOpen);
    if (isMobile && !routePanelOpen) {
      setSidebarOpen(false);
    }
  };

  const handleCalculateRoute = () => {
    setRoutePanelOpen(true);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex flex-1 h-screen-minus-header">
        {showRoutePlanner && (
          <RoutePlanner 
            onCalculateRoute={handleCalculateRoute} 
            onToggleSidebar={isMobile ? toggleSidebar : undefined}
            className={`transform transition-transform duration-300 ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'} ${isMobile ? 'absolute z-50' : ''}`}
          />
        )}
        
        <MapArea 
          routeId={routeId} 
          onToggleSidebar={toggleSidebar} 
          onToggleRoutePanel={showRouteDetails ? toggleRoutePanel : undefined}
        />
        
        {showRouteDetails && (
          <RouteDetails 
            routeId={routeId} 
            onClose={isMobile ? toggleRoutePanel : undefined}
            className={`transform transition-transform duration-300 ${isMobile && !routePanelOpen ? 'translate-x-full' : 'translate-x-0'} ${isMobile ? 'absolute right-0 z-50' : ''}`}
          />
        )}
        
        {children}
      </div>
    </div>
  );
}
