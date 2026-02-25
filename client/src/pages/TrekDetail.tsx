import { getTrekById, getItinerary, getEditorialContent } from "@/lib/treks";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, MapPin, Calendar, Mountain, Ruler, AlertTriangle,
  Clock, Activity, TrendingUp, Info, Sparkles, CheckCircle2, Bed, Tent, Home, Building2, Map as MapIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect, Suspense, lazy } from "react";
import { GearAssistant } from "@/components/GearAssistant";
import { getTrekImageUrl } from '@/lib/images';

// ✅ FIX: Correct import path
const RouteMap = lazy(() => import("@/components/RouteMap"));

export default function TrekDetail() {
  const [, params] = useRoute("/trek/:id");
  const trekId = params?.id;
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [trekId]);

  const trek = useMemo(() => trekId ? getTrekById(trekId) : null, [trekId]);
  const itinerary = useMemo(() => trekId ? getItinerary(trekId) : null, [trekId]);
  const editorial = useMemo(() => trekId ? getEditorialContent(trekId) : null, [trekId]);

  if (!trek) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-2xl font-bold text-foreground">Trek not found</h1>
        <Link href="/">
          <Button variant="ghost">Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full group overflow-hidden">
        <img
          src={imgError ? '/images/placeholder-trek.jpg' : getTrekImageUrl(trek.imageFilename)}
          alt={trek.name}
          loading="lazy" 
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
        
        <div className="absolute top-4 left-4 z-50">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
          <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="backdrop-blur-sm bg-white/90 text-black">{trek.terrain}</Badge>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-black/40 text-white backdrop-blur-md border border-white/20">
                <Calendar className="w-3.5 h-3.5" /> Best: {trek.season || trek.bestSeason || trek.best_season || "Year Round"}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
              {trek.name}
            </h1>
            
            <div className="flex items-center text-white/90 text-lg font-light gap-2">
              <MapPin className="w-5 h-5" />
              {trek.region}, {trek.country}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Stats Grid */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <StatItem icon={Clock} label="Duration" value={trek.totalDays || `${trek.durationDays} Days`} />
              <StatItem icon={Activity} label="Distance" value={trek.distance || `${trek.distanceKm}km`} />
              <StatItem icon={Mountain} label="Max Alt" value={`${trek.maxAltitude || trek.maxAltitudeM || "N/A"}m`} highlight={(trek.maxAltitude || trek.maxAltitudeM || 0) > 4000} />
              <StatItem icon={TrendingUp} label="Daily Avg" value={`${Math.round(parseInt(trek.distance || String(trek.distanceKm)) / parseInt(trek.totalDays || String(trek.durationDays)))} km`} />
            </div>

            {/* Accommodation & Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" /> Accommodation
                </h3>
                <div className="bg-secondary/20 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-background rounded-lg shadow-sm">
                      {trek.accommodation === "Camping" ? <Tent className="w-4 h-4 text-primary" /> : 
                       trek.accommodation === "Teahouses" ? <Home className="w-4 h-4 text-primary" /> :
                       <Building2 className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{trek.accommodation}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" /> Risk Factors
                </h3>
                <div className="flex flex-wrap gap-3">
                  {trek && (trek.maxAltitude || trek.maxAltitudeM || 0) > 3000 && <Badge variant="destructive">Altitude Risk</Badge>}
                  {trek && (trek.permits === "Required" || trek.permits === "Restricted") && <Badge variant="secondary">Permit Required</Badge>}
                </div>
              </div>
            </div>

            {/* Why This Trek Is Special & Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
              {editorial?.whySpecial && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" /> Why This Trek Is Special
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg italic">
                    {editorial.whySpecial}
                  </p>
                </div>
              )}

              {editorial?.highlights && editorial.highlights.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-primary" /> Highlights
                  </h3>
                  <ul className="grid grid-cols-1 gap-3">
                    {editorial.highlights.map((highlight: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Route Map */}
            {itinerary && itinerary.length > 0 && (
              <div className="space-y-6 pt-8 border-t">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <MapIcon className="w-6 h-6 text-primary" /> Interactive Route Map
                </h3>
                <Suspense fallback={
                  <div className="w-full h-[400px] bg-muted animate-pulse rounded-xl flex items-center justify-center">
                    <p className="text-muted-foreground">Loading interactive map...</p>
                  </div>
                }>
                  <RouteMap stops={itinerary as any} />
                </Suspense>
              </div>
            )}

            {/* Itinerary */}
            {itinerary && itinerary.length > 0 && (
              <div className="space-y-6 pt-8 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" /> Day-by-Day Itinerary
                  </h3>
                  <span className="text-sm text-muted-foreground">{itinerary.length} Days</span>
                </div>
                
                <div className="space-y-4">
                  {itinerary.map((day: any) => (
                    <ItineraryItem key={day.day} day={day} />
                  ))}
                </div>
              </div>
            )}

            {/* Gear Assistant */}
            <div className="space-y-6 pt-8 border-t">
              <h3 className="text-2xl font-bold">Recommended Gear</h3>
              <GearAssistant
                trekName={trek.name}
                difficulty={trek.terrain} 
                maxAltitude={trek.maxAltitude || trek.maxAltitudeM || 0}
                durationDays={parseInt(trek.totalDays || String(trek.durationDays))}
                accommodationType={trek.accommodation}
                campingRequired={trek.accommodation === "Camping"}
              />
            </div>

            {/* Disclaimer */}
            <div className="pt-12 border-t mt-12">
              <div className="bg-muted/30 rounded-lg p-4 flex gap-3 items-start border border-border/50">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Disclaimer: Trek itineraries, risk information, and gear recommendations provided by TrekMind are AI-generated and intended for planning inspiration only. Details may be incomplete or inaccurate. Always verify routes, permits, weather conditions, and equipment with official sources or certified guides. TrekMind has no affiliation with any gear brands mentioned.
                </p>
              </div>
            </div>
            
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <div className="sticky top-24">
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Pro Tip
                </h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Always acclimatize properly. The golden rule is "climb high, sleep low". 
                  Hydration is key at {trek.maxAltitude || trek.maxAltitudeM}m altitude.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, highlight = false }: { icon: any, label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <span className={cn("text-2xl font-bold", highlight ? "text-destructive" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

function ItineraryItem({ day }: { day: any }) {
  const isHardDay = (parseFloat(day.maxAltM || day.maxAlt || day.elevation) > 4500) || (parseFloat(day.distanceKm || day.distance) > 20);

  return (
    <div className="group">
      <div 
        className={cn(
          "bg-card rounded-xl border border-border transition-all duration-200 hover:shadow-md",
          isHardDay && "border-l-4 border-l-orange-500"
        )}
      >
        <div className="w-full flex items-center gap-4 p-4 text-left">
          <div className={cn(
            "flex flex-col items-center justify-center w-12 h-12 rounded-lg font-bold shrink-0 transition-colors",
            isHardDay ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"
          )}>
            <span className="text-xs uppercase text-[10px]">Day</span>
            <span className="text-lg leading-none">{day.day}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-foreground truncate">{day.route || day.location}</h4>
              {isHardDay && (
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Challenging
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
              {(day.distanceKm || day.distance) && <span className="flex items-center gap-1">Distance: {day.distanceKm || day.distance}km</span>}
              {(day.elevGainM || day.elevGain) && <span className="flex items-center gap-1">· ↑ Gain: {day.elevGainM || day.elevGain}m</span>}
              {(day.elevLossM || day.elevLoss) && <span className="flex items-center gap-1">· ↓ Loss: {day.elevLossM || day.elevLoss}m</span>}
              {(day.maxAltM || day.maxAlt || day.elevation) && <span className="flex items-center gap-1">· Alt: {day.maxAltM || day.maxAlt || day.elevation}m</span>}
            </div>
          </div>
        </div>

        <div className="px-4 pb-5 pt-0 ml-[4.5rem] border-l border-dashed border-border/50 pl-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {day.notes || day.overnightStay || "No additional notes for this day."}
          </p>
        </div>
      </div>
    </div>
  );
}
