import { useState } from 'react';
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Ruler, Mountain, Calendar, ArrowRight, X } from "lucide-react";
import { getTrekImageUrl } from '@/lib/images';
import { CompareToggle } from "@/components/compare/CompareToggle";
import { useCompareStore } from "@/store/compareStore";
import type { CompareTrek } from "@/store/compareStore";

// Map the raw trek data shape to the CompareTrek interface the store expects.
// Kept as a plain function (not a hook) so it's safe to call in render.
function toCompareTrek(trek: any): CompareTrek {
  return {
    id:              trek.id,
    name:            trek.name,
    region:          trek.region,
    country:         trek.country,
    terrain:         trek.terrain,
    accommodation:   trek.accommodation,
    distance:        trek.distance ?? `${trek.distanceKm ?? "?"}km`,
    totalDays:       trek.totalDays ?? `${trek.durationDays ?? "?"} days`,
    maxAltitude:     trek.maxAltitude ?? trek.maxAltitudeM ?? "N/A",
    season:          trek.season ?? trek.bestSeason ?? trek.best_season ?? "Year-round",
    permits:         trek.permits ?? "Not required",
    popularityScore: trek.popularityScore ?? 0,
    tier:            trek.tier ?? 1,
    durationBucket:  trek.durationBucket ?? "Medium",
    budget:          trek.budget,
    costNotes:       trek.costNotes,
    costIndependent: trek.costIndependent,
    keyFeatures:     trek.keyFeatures,
    imageFilename:   trek.imageFilename,
  };
}

export function TrekCard({ trek, onClose, fromCards }: { trek: any; onClose?: () => void; fromCards?: boolean }) {
  const [imgError, setImgError] = useState(false);

  // Subscribe to compare state so the card border highlight updates reactively
  // when the user toggles this trek in or out of the comparison set.
  const isSelected = useCompareStore(s => s.selectedTreks.some(t => t.id === trek.id));

  const compareTrek = toCompareTrek(trek);

  return (
    <Link href={`/trek/${trek.id}${fromCards ? '?from=cards' : ''}`} className="group block h-full">
      <Card
        className={`overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col relative
          ${isSelected
            ? "border-primary/60 shadow-primary/10 shadow-md ring-1 ring-primary/20"
            : "border-border"
          }`}
      >
        {/* ── Close button — only shown when onClose prop is provided ── */}
        {onClose && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 left-3 z-50 w-8 h-8 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-colors shadow-lg"
            aria-label="Close and return to globe"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}

        {/* ── Compare toggle ─────────────────────────────────────────────────
            Positioned top-left when there's no close button, top-right when
            there is (to avoid overlap). Hidden on desktop until card hover,
            always visible on mobile (touch users can't hover).
            The wrapping div intercepts click/touch events so they don't
            bubble up to the <Link> and navigate to the detail page.        ── */}
        <div
          className={`absolute z-40 transition-opacity duration-200
            ${onClose ? "top-3 right-3" : "top-3 left-3"}
            opacity-100 sm:opacity-0 sm:group-hover:opacity-100`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <CompareToggle trek={compareTrek} />
        </div>

        {/* Header: Trek Name */}
        <div className="p-4 border-b bg-card/50">
          <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
            {trek.name}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground text-[10px] uppercase tracking-wider">
            <MapPin className="w-3 h-3" />
            {trek.region}, {trek.country}
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imgError ? '/images/placeholder-trek.jpg' : getTrekImageUrl(trek.imageFilename)}
            alt={trek.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            width={400}
            height={192}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-black border-none text-[10px]">
              {trek.terrain}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary/90 text-primary-foreground text-[10px] uppercase tracking-wider">
              <Calendar className="w-3 h-3 mr-1" /> {trek.season || trek.best_season || "Year Round"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
              <Clock className="w-3.5 h-3.5 text-primary mb-1" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Days</span>
              <span className="text-xs font-bold">{trek.totalDays}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
              <Ruler className="w-3.5 h-3.5 text-primary mb-1" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">KM</span>
              <span className="text-xs font-bold">{trek.distance}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
              <Mountain className="w-3.5 h-3.5 text-primary mb-1" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Max Alt</span>
              <span className="text-xs font-bold">{trek.maxAltitude || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center justify-end text-primary text-xs font-bold group-hover:translate-x-1 transition-transform">
            View Journey <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
