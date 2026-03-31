// client/src/App.tsx
// ─────────────────────────────────────────────────────────────────────────────
// FIX: Removed explicit .tsx extension from the AuthProvider import.
// TypeScript/Vite resolves extensions automatically; hardcoding .tsx in the
// import path can cause "module not found" errors in some bundler configurations.
// ─────────────────────────────────────────────────────────────────────────────

import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth"; // ← no .tsx extension (resolved automatically)

// ── Route-level code splitting ────────────────────────────────────────────────
const Home          = lazy(() => import("@/pages/Home"));
const TrekDetail    = lazy(() => import("@/pages/TrekDetail"));
const TrekFinder    = lazy(() => import("@/pages/TrekFinder"));
const Top100        = lazy(() => import("@/pages/Top100"));
const About         = lazy(() => import("@/pages/About"));
const MyTreks       = lazy(() => import("@/pages/MyTreks"));
const Articles      = lazy(() => import("@/pages/Articles"));
const ArticleDetail = lazy(() => import("@/pages/ArticleDetail"));
const RegionPage    = lazy(() => import("@/pages/RegionPage"));
const CountryPage   = lazy(() => import("@/pages/CountryPage"));
const ContinentPage = lazy(() => import("@/pages/ContinentPage"));
const DurationPage  = lazy(() => import("@/pages/DurationPage"));
const TierPage      = lazy(() => import("@/pages/TierPage"));
const NotFound      = lazy(() => import("@/pages/not-found"));
const Privacy       = lazy(() => import("@/pages/Privacy"));
const Terms         = lazy(() => import("@/pages/Terms"));

// ── Loading skeleton ──────────────────────────────────────────────────────────
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

// ── Per-route Suspense wrappers ───────────────────────────────────────────────
// Defined at module level so React sees a stable component identity on every render.
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
function SuspendedArticles(props: any) {
  return <Suspense fallback={<PageSkeleton />}><Articles {...props} /></Suspense>;
}
function SuspendedArticleDetail(props: any) {
  return <Suspense fallback={<PageSkeleton />}><ArticleDetail {...props} /></Suspense>;
}
function SuspendedRegionPage(props: any) {
  return <Suspense fallback={<PageSkeleton />}><RegionPage {...props} /></Suspense>;
}
function SuspendedCountryPage(props: any) {
  return <Suspense fallback={<PageSkeleton />}><CountryPage {...props} /></Suspense>;
}
function SuspendedContinentPage(props: any) {
  return <Suspense fallback={<PageSkeleton />}><ContinentPage {...props} /></Suspense>;
}
function SuspendedDurationPage(props: any) {
  return <Suspense fallback={<PageSkeleton />}><DurationPage {...props} /></Suspense>;
}
function SuspendedTierPage(props: any) {
  return <Suspense fallback={<PageSkeleton />}><TierPage {...props} /></Suspense>;
}
function SuspendedPrivacy(props: any) {
  return <Suspense fallback={<PageSkeleton />}><Privacy {...props} /></Suspense>;
}
function SuspendedTerms(props: any) {
  return <Suspense fallback={<PageSkeleton />}><Terms {...props} /></Suspense>;
}

function Router() {
  return (
    <Switch>
      <Route path="/"                       component={SuspendedHome} />
      <Route path="/trek/:id"               component={SuspendedTrekDetail} />
      <Route path="/trek-finder"            component={SuspendedTrekFinder} />
      <Route path="/top-100"               component={SuspendedTop100} />
      <Route path="/about"                  component={SuspendedAbout} />
      <Route path="/my-treks"              component={SuspendedMyTreks} />
      {/* Articles */}
      <Route path="/articles"              component={SuspendedArticles} />
      <Route path="/articles/:slug"        component={SuspendedArticleDetail} />
      {/* Programmatic SEO pages */}
      <Route path="/treks/region/:slug"    component={SuspendedRegionPage} />
      <Route path="/treks/country/:slug"   component={SuspendedCountryPage} />
      <Route path="/treks/continent/:slug" component={SuspendedContinentPage} />
      <Route path="/treks/duration/:slug"  component={SuspendedDurationPage} />
      <Route path="/treks/tier/:slug"      component={SuspendedTierPage} />
      <Route path="/privacy"               component={SuspendedPrivacy} />
      <Route path="/terms"                 component={SuspendedTerms} />
      <Route                               component={SuspendedNotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
