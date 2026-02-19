import { useState, useEffect, useRef, useMemo } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { useLocation } from 'wouter';
import { Loader2, AlertCircle } from 'lucide-react';
import { FilterButton } from './FilterButton';
import { FilterPopup } from './FilterPopup';
import { SearchButton } from './SearchButton';
import { SearchPopup } from './SearchPopup';
import { TrekPreviewPanel } from './TrekPreviewPanel';
import { getAllTreks } from '@/lib/treks';
import type { FilterState } from '../types/filters';;

interface GlobeIntegrationProps {
  height?: string;
  className?: string;
}

const GLOBE_URL = "https://5f451930.trekmind-globe-app.pages.dev/?embed=true";

export function GlobeIntegration({ height = "80vh", className = "" }: GlobeIntegrationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState<any | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [, setLocation] = useLocation();

  const tier = useFilterStore((state) => state.tier);
  const region = useFilterStore((state) => state.region);
  const accommodation = useFilterStore((state) => state.accommodation);
  const duration = useFilterStore((state) => state.duration);
  const difficulty = useFilterStore((state) => state.difficulty);
  const setTier = useFilterStore((state) => state.setTier);
  const setRegion = useFilterStore((state) => state.setRegion);
  const setAccommodation = useFilterStore((state) => state.setAccommodation);
  const setDuration = useFilterStore((state) => state.setDuration);
  const setDifficulty = useFilterStore((state) => state.setDifficulty);

  const currentFilters: FilterState = useMemo(() => ({
    tier: tier === null ? "ALL" : String(tier) as any,
    region: (region || "ALL") as any,
    accommodation: (accommodation || "ALL") as any,
    duration: (duration || "ALL") as any,
    difficulty: (difficulty || "ALL") as any
  }), [tier, region, accommodation, duration, difficulty]);

  const activeFilterCount = Object.values(currentFilters).filter(v => v !== "ALL").length;

  const handleApplyFilters = (newFilters: FilterState) => {
    setTier(newFilters.tier === "ALL" ? null : parseInt(newFilters.tier) as any);
    setRegion(newFilters.region === "ALL" ? null : newFilters.region);
    setAccommodation(newFilters.accommodation === "ALL" ? null : newFilters.accommodation);
    setDuration(newFilters.duration === "ALL" ? null : newFilters.duration);
    setDifficulty(newFilters.difficulty === "ALL" ? null : newFilters.difficulty);
    setIsFilterOpen(false);
  };

  const handleTrekSelect = (id: string) => {
    const treks = getAllTreks();
    const trek = treks.find(t => t.id === id || t.slug === id);
    if (trek) {
      setSelectedTrek(trek);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://5f451930.trekmind-globe-app.pages.dev") return;

      if (event.data?.type === "TREK_SELECTED_FROM_GLOBE") {
        const { id } = event.data.payload;
        if (id) handleTrekSelect(id);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const sendUpdate = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: "TREKMIND_FILTER_UPDATE",
          payload: currentFilters
        }, "https://5f451930.trekmind-globe-app.pages.dev");
      }
    };
    const timer = setTimeout(sendUpdate, 300);
    return () => clearTimeout(timer);
  }, [currentFilters]);

  const handleLoad = () => {
    setIsLoading(false);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: "TREKMIND_FILTER_UPDATE",
        payload: currentFilters
      }, "https://5f451930.trekmind-globe-app.pages.dev");
    }
  };

  return (
    <div 
      className={`relative w-full overflow-hidden bg-muted transition-all duration-500 ${className}`} 
      style={{ height }}
    >
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
        <FilterButton 
          activeCount={activeFilterCount}
          onClick={() => setIsFilterOpen(true)}
        />
        <SearchButton 
          onClick={() => setIsSearchOpen(true)}
        />
      </div>

      <FilterPopup 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={currentFilters}
        onApply={handleApplyFilters}
      />

      <SearchPopup 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onTrekSelect={handleTrekSelect}
      />

      <TrekPreviewPanel 
        trek={selectedTrek}
        onClose={() => setSelectedTrek(null)}
      />

      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Initializing Global Routes...</p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted p-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Globe Failed to Load</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We're having trouble connecting to the interactive visualization. 
          </p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={GLOBE_URL}
        className={`w-full h-full border-none transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        title="TrekMind Interactive Globe"
        onLoad={handleLoad}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; clipboard-write; encrypted-media; picture-in-picture"
      />
    </div>
  );
}
