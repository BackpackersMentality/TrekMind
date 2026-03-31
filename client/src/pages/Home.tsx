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

// Lazy-load GlobeIntegration into its own chunk \u2014 breaks the circular
// import chain between Home \u2192 GlobeIntegration \u2192 FilterButton/SearchButton
// \u2192 filter types that caused the TDZ ReferenceError on bundle initialisation.
const GlobeIntegrationLazy = lazy(() =>
  import("@/components/GlobeIntegration").then(m => ({ default: m.GlobeIntegration }))
);

// Kick off the GlobeIntegration chunk download immediately at module evaluation
// time \u2014 so by the time the user navigates back from TrekDetail, the chunk is
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

  // \u2500\u2500 FIX: Pull the unified `filters` object and `setFilters` from the store.
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
      console.error("[TrekMind] filterTreks threw an error \u2014 returning unfiltered list:", e);
      return safeTreks;
    }
  }, [treks, filters]);

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    // \u2500\u2500 FIX: Use setFilters (single call) instead of individual non-existent setters.
    setFilters(newFilters);
    setIsFilterOpen(false);
  }, [setFilters]);

  return (
    <div className="bg-background relative flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      <Helmet>
        <title>TrekMind \u2014 Discover the World's Best Trekking Routes</title>
        <meta name="description" content="Explore the world's most breathtaking trekking routes on an interactive 3D globe. Filter by region, terrain, duration and difficulty. Find your next great adventure." />
        <meta name="keywords" content="trekking routes, hiking trails, best treks, adventure travel, trekking guide, hiking app" />
        <link rel="canonical" href="https://tre