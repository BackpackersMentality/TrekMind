// GlobeIntegration.tsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { useLocation } from 'wouter';
import { Loader2, AlertCircle, Plus, Minus } from 'lucide-react';
import { FilterButton } from './FilterButton';
import { FilterPopup } from './FilterPopup';
import { SearchButton } from './SearchButton';
import { SearchPopup } from './SearchPopup';
import { TrekPreviewPanel } from './TrekPreviewPanel';
import { getAllTreks } from '@/lib/treks';
import { type FilterState, countActiveFilters } from '../types/filters';

interface GlobeIntegrationProps {
  height?: string;
  className?: string;
}

const GLOBE_URL    = "https://trekmind-globe-app.pages.dev/?embed=true&hideCards=true";
const GLOBE_ORIGIN = "https://trekmind-globe-app.pages.dev";

export function GlobeIntegration({ height = "100%", className = "" }: GlobeIntegrationProps) {
  const [isLoading, setIsLoading]       = useState(true);
  const [hasError, setHasError]         = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState<any | null>(null);

  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const allTreks = useMemo(() => getAllTreks(), []);

  const { tier, region, accommodation, terrain, duration, popularity,
          setTier, setRegion, setAccommodation, setTerrain, setDuration, setPopularity
        } = useFilterStore();

  const currentFilters: FilterState = useMemo(() => ({
    tier, region, accommodation, terrain, duration, popularity,
  }), [tier, region, accommodation, terrain, duration, popularity]);

  const activeFilterCount = useMemo(
    () => countActiveFilters(currentFilters),
    [currentFilters]
  );

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    setTier(newFilters.tier);
    setRegion(newFilters.region);
    setAccommodation(newFilters.accommodation);
    setTerrain(newFilters.terrain);
    setDuration(newFilters.duration);
    setPopularity(newFilters.popularity);
    setIsFilterOpen(false);
  }, [setTier, setRegion, setAccommodation, setTerrain, setDuration, setPopularity]);

  const sendToGlobe = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, GLOBE_ORIGIN);
  }, []);

  const handleZoomIn  = useCallback(() => sendToGlobe({ type: "TREKMIND_ZOOM_IN" }),  [sendToGlobe]);
  const handleZoomOut = useCallback(() => sendToGlobe({ type: "TREKMIND_ZOOM_OUT" }), [sendToGlobe]);

  useEffect(() => {
    const preventPageZoom = (e: WheelEvent) => {
      if ((e.ctrlKey || e.metaKey) && containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('wheel', preventPageZoom, { passive: false });
    document.addEventListener('touchmove', preventPinchZoom, { passive: false });
    return () => {
      document.removeEventListener('wheel', preventPageZoom);
      document.removeEventListener('touchmove', preventPinchZoom);
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "TREK_SELECTED_FROM_GLOBE") {
        const payload = event.data.payload;
        if (Array.isArray(payload)) {
          const found = payload
            .map((p: any) => allTreks.find(t => t.id === p.id))
            .filter(Boolean);
          if (found.length > 0) setSelectedTrek(found.length === 1 ? found[0] : found);
        }
      }
      if (event.data?.type === "TREK_DESELECTED_FROM_GLOBE") {
        setSelectedTrek(null);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [allTreks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      sendToGlobe({ type: "TREKMIND_FILTER_UPDATE", payload: currentFilters });
    }, 300);
    return () => clearTimeout(timer);
  }, [currentFilters, sendToGlobe]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    sendToGlobe({ type: "TREKMIND_FILTER_UPDATE", payload: currentFilters });
  }, [currentFilters, sendToGlobe]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-muted ${className}`}
      style={{ height, touchAction: 'none' }}
    >
      {/* Globe iframe — full size, always underneath */}
      <iframe
        ref={iframeRef}
        src={GLOBE_URL}
        className={`absolute inset-0 w-full h-full border-none transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        title="TrekMind Interactive Globe"
        onLoad={handleLoad}
        onError={() => { setIsLoading(false); setHasError(true); }}
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; clipboard-write; encrypted-media; picture-in-picture"
      />

      {/* ── UI OVERLAYS — each positioned individually, no full-size wrapper ──
          Previously: a full-size pointer-events-auto div wrapped TrekPreviewPanel,
          which intercepted ALL clicks on the globe iframe (markers, ocean clicks).
          Now: each overlay is positioned directly and only occupies its own space. */}

      {/* Trek Preview Panel — top-left, only covers its own 320px width */}
      {selectedTrek && (
        <TrekPreviewPanel
          trek={selectedTrek}
          onClose={() => setSelectedTrek(null)}
        />
      )}

      {/* Filter button — top-right */}
      <div className="absolute top-4 right-4 z-20">
        <FilterButton activeCount={activeFilterCount} onClick={() => setIsFilterOpen(true)} />
      </div>

      {/* Search button — bottom-left */}
      <div className="absolute bottom-4 left-4 z-20">
        <SearchButton onClick={() => setIsSearchOpen(true)} />
      </div>

      {/* Zoom controls — bottom-right */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="flex flex-col bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <button onClick={handleZoomIn}  className="p-3 hover:bg-muted transition-colors border-b border-border" aria-label="Zoom in"><Plus  className="w-5 h-5" /></button>
          <button onClick={handleZoomOut} className="p-3 hover:bg-muted transition-colors" aria-label="Zoom out"><Minus className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Popups — rendered via portal in FilterPopup/SearchPopup so z-index is fine */}
      <FilterPopup
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={currentFilters}
        onApply={handleApplyFilters}
      />
      <SearchPopup
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onTrekSelect={(id) => {
          const trek = allTreks.find(t => t.id === id || (t as any).slug === id);
          if (trek) setSelectedTrek(trek);
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm pointer-events-none">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Initializing Global Routes...</p>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted p-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Globe Failed to Load</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We're having trouble connecting to the interactive visualization.
          </p>
        </div>
      )}
    </div>
  );
}
