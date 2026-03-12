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
const TrekFinder = lazy(() => import("@/pages/TrekFinder"));
const Top100     = lazy(() => import("@/pages/Top100"));
const About      = lazy(() => import("@/pages/About"));
const MyTreks    = lazy(() => import("@/pages/MyTreks"));
const NotFound   = lazy(() => import("@/pages/not-found"));

// ── Skeleton shown while a page chunk downloads ───────────────────────────────
// Kept minimal — a very brief flash is fine; a white blank screen is not.
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

// ── Wrap every lazy component in its own Suspense boundary ────────────────────
// A single top-level Suspense unmounts the ENTIRE tree on any navigation,
// producing a white screen while the next chunk loads. Per-route boundaries
// keep each page isolated — only that page shows a skeleton, not the whole app.
function withSuspense(Component: React.ComponentType) {
  return function SuspendedPage(props: any) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// ── Stable wrapped components — created ONCE at module level ─────────────────
// withSuspense() must NOT be called inside Router() because every call returns
// a new function reference, making React think the component type changed and
// causing it to fully unmount + remount the tree (React error #300).
const SuspendedHome       = withSuspense(Home);
const SuspendedTrekDetail = withSuspense(TrekDetail);
const SuspendedTrekFinder = withSuspense(TrekFinder);
const SuspendedTop100     = withSuspense(Top100);
const SuspendedAbout      = withSuspense(About);
const SuspendedMyTreks    = withSuspense(MyTreks);
const SuspendedNotFound   = withSuspense(NotFound);

function Router() {
  return (
    <Switch>
      <Route path="/"            component={SuspendedHome} />
      <Route path="/trek/:id"    component={SuspendedTrekDetail} />
      <Route path="/trek-finder" component={SuspendedTrekFinder} />
      <Route path="/top-100"     component={SuspendedTop100} />
      <Route path="/about"       component={SuspendedAbout} />
      <Route path="/my-treks"    component={SuspendedMyTreks} />
      <Route                     component={SuspendedNotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
