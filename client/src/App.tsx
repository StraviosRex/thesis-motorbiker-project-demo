import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import RouteView from "@/pages/RouteView";
import NotFound from "@/pages/not-found";
import { Helmet } from "react-helmet";
import { SplashScreen } from "@/components/SplashScreen";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/routes/:id" component={RouteView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [splash, setSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <Helmet>
        <title>MotoRoute Europe - Motorcycle Route Planner</title>
        <meta
          name="description"
          content="Plan your motorcycle trips across Europe with MotoRoute Europe. Find optimal routes, scenic roads, ferry connections, accommodations and more."
        />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </Helmet>
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
