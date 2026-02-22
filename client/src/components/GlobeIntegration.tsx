import { useState, useEffect, useRef, useMemo } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { useLocation } from 'wouter';
import { Loader2, AlertCircle, Plus, Minus, X } from 'lucide-react';
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

const GLOBE_URL = "https://6e90758d.trekmind-globe-app.pages.dev/?embed=true&hideCards=true";

export function GlobeIntegration({ height = "100vh", className = "" }: GlobeIntegrationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState<any | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
    const trek = treks.find(t => t.id === id || (t as any).slug === id);
    if (trek) {
      setSelectedTrek(trek);
    }
  };

  const handleZoomIn = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "TREKMIND_ZOOM_IN" },
      "https://6e90758d.trekmind-globe-app.pages.dev"
    );
  };

  const handleZoomOut = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "TREKMIND_ZOOM_OUT" },
      "https://6e90758d.trekmind-globe-app.pages.dev"
    );
  };

  // Prevent page zoom, only allow globe zoom
  useEffect(() => {
    const preventPageZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // This is a zoom gesture
        if (containerRef.current?.contains(e.target as Node)) {
          e.preventDefault();
          // Let the iframe handle the zoom
        }
      }
    };

    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
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
      // Only accept messages from our globe URL
      if (event.origin !== "https://6e90758d.trekmind-globe-app.pages.dev") return;

      if (event.data?.type === "TREK_SELECTED_FROM_GLOBE") {
        const { id } = event.data.payload;
        if (id) handleTrekSelect(id);
      }

      // Clear selection when empty globe is clicked
      if (event.data?.type === "TREK_DESELECTED_FROM_GLOBE") {
        setSelectedTrek(null);
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
        }, "https://6e90758d.trekmind-globe-app.pages.dev");
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
      }, "https://6e90758d.trekmind-globe-app.pages.dev");
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-muted ${className}`} 
      style={{ height, touchAction: 'none' }}
    >
      {/* TOP RIGHT: Filter Button */}
      <div className="absolute top-4 right-4 z-20">
        <FilterButton 
          activeCount={activeFilterCount}
          onClick={() => setIsFilterOpen(true)}
        />
      </div>

      {/* BOTTOM LEFT: Search Button */}
      <div className="absolute bottom-4 left-4 z-20">
        <SearchButton 
          onClick={() => setIsSearchOpen(true)}
        />
      </div>

      {/* BOTTOM RIGHT: Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="flex flex-col bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="p-3 hover:bg-muted transition-colors border-b border-border"
            aria-label="Zoom in"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="p-3 hover:bg-muted transition-colors"
            aria-label="Zoom out"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
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

      {/* Trek Preview Panel with Close Button */}
      {selectedTrek && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <div className="relative w-full h-full pointer-events-auto">
            <TrekPreviewPanel 
              trek={selectedTrek}
              onClose={() => setSelectedTrek(null)}
            />
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
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}
