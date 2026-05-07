// client/src/App.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Updated: added /embed/:id route for WordPress iframe embeds.
// The embed route is intentionally outside the AuthProvider/CookieBanner
// wrappers — it is a bare canvas with no app chrome.
// ─────────────────────────────────────────────────────────────────────────────

import { Switch, Route, useLocation } from "wouter";
import { Suspense, lazy, useEffect }  from "react";
import { QueryClientProvider }        from "@tanstack/react-query";
import { queryClient }                from "./lib/queryClient";
import { Toaster }                    from "@/components/ui/toaster";
import { TooltipProvider }            from "@/components/ui/tooltip";
import { HelmetProvider }             from "react-helmet-async";
import { AuthProvider }               from "@/hooks/useAuth";
import { CookieBanner }               from "@/components/CookieBanner";
import { initAnalytics, trackPageView } from "@/lib/analytics";

initAnalytics();

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
// ── NEW ──────────────────────────────────────────────────────────────────────
const EmbedMap      = lazy(() => import("@/pages/EmbedMap"));

// ── Loading skeletons ─────────────────────────────────────────────────────────
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
function EmbedSkeleton() {
  return <div style={{ position: "fixed", inset: 0, background: "#0d1b2e" }} />;
}

// ── Per-route Suspense wrappers ───────────────────────────────────────────────
function SuspendedHome(p: any)          { return <Suspense fallback={<PageSkeleton />}><Home {...p} /></Suspense>; }
function SuspendedTrekDetail(p: any)    { return <Suspense fallback={<PageSkeleton />}><TrekDetail {...p} /></Suspense>; }
function SuspendedTrekFinder(p: any)    { return <Suspense fallback={<PageSkeleton />}><TrekFinder {...p} /></Suspense>; }
function SuspendedTop100(p: any)        { return <Suspense fallback={<PageSkeleton />}><Top100 {...p} /></Suspense>; }
function SuspendedAbout(p: any)         { return <Suspense fallback={<PageSkeleton />}><About {...p} /></Suspense>; }
function SuspendedMyTreks(p: any)       { return <Suspense fallback={<PageSkeleton />}><MyTreks {...p} /></Suspense>; }
function SuspendedNotFound(p: any)      { return <Suspense fallback={<PageSkeleton />}><NotFound {...p} /></Suspense>; }
function SuspendedArticles(p: any)      { return <Suspense fallback={<PageSkeleton />}><Articles {...p} /></Suspense>; }
function SuspendedArticleDetail(p: any) { return <Suspense fallback={<PageSkeleton />}><ArticleDetail {...p} /></Suspense>; }
function SuspendedRegionPage(p: any)    { return <Suspense fallback={<PageSkeleton />}><RegionPage {...p} /></Suspense>; }
function SuspendedCountryPage(p: any)   { return <Suspense fallback={<PageSkeleton />}><CountryPage {...p} /></Suspense>; }
function SuspendedContinentPage(p: any) { return <Suspense fallback={<PageSkeleton />}><ContinentPage {...p} /></Suspense>; }
function SuspendedDurationPage(p: any)  { return <Suspense fallback={<PageSkeleton />}><DurationPage {...p} /></Suspense>; }
function SuspendedTierPage(p: any)      { return <Suspense fallback={<PageSkeleton />}><TierPage {...p} /></Suspense>; }
function SuspendedPrivacy(p: any)       { return <Suspense fallback={<PageSkeleton />}><Privacy {...p} /></Suspense>; }
function SuspendedTerms(p: any)         { return <Suspense fallback={<PageSkeleton />}><Terms {...p} /></Suspense>; }
// ── NEW ──────────────────────────────────────────────────────────────────────
function SuspendedEmbedMap(p: any)      { return <Suspense fallback={<EmbedSkeleton />}><EmbedMap {...p} /></Suspense>; }

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    // Don't fire GA for embed views — they are iframed, not direct user sessions
    if (!location.startsWith("/embed/")) {
      trackPageView(location);
    }
  }, [location]);

  return (
    <Switch>
      {/* ── /embed/:id MUST be first — matched before catch-all ─────────── */}
      <Route path="/embed/:id"              component={SuspendedEmbedMap} />

      <Route path="/"                       component={SuspendedHome} />
      <Route path="/trek/:id"               component={SuspendedTrekDetail} />
      <Route path="/trek-finder"            component={SuspendedTrekFinder} />
      <Route path="/top-100"               component={SuspendedTop100} />
      <Route path="/about"                  component={SuspendedAbout} />
      <Route path="/my-treks"              component={SuspendedMyTreks} />
      <Route path="/articles"              component={SuspendedArticles} />
      <Route path="/articles/:slug"        component={SuspendedArticleDetail} />
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
            <CookieBanner />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
