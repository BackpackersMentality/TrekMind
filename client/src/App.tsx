import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// ── Route-level code splitting ─────────────────────────────────────────────────
// Home and TrekDetail are now lazy-loaded. This means:
// - The initial JS bundle contains ONLY the routing shell (~5KB)
// - Home chunk loads immediately on first visit
// - TrekDetail + Mapbox chunk (~300KB) only loads when a user opens a trek
// - Returning visitors get instant loads from browser cache
const Home       = lazy(() => import("@/pages/Home"));
const TrekDetail = lazy(() => import("@/pages/TrekDetail"));
const NotFound   = lazy(() => import("@/pages/not-found"));

// ── Route-level loading skeleton ──────────────────────────────────────────────
// Shown during chunk download. Matches the visual weight of each page to
// prevent jarring layout shifts (CLS).
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-muted/60" />
      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-4">
        <div className="h-8 bg-muted/40 rounded w-1/3" />
        <div className="h-4 bg-muted/30 rounded w-2/3" />
        <div className="h-4 bg-muted/30 rounded w-1/2" />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/"          component={Home} />
      <Route path="/trek/:id"  component={TrekDetail} />
      <Route                   component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Suspense fallback={<PageSkeleton />}>
          <Router />
        </Suspense>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
