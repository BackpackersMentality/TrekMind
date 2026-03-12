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

// ── Per-route Suspense wrappers — defined at module level so React sees a
//    stable component identity on every render (avoids error #300).
//    Each is an explicit named component wrapping its own lazy import directly,
//    which also sidesteps the temporal dead zone issue that occurs when a helper
//    function like withSuspense() is called before lazy() vars are initialised
//    in the minified bundle.
function SuspendedHome(props: any) {
  return <Suspense fallback={<PageSkeleton />}><Home {...props} /></Suspense>;
}
function SuspendedTrekDetail(props: any) {
  return <Suspense fallback={<PageSkeleton />}><TrekDetail {...props} /></Suspense>;
}
function SuspendedTrekFinder(props: any) {
  return <Suspense fallback={<PageSkeleton />}><TrekFinder {...props} /></Suspense>;
}
function SuspendedTop100(props: any) {
  return <Suspense fallback={<PageSkeleton />}><Top100 {...props} /></Suspense>;
}
function SuspendedAbout(props: any) {
  return <Suspense fallback={<PageSkeleton />}><About {...props} /></Suspense>;
}
function SuspendedMyTreks(props: any) {
  return <Suspense fallback={<PageSkeleton />}><MyTreks {...props} /></Suspense>;
}
function SuspendedNotFound(props: any) {
  return <Suspense fallback={<PageSkeleton />}><NotFound {...props} /></Suspense>;
}

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
