import { useState, useEffect } from "react";
import { Header } from "./Header";
import { RoutePlanner } from "./RoutePlanner";
import { MapArea } from "./MapArea";
import { RouteDetails } from "./RouteDetails";
import { useMobile } from "@/hooks/use-mobile";
import { SavedRoute } from "@/lib/utils";

/**
 * Props for AppLayout.
 *
 * @property children         - Optional extra content rendered inside the main content area.
 * @property showRoutePlanner - Whether to mount the left-hand RoutePlanner sidebar (default: true).
 * @property showRouteDetails - Whether a saved route's details panel should be shown on mount (default: false).
 * @property routeId          - ID of a persisted route to display; undefined when showing a dynamic route.
 */
interface AppLayoutProps {
  children?: React.ReactNode;
  showRoutePlanner?: boolean;
  showRouteDetails?: boolean;
  routeId?: number;
}

/**
 * Top-level shell that composes the full application view:
 * Header → (RoutePlanner sidebar | Map | RouteDetails panel).
 *
 * Panels are CSS-transformed off-screen on mobile rather than unmounted so that
 * map state is preserved when a panel is toggled. On desktop both sidebars are
 * visible by default.
 */
export function AppLayout({
  children,
  showRoutePlanner = true,
  showRouteDetails = false,
  routeId
}: AppLayoutProps) {
  const isMobile = useMobile();

  // Whether the left RoutePlanner sidebar is visible; hidden by default on mobile.
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Whether the right RouteDetails panel is visible; on desktop it opens
  // automatically when showRouteDetails is true, e.g. when navigating to a
  // saved-route page.
  const [routePanelOpen, setRoutePanelOpen] = useState(!isMobile && showRouteDetails);

  // Holds a route that was calculated on-the-fly (not yet saved to the DB).
  // When set, RouteDetails renders this data instead of fetching by routeId.
  const [dynamicRoute, setDynamicRoute] = useState<SavedRoute | null>(null);

  // Listen for dynamically calculated routes and open the details panel.
  // RoutePlanner fires a 'dynamicRouteCalculated' CustomEvent on window so
  // that AppLayout can receive the result without prop-drilling callbacks
  // through MapArea.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SavedRoute>).detail;
      if (detail) {
        setDynamicRoute(detail);
        setRoutePanelOpen(true);
      }
    };
    window.addEventListener('dynamicRouteCalculated', handler);
    return () => window.removeEventListener('dynamicRouteCalculated', handler);
  }, []);

  // Clear dynamic route when navigating to a saved route.
  // A valid routeId means the user switched to a persisted route, so the
  // previously calculated dynamic route is no longer relevant.
  useEffect(() => {
    if (routeId && routeId > 0) {
      setDynamicRoute(null);
    }
  }, [routeId]);

  // Toggle the left sidebar. On mobile, opening the sidebar closes the route
  // panel so only one overlay is visible at a time.
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (isMobile && !sidebarOpen) {
      setRoutePanelOpen(false);
    }
  };

  // Toggle the right route details panel. On mobile, opening it closes the
  // sidebar for the same single-overlay reason as toggleSidebar.
  const toggleRoutePanel = () => {
    setRoutePanelOpen(!routePanelOpen);
    if (isMobile && !routePanelOpen) {
      setSidebarOpen(false);
    }
  };

  // Called by RoutePlanner after a route calculation completes; ensures the
  // details panel is open so the result is immediately visible.
  const handleCalculateRoute = () => {
    setRoutePanelOpen(true);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex flex-1 h-screen-minus-header">
        {/* RoutePlanner sidebar — conditionally mounted; on mobile it slides in
            from the left via CSS translate so the map underneath stays live. */}
        {showRoutePlanner && (
          <RoutePlanner
            onCalculateRoute={handleCalculateRoute}
            // Only pass the toggle callback on mobile; on desktop the sidebar
            // is always visible so no toggle button is needed.
            onToggleSidebar={isMobile ? toggleSidebar : undefined}
            className={`transform transition-transform duration-300 ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'} ${isMobile ? 'absolute z-50' : ''}`}
          />
        )}

        {/* MapArea always renders so the map instance is never destroyed.
            onToggleRoutePanel is only wired up when there is something to show
            in the details panel (saved route or a just-calculated dynamic one). */}
        <MapArea
          routeId={routeId}
          onToggleSidebar={toggleSidebar}
          onToggleRoutePanel={(showRouteDetails || !!dynamicRoute) ? toggleRoutePanel : undefined}
        />

        {/* RouteDetails panel — rendered when viewing a saved route page OR
            when a dynamic route has been calculated. On mobile it slides in
            from the right. Prefers dynamicRoute data over fetching by routeId
            so newly calculated routes are shown instantly without a DB round-trip. */}
        {(showRouteDetails || dynamicRoute) && (
          <RouteDetails
            routeId={dynamicRoute ? undefined : routeId}
            routeData={dynamicRoute ?? undefined}
            // Close button is only useful on mobile where the panel is an overlay.
            onClose={isMobile ? toggleRoutePanel : undefined}
            className={`transform transition-transform duration-300 ${isMobile && !routePanelOpen ? 'translate-x-full' : 'translate-x-0'} ${isMobile ? 'absolute right-0 z-50' : ''}`}
          />
        )}

        {children}
      </div>
    </div>
  );
}
