// ============================================================
// App.tsx — Routes & top-level layout
// Card Table Modernist theme — light mode
// ============================================================

import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingSpinner from "@/components/LoadingSpinner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import GamePage from "./pages/GamePage";
const History = lazy(() => import("./pages/History"));
const ConventionReference = lazy(() => import("./pages/ConventionReference"));

// Register all games (side-effect imports)
import "./lib/conventionData";
import "./games/pointCounting/index";
import "./games/openingBid/index";
import "./games/responding/index";

function Router() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/game/:gameId" component={GamePage} />
          <Route path="/history" component={History} />
          <Route path="/reference" component={ConventionReference} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
