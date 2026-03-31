import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { Link, useLocation } from "wouter";
import { getAllTreks } from "../lib/treks";
import { TrekCard } from "@/components/TrekCard";
import { Map, LayoutGrid, Info, Sparkles, Trophy, BookmarkCheck, BookOpen } from "lucide-react";
import { useFilterStore } from "@/store/useFilterStore";
import { filterTreks } from "@/lib/filterTreks";
import { Helmet } from "react-helmet-async";
import { useTrekList } from "@/hooks/useTrekList";
import { IntroOverlay } from "@/components/IntroOverlay";
import { FilterButton } from "@/components/FilterButton";
import { FilterPopup } from "@/components/FilterPopup";
import { SearchButton } from "@/components/SearchButton";
import { SearchPopup } from "@/components/SearchPopup";
import { type FilterState, countActiveFilters } from "../types/filters";

// Lazy-load GlobeIntegration into its own chunk — breaks the circular
// import chain between Home → GlobeIntegration → FilterButton/SearchButton
// → filter types that caused the TDZ ReferenceError on bundle initialisation.
const GlobeIntegrationLazy = lazy(() =>
  import("@/components/GlobeIntegration").then(m => ({ default: m.GlobeIntegration }))
);

// Kick off the GlobeIntegration chunk download immediately at module evaluation
// time — so by the time the user navigates back from TrekDetail, the chunk is
// already cached and React never has to suspend (no blank screen on back nav).
// NOTE: we use a module-level variable so this only fires once, not on re-renders.
let _globePreloaded = false;
if (!_globePreloaded) {
  _globePreloaded = true;
  import("@/components/GlobeIntegration").catch(() => {});
}

