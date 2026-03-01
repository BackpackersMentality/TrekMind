// GlobeIntegration.tsx — optimised
//
// Changes:
// 1. getAllTreks() called ONCE outside event handler (was called on every message)
// 2. treks array memoised with useMemo
// 3. Added error boundary fallback UI reference

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
import type { FilterState } from '../types/filters';

interface GlobeIntegrationProps {
  height?: string;
  className?: string;
}

const GLOBE_URL    = "https://trekmind-globe-app.pages.dev/?embed=true&hideCards=true";
const GLOBE_ORIGIN = "https://trekmind-globe-app.pages.dev";

export function GlobeIntegration({ height = "100%", className = "" }: GlobeIntegrationProps) {
  const [isLoading, setIsLoading]   = useState(true);
  const [hasError, setHasError]     = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState<any | null>(null);

  const iframeRef   = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  // ✅ Cache trek list — getAllTreks() reads JSON, no need to call it repeatedly
  const allTreks = useMemo(() => getAllTreks(), []);

  const { tier, region, accommodation, duration, difficulty,
          setTier, setRegion, setAccommodation, setDuration, setDifficulty } = useFilterStore();

  const currentFilters: FilterState = useMemo(() => ({
    tier:          tier === null ? "ALL" : String(tier) as any,
    region:        (region || "ALL") as any,
    accommodation: (accommodation || "ALL") as any,
    duration:      (duration || "ALL") as any,
    difficulty:    (difficulty || "ALL") as any,
  }), [tier, region, accommodation, duration, difficulty]);

  const activeFilterCount = useMemo(
    () => Object.values(currentFilters).filter(v => v !== "ALL").length,
    [currentFilters]
  );

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    setTier(newFilters.tier === "ALL" ? null : parseInt(newFilters.tier) as any);
    setRegion(newFilters.region === "ALL" ? null : newFilters.region);
    setAccommodation(newFilters.accommodation === "ALL" ? null : newFilters.accommodation);
    setDuration(newFilters.duration === "ALL" ? null : newFilters.duration);
    setDifficulty(newFilters.difficulty === "ALL" ? null : newFilters.difficulty);
    setIsFilterOpen(false);
  }, [setTier, setRegion, setAccommodation, setDuration, setDifficulty]);

  const sendToGlobe = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, GLOBE_ORIGIN);
  }, []);

  const handleZoomIn  = useCallback(() => sendToGlobe({ type: "TREKMIND_ZOOM_IN" }),  [sendToGlobe]);
  const handleZoomOut = useCallback(() => sendToGlobe({ type: "TREKMIND_ZOOM_OUT" }), [sendToGlobe]);

  // ── Prevent page zoom over globe area ──────────────────────────────────────
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

  // ── Message handler — uses cached allTreks, not re-fetched each time ───────
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "TREK_SELECTED_FROM_GLOBE") {
        const payload = event.data.payload;
        if (Array.isArray(payload)) {
          // ✅ Uses memoised allTreks — no repeated getAllTreks() calls
          const found = payload
            .map((p: any) => allTreks.find(t => t.id === p.id))
            .filter(Boolean);
          if (found.length > 0) setSelectedTrek(found);
        }
      }
      if (event.data?.type === "TREK_DESELECTED_FROM_GLOBE") setSelectedTrek(null);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [allTreks]);

  // ── Send filter updates to globe with debounce ─────────────────────────────
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
      <div className="absolute top-4 right-4 z-20">
        <FilterButton activeCount={activeFilterCount} onClick={() => setIsFilterOpen(true)} />
      </div>
      <div className="absolute bottom-4 left-4 z-20">
        <SearchButton onClick={() => setIsSearchOpen(true)} />
      </div>
      <div className="absolute bottom-4 right-4 z-20">
        <div className="flex flex-col bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <button onClick={handleZoomIn}  className="p-3 hover:bg-muted transition-colors border-b border-border" aria-label="Zoom in"><Plus  className="w-5 h-5" /></button>
          <button onClick={handleZoomOut} className="p-3 hover:bg-muted transition-colors" aria-label="Zoom out"><Minus className="w-5 h-5" /></button>
        </div>
      </div>

      <FilterPopup isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} currentFilters={currentFilters} onApply={handleApplyFilters} />
      <SearchPopup isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onTrekSelect={(id) => {
        const trek = allTreks.find(t => t.id === id || (t as any).slug === id);
        if (trek) setSelectedTrek(trek);
      }} />

      {selectedTrek && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <div className="relative w-full h-full pointer-events-auto">
            <TrekPreviewPanel trek={selectedTrek} onClose={() => setSelectedTrek(null)} />
          </div>
        </div>
      )}

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
        onError={() => { setIsLoading(false); setHasError(true); }}
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}
