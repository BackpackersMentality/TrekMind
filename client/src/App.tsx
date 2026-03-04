import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";

// ── Route-level code splitting ─────────────────────────────────────────────────
const Home       = lazy(() => import("@/pages/Home"));
const TrekDetail = lazy(() => import("@/pages/TrekDetail"));
const NotFound   = lazy(() => import("@/pages/not-found"));

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-muted/60" />
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
    // HelmetProvider wraps everything so any page can set <head> tags via <Helmet>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={<PageSkeleton />}>
            <Router />
          </Suspense>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