export default function Home() {
  const treks = useMemo(() => getAllTreks(), []);
  const [viewMode, setViewMode] = useState<"globe" | "cards">(() => {
    // Restore cards view when user navigates back from TrekDetail (?view=cards)
    if (typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('view') === 'cards') {
      return 'cards';
    }
    return 'globe';
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { counts } = useTrekList();

  // ── FIX: Pull the unified `filters` object and `setFilters` from the store.
  // The previous code destructured non-existent top-level fields (region,
  // duration, accommodation, terrain, popularity) which returned undefined,
  // causing filterTreks to crash with "Cannot read properties of null
  // (reading 'length')" and producing a blank screen.
  const { filters, setFilters } = useFilterStore();

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const filteredTreks = useMemo(() => {
    // Defensive guard: ensure every trek has a durationBucket string before
    // passing to filterTreks, so a null/undefined field can never crash the
    // filter callback.
    const safeTreks = (treks as any[]).map((t) => ({
      ...t,
      durationBucket: t.durationBucket ?? "",
    }));
    try {
      return filterTreks(safeTreks, filters);
    } catch (e) {
      console.error("[TrekMind] filterTreks threw an error — returning unfiltered list:", e);
      return safeTreks;
    }
  }, [treks, filters]);

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    // ── FIX: Use setFilters (single call) instead of individual non-existent setters.
    setFilters(newFilters);
    setIsFilterOpen(false);
  }, [setFilters]);

  return (
    <div className="bg-background relative flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      <Helmet>
        <title>TrekMind — Discover the World's Best Trekking Routes</title>
        <meta name="description" content="Explore the world's most breathtaking trekking routes on an interactive 3D globe. Filter by region, terrain, duration and difficulty. Find your next great adventure." />
        <meta name="keywords" content="trekking routes, hiking trails, best treks, adventure travel, trekking guide, hiking app" />
        <link rel="canonical" href="https://trekmind.pages.dev/" />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://trekmind.pages.dev/" />
        <meta property="og:title"       content="TrekMind — Discover the World's Best Trekking Routes" />
        <meta property="og:description" content="Explore the world's most breathtaking trekking routes on an interactive 3D globe. Filter by region, terrain, duration and difficulty." />
        <meta property="og:image"       content="https://trekmind.pages.dev/og-image.jpg" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="TrekMind — Discover the World's Best Trekking Routes" />
        <meta name="twitter:description" content="Explore the world's most breathtaking trekking routes on an interactive 3D globe." />
        <meta name="twitter:image"       content="https://trekmind.pages.dev/og-image.jpg" />
      </Helmet>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-foreground text-background py-2.5 md:py-3 px-4 relative overflow-hidden shrink-0 z-10">
        {/* LCP fix: <img> instead of CSS background — browser preloads this immediately */}
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=75"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between gap-3">
            {/* Title + slogan + tagline */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {/* Logo mark */}
              <img
                src="/apple-touch-icon.png"
                alt="TrekMind logo"
                width={48}
                height={48}
                className="shrink-0 rounded-lg shadow-md"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              {/* Brand text */}
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-display font-bold tracking-tight text-white drop-shadow-lg leading-tight">
                  TrekMind
                </h1>
                {/* Slogan — visible from sm up */}
                <p className="text-[11px] md:text-sm text-amber-300/90 font-semibold leading-snug mt-0.5 tracking-wide hidden sm:block drop-shadow">
                  The Atlas of the World's Best Treks
                </p>
                {/* Micro tagline — visible from md up */}
                <p className="text-[10px] md:text-[11px] text-white/55 font-light leading-snug mt-0.5 hidden md:block">
                  Discover iconic trails, remote adventures, and unforgettable journeys.
                </p>
              </div>
            </div>

            {/* Action buttons — compact on mobile, labelled on desktop */}
            <div className="flex items-center gap-1.5 shrink-0">

              {/* Top 100 — amber pill, always visible */}
              <Link href="/top-100">
                <button
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/90 hover:bg-amber-400 text-white text-[10px] md:text-[11px] font-bold rounded-full shadow-md transition-all uppercase tracking-wide backdrop-blur-sm border border-amber-300/20 whitespace-nowrap"
                  aria-label="Top 100 Treks"
                >
                  <Trophy className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">Top </span>100
                </button>
              </Link>

              <Link href="/my-treks">
                <button
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-[10px] md:text-[11px] font-bold rounded-full shadow-md transition-all uppercase tracking-wide backdrop-blur-sm border border-white/20 whitespace-nowrap relative"
                  aria-label="My Treks"
                >
                  <BookmarkCheck className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">My Treks</span>
                  {counts.completed > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {counts.completed > 9 ? "9+" : counts.completed}
                    </span>
                  )}
                </button>
              </Link>

              {/* Articles — book icon only on mobile, label on md+ */}
              <Link href="/articles">
                <button
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-[10px] md:text-[11px] font-bold rounded-full shadow-md transition-all uppercase tracking-wide backdrop-blur-sm border border-white/20 whitespace-nowrap"
                  aria-label="Articles"
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline">Articles</span>
                </button>
              </Link>

              {/* About — ℹ icon only on mobile, label on md+ */}
              <Link href="/about">
                <button
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-[10px] md:text-[11px] font-bold rounded-full shadow-md transition-all uppercase tracking-wide backdrop-blur-sm border border-white/20 whitespace-nowrap"
                  aria-label="About TrekMind"
                >
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline">About</span>
                </button>
              </Link>

            </div>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 relative overflow-hidden min-h-0" style={{ minHeight: 0, height: "100%" }}>
        {viewMode === "globe" && (
          <>
            <div className="absolute top-3 left-3 z-30 flex gap-2">
              <button
                onClick={() => setViewMode("cards")}
                className="px-3 py-1.5 bg-gray-900/95 text-white rounded-full shadow-lg hover:bg-black transition-all flex items-center gap-1.5 font-semibold text-xs border border-white/30 backdrop-blur-sm"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View </span>Cards
              </button>

              <Link href="/trek-finder">
                <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center gap-1.5 font-semibold text-xs backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Find My Trek
                </button>
              </Link>
            </div>
            <Suspense fallback={
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            }>
              <GlobeIntegrationLazy height="100%" className="animate-in fade-in duration-500" />
            </Suspense>
          </>
        )}

        {viewMode === "cards" && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Cards view header row */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setViewMode("globe")}
                  className="px-4 py-2 bg-gray-900 text-white rounded-full shadow-lg hover:bg-black hover:shadow-xl transition-all flex items-center gap-2 font-semibold"
                >
                  <Map className="w-4 h-4" />
                  Back to Globe
                </button>

                {/* Right side: result count + search + filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium hidden sm:inline">
                    {filteredTreks.length} trek{filteredTreks.length !== 1 ? "s" : ""}
                  </span>
                  <SearchButton onClick={() => setIsSearchOpen(true)} />
                  <FilterButton activeCount={activeFilterCount} onClick={() => setIsFilterOpen(true)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {filteredTreks.map((trek: any, index: number) => (
                  <div
                    key={trek.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TrekCard trek={trek} fromCards={true} />
                  </div>
                ))}

                {filteredTreks.length === 0 && (
                  <div className="col-span-full py-20 text-center" data-testid="text-no-results">
                    <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-foreground">
                      No treks match your filters.
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Try adjusting your filters or search terms.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Filter + Search popups — shared between globe and cards views */}
      <FilterPopup
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={filters}
        onApply={handleApplyFilters}
        matchingTrekCount={filteredTreks.length}
      />
      <SearchPopup
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onTrekSelect={(id) => {
          setIsSearchOpen(false);
          setLocation(`/trek/${id}${viewMode === 'cards' ? '?from=cards' : ''}`)
        }}
      />

      {/* First-visit intro overlay */}
      <IntroOverlay />

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card py-1 shrink-0 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-display font-bold text-[10px] text-foreground">TrekMind</p>
          <p className="text-[7px] text-muted-foreground">
            © 2025 TrekMind. Adventure responsibly. AI features are for guidance and can make mistakes. Please check routes and recommendations thoroughly.
          </p>
        </div>
      </footer>
    </div>
  );
}