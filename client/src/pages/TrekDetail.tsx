// TrekDetail.tsx — optimised for performance
//
// Key changes:
// 1. Hero image: loading='eager' + fetchpriority='high' (was lazy — killed LCP score)
// 2. Itinerary + editorial: fetched async via getItineraryAsync() (was sync 212KB import)
// 3. Waypoints passed to RouteMap from fetched data (not imported globally)
// 4. Map Suspense fallback matches actual map height (prevents CLS)
// 5. useEffect deps tightened

import { getTrekById, getItineraryAsync, getEditorialContentAsync } from "@/lib/treks";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskTag, getRiskTags } from "@/components/RiskTag";
import {
  ChevronLeft, MapPin, Calendar, Mountain, Bookmark, BookOpen, ExternalLink,
  Clock, Activity, TrendingUp, Info, Sparkles, CheckCircle2,
  Bed, Tent, Home, Building2, AlertTriangle
, Share2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect, useRef, Suspense, lazy } from "react";
import { GearAssistant } from "@/components/GearAssistant";
import { getTrekImageUrl } from "@/lib/images";
import { Helmet } from "react-helmet-async";
import { useTrekList } from "@/hooks/useTrekList";

const RouteMap = lazy(() => import("@/components/RouteMap"));

// ── Map skeleton ──────────────────────────────────────────────────────────────
function MapSkeleton() {
  return (
    <div className="w-full h-[500px] rounded-xl bg-muted/40 animate-pulse flex items-center justify-center border border-border">
      <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        <span>Loading map…</span>
      </div>
    </div>
  );
}

// ── Elevation Profile ─────────────────────────────────────────────────────────
// Reads maxAltM / maxAlt / elevation per itinerary day and draws a smooth
// area chart using a <canvas> element — no extra dependencies needed.
function ElevationProfile({ itinerary }: { itinerary: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Extract altitude values from itinerary days
  const altData = useMemo(() => {
    return itinerary
      .map(day => {
        const raw = day.maxAltM ?? day.maxAlt ?? day.elevation ??
          day.maxElevation ?? day.elevationM ?? day.altM ?? day.alt ??
          day.altitude ?? day.highPoint ?? null;
        return raw !== null ? parseFloat(String(raw).replace(/[^\d.]/g, "")) : null;
      })
      .filter((v): v is number => v !== null && !isNaN(v));
  }, [itinerary]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || altData.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = { top: 28, right: 16, bottom: 36, left: 52 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top  - pad.bottom;

    const minV = Math.min(...altData);
    const maxV = Math.max(...altData);
    const range = maxV - minV || 1;

    // Helpers
    const xOf = (i: number) => pad.left + (i / (altData.length - 1)) * chartW;
    const yOf = (v: number) => pad.top + chartH - ((v - minV) / range) * chartH;

    // Background
    ctx.clearRect(0, 0, W, H);

    // Horizontal grid lines + y-axis labels
    const gridCount = 4;
    for (let g = 0; g <= gridCount; g++) {
      const y    = pad.top + (g / gridCount) * chartH;
      const altV = Math.round(maxV - (g / gridCount) * range);
      ctx.strokeStyle = "rgba(156,163,175,0.15)";
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle   = "rgb(107,114,128)";
      ctx.font        = `10px system-ui`;
      ctx.textAlign   = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(altV.toLocaleString() + "m", pad.left - 6, y);
    }

    // Filled area gradient
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    gradient.addColorStop(0,   "rgba(59,130,246,0.35)");
    gradient.addColorStop(0.6, "rgba(59,130,246,0.12)");
    gradient.addColorStop(1,   "rgba(59,130,246,0.02)");

    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(altData[0]));
    for (let i = 1; i < altData.length; i++) {
      // smooth cubic bezier between points
      const x0 = xOf(i - 1), x1 = xOf(i);
      const y0 = yOf(altData[i - 1]), y1 = yOf(altData[i]);
      ctx.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1);
    }
    ctx.lineTo(xOf(altData.length - 1), pad.top + chartH);
    ctx.lineTo(xOf(0), pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Profile line
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(altData[0]));
    for (let i = 1; i < altData.length; i++) {
      const x0 = xOf(i - 1), x1 = xOf(i);
      const y0 = yOf(altData[i - 1]), y1 = yOf(altData[i]);
      ctx.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1);
    }
    ctx.strokeStyle = "rgb(59,130,246)";
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = "round";
    ctx.stroke();

    // Peak marker dot + label
    const peakIdx = altData.indexOf(maxV);
    const px = xOf(peakIdx), py = yOf(maxV);
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle   = "rgb(59,130,246)";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.fillStyle   = "rgb(30,58,138)";
    ctx.font        = "bold 10px system-ui";
    ctx.textAlign   = "center";
    ctx.textBaseline = "bottom";
    // nudge label above chart top if needed
    const labelY = py - 10 < pad.top ? py + 16 : py - 10;
    ctx.fillStyle = "rgb(59,130,246)";
    ctx.fillText(maxV.toLocaleString() + "m", px, labelY);

    // X-axis day labels — show first, last, and a few in between
    ctx.fillStyle    = "rgb(107,114,128)";
    ctx.font         = "10px system-ui";
    ctx.textBaseline = "top";
    const labelEvery = Math.max(1, Math.ceil(altData.length / 6));
    for (let i = 0; i < altData.length; i++) {
      if (i === 0 || i === altData.length - 1 || i % labelEvery === 0) {
        ctx.textAlign = i === 0 ? "left" : i === altData.length - 1 ? "right" : "center";
        ctx.fillText(`Day ${i + 1}`, xOf(i), pad.top + chartH + 6);
      }
    }
  }, [altData]);

  if (altData.length < 2) return null;

  const maxAlt  = Math.max(...altData);
  const gainPts = altData.filter((v, i) => i > 0 && v > altData[i - 1]);
  const totalGain = gainPts.reduce((acc, v, i) => {
    const idx = altData.indexOf(v); // find original index for gain calc
    return acc;
  }, 0);
  // simpler gain calc
  let gain = 0;
  for (let i = 1; i < altData.length; i++) {
    if (altData[i] > altData[i - 1]) gain += altData[i] - altData[i - 1];
  }

  return (
    <div className="space-y-3">
      {/* Summary stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Peak altitude",  value: `${maxAlt.toLocaleString()}m` },
          { label: "Start altitude", value: `${altData[0].toLocaleString()}m` },
          { label: "Total ascent",   value: `~${gain.toLocaleString()}m` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-muted/40 rounded-lg p-3 text-center border border-border/40">
            <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
            <div className="text-sm font-bold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      {/* Canvas chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: 180, display: "block" }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Altitude data is approximate — based on overnight stop elevations per day, not continuous GPS track.
      </p>
    </div>
  );
}


// ── Backpacker's Mentality trek guide links ────────────────────────────────────
// Only renders for the three treks that have matching full guides on BM.
const BM_GUIDES: Record<string, { url: string; title: string; description: string }> = {
  torres: {
    url: "https://backpackersmentality.com/ultimate-guide-to-the-torres-del-paine-o-circuit/",
    title: "Ultimate Guide to the Torres del Paine O Circuit",
    description: "Everything you need: permits, campsites, daily stages, weather, and what to pack for Patagonia.",
  },
  av4: {
    url: "https://backpackersmentality.com/alta-via-4-complete-7-day-high-altitude-trail-guide/",
    title: "Alta Via 4 — Complete 7-Day High Altitude Trail Guide",
    description: "Day-by-day stages, via ferrata sections, rifugio booking tips, and the best viewpoints on the route.",
  },
  annapurna: {
    url: "https://backpackersmentality.com/annapurna-circuit-trek-everything-you-need-for-an-epic-adventure/",
    title: "Annapurna Circuit — Everything You Need for an Epic Adventure",
    description: "Permits, teahouse costs, acclimatisation strategy, Thorong La crossing, and gear tested on the trail.",
  },
};

function PrepareSection({ trekId }: { trekId: string }) {
  const guide = BM_GUIDES[trekId];
  if (!guide) return null;

  return (
    <div className="pt-8 border-t">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Prepare for This Trek</h3>
      </div>
      <a
        href={guide.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded-xl p-4 transition-all duration-200"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">
            Full Trek Guide · Backpacker's Mentality
          </p>
          <p className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
            {guide.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {guide.description}
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-primary/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
      </a>
    </div>
  );
}

export default function TrekDetail() {
  const [, params] = useRoute("/trek/:id");
  const trekId = params?.id;
  const [imgError, setImgError] = useState(false);

  // Detect if user came from cards view — used by back button
  const fromCards = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('from') === 'cards';

  // ── Async data state ──────────────────────────────────────────────────────
  const [itinerary, setItinerary]   = useState<any[] | null>(null);
  const [editorial, setEditorial]   = useState<any | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => { window.scrollTo(0, 0); }, [trekId]);

  // ── Fetch itinerary + editorial on demand ─────────────────────────────────
  // isMounted ref prevents setState calls on an unmounted component when the
  // user navigates back before the async fetch resolves (React error #300).
  useEffect(() => {
    if (!trekId) return;
    let isMounted = true;

    setItinerary(null);
    setEditorial(null);
    setDataLoading(true);

    Promise.all([
      getItineraryAsync(trekId),
      getEditorialContentAsync(trekId),
    ]).then(([itin, ed]) => {
      if (!isMounted) return; // component unmounted — discard stale update
      setItinerary(itin);
      setEditorial(ed);
      setDataLoading(false);
    });

    return () => { isMounted = false; };
  }, [trekId]);

  const trek = useMemo(() => trekId ? getTrekById(trekId) : null, [trekId]);

  // ── ALL hooks must be called before any early return (Rules of Hooks) ──────
  const { getStatus, toggle } = useTrekList();
  const trekStatus = trek ? getStatus(trek.id) : null;
  const [bookmarkOpen, setBookmarkOpen] = useState(false);

  // ── SEO meta (safe to compute with null-guards) ────────────────────────────
  const pageTitle       = trek ? `${trek.name} Trek Guide — ${trek.country} | TrekMind` : "Trek not found | TrekMind";
  const pageDescription = trek ? `Plan your ${trek.name} trek in ${trek.country}. ${trek.totalDays}, ${trek.distance}, max altitude ${trek.maxAltitude || "N/A"}. ${trek.terrain} terrain in ${trek.region}.` : "";
  const pageUrl         = `https://trekmind.pages.dev/trek/${trekId}`;
  const pageImage       = trek ? getTrekImageUrl(trek.imageFilename) : "";

  if (!trek) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-2xl font-bold text-foreground">Trek not found</h1>
        <Link href="/"><Button variant="ghost">Return to Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords"    content={`${trek.name}, ${trek.country} trekking, ${trek.region} hiking, ${trek.terrain} trek, trekking routes`} />
        <link rel="canonical"    href={pageUrl} />
        {/* OpenGraph — controls how the link looks when shared on social */}
        <meta property="og:type"        content="article" />
        <meta property="og:url"         content={pageUrl} />
        <meta property="og:title"       content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image"       content={pageImage} />
        {/* card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image"       content={pageImage} />
        {/* JSON-LD structured data — helps Google show rich results */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          "name": trek.name,
          "description": pageDescription,
          "url": pageUrl,
          "image": pageImage,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": trek.country,
            "addressRegion": trek.region,
          },
          "touristType": "Trekking / Hiking",
        })}</script>
      </Helmet>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        {/*
          ✅ PERFORMANCE FIX: Hero image is above the fold — it IS the LCP element.
          loading='eager' + fetchpriority='high' tells the browser to prioritise
          this image over everything else. The original had loading='lazy' which
          actively told the browser to DEPRIORITISE the most important image.
        */}
        <img
          src={imgError ? "/images/placeholder-trek.jpg" : getTrekImageUrl(trek.imageFilename)}
          alt={trek.name}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
        {/* Subtle dark scrim so white text stays readable without fading the image */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Back button — top left */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => fromCards ? window.location.href = '/?view=cards' : window.history.back()}
            className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all shadow-lg"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        </div>

        {/* Bookmark button — top right */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setBookmarkOpen(o => !o)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border backdrop-blur-sm shadow-lg",
              trekStatus
                ? "bg-amber-500/80 border-amber-400/60 text-white shadow-lg shadow-amber-500/30"
                : "bg-black/40 border-white/20 text-white/70 hover:bg-black/60 hover:text-white"
            )}
            aria-label="Save trek"
          >
            <Bookmark className={cn("w-5 h-5 transition-all", trekStatus ? "fill-white" : "")} />
          </button>

          {/* Status popover */}
          {bookmarkOpen && (
            <div className="absolute top-12 right-0 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold px-1 mb-2">Save as</p>
              {[
                { status: "completed",  icon: "✓", label: "Completed",   cls: "hover:bg-amber-500/20 hover:text-amber-300",  activeCls: "bg-amber-500/25 text-amber-300 border-amber-500/40"  },
                { status: "inProgress", icon: "⟳", label: "In Progress", cls: "hover:bg-sky-500/20 hover:text-sky-300",      activeCls: "bg-sky-500/25 text-sky-300 border-sky-500/40"        },
                { status: "wishlist",   icon: "◇", label: "Bucket List", cls: "hover:bg-violet-500/20 hover:text-violet-300", activeCls: "bg-violet-500/25 text-violet-300 border-violet-500/40" },
              ].map(({ status, icon, label, cls, activeCls }) => {
                const isActive = trekStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => { toggle(trek.id, status as any); setBookmarkOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border text-left",
                      isActive ? activeCls + " border-opacity-100" : "border-transparent text-white/50 " + cls
                    )}
                  >
                    <span className="text-base w-4 text-center">{icon}</span>
                    <span>{label}</span>
                    {isActive && <span className="ml-auto text-xs opacity-60">✓</span>}
                  </button>
                );
              })}
              {trekStatus && (
                <button
                  onClick={() => { toggle(trek.id, trekStatus as any); setBookmarkOpen(false); }}
                  className="w-full mt-1 pt-2 border-t border-white/[0.06] text-[11px] text-white/25 hover:text-white/40 transition-colors text-center"
                >
                  Remove from list
                </button>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-16 left-0 right-0 p-6 md:p-8 max-w-5xl mx-auto">
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
            <div className="flex items-center text-white text-lg font-light gap-2">
              <MapPin className="w-5 h-5" />
              {trek.region}, {trek.country}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-12">

        {/* Stats Grid */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <StatItem icon={Clock}      label="Duration"  value={trek.totalDays || `${trek.durationDays} Days`} />
          <StatItem icon={Activity}   label="Distance"  value={trek.distance || `${trek.distanceKm}km`} />
          <StatItem icon={Mountain}   label="Max Alt"   value={`${trek.maxAltitude || trek.maxAltitudeM || "N/A"}`} highlight={(trek.maxAltitude || trek.maxAltitudeM || 0) > 4000} />
          <StatItem icon={TrendingUp} label="Daily Avg" value={`${Math.round(parseInt(trek.distance || String(trek.distanceKm)) / parseInt(trek.totalDays || String(trek.durationDays)))} km`} />
        </div>

        {/* Accommodation & Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Bed className="w-5 h-5 text-primary" /> Accommodation
            </h3>
            <div className="bg-secondary/20 rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg shadow-sm">
                  {trek.accommodation === "Camping"   ? <Tent      className="w-4 h-4 text-primary" /> :
                   trek.accommodation === "Teahouses" ? <Home      className="w-4 h-4 text-primary" /> :
                                                        <Building2 className="w-4 h-4 text-primary" />}
                </div>
                <span className="font-semibold text-foreground">{trek.accommodation}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" /> Risk Factors
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {getRiskTags(trek).map(type => (
                <RiskTag key={type} type={type} />
              ))}
              {getRiskTags(trek).length === 0 && (
                <p className="text-sm text-muted-foreground">No significant risk factors identified.</p>
              )}
            </div>
          </div>
        </div>

        {/* Why Special & Highlights — rendered once editorial loads */}
        {editorial && (editorial.whySpecial || editorial.highlights?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
            {editorial.whySpecial && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" /> Why This Trek Is Special
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg italic">{editorial.whySpecial}</p>
              </div>
            )}
            {editorial.highlights?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-primary" /> Highlights
                </h3>
                <ul className="grid grid-cols-1 gap-3">
                  {editorial.highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Interactive Route Map */}
        <div className="pt-8 border-t">
          <h2 className="text-2xl font-bold mb-2">Interactive Route Map</h2>
          {/*
            ✅ MapSkeleton matches h-[500px] — prevents CLS while Mapbox chunk downloads.
            RouteMap lazy chunk (~300KB) only downloads here, never on the homepage.
          */}
          <Suspense fallback={<MapSkeleton />}>
            {itinerary && itinerary.length > 0 ? (
              <RouteMap stops={itinerary} trek={trek} />
            ) : dataLoading ? (
              <MapSkeleton />
            ) : (
              <div className="w-full h-[500px] rounded-xl bg-muted/30 flex items-center justify-center border border-border">
                <p className="text-muted-foreground text-sm">No route data available for this trek.</p>
              </div>
            )}
          </Suspense>
        </div>

        {/* Elevation Profile — shown once itinerary data is loaded */}
        {itinerary && itinerary.length > 0 && itinerary.some((d: any) =>
            d.maxAltM ?? d.maxAlt ?? d.elevation ?? d.maxElevation ??
            d.elevationM ?? d.altM ?? d.alt ?? d.altitude ?? d.highPoint
          ) && (
          <div className="pt-8 border-t">
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Elevation Profile
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Altitude by day across the full route.
            </p>
            <ElevationProfile itinerary={itinerary} />
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

        {/* Loading state for itinerary */}
        {dataLoading && (
          <div className="space-y-4 pt-8 border-t">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
            ))}
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

        {/* Prepare for This Trek — only renders for the 3 BM-guided treks */}
        {trekId && <PrepareSection trekId={trekId} />}

        {/* ── Share This Trek ────────────────────────────────────────────── */}
        <div className="pt-8 border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground shrink-0">
              <Share2 className="w-4 h-4 text-primary" />
              Share this trek
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Twitter / X */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${trek.name} — ${trek.region}, ${trek.country}`)}&url=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
                aria-label="Share on X / Twitter"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X / Twitter
              </a>
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${trek.name} — ${trek.region}, ${trek.country} | TrekMind\n${pageUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
                aria-label="Share on WhatsApp"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              {/* */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1877F2] text-white hover:bg-[#166fe5] transition-colors"
                aria-label="Share on Facebook"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook
              </a>
              {/* Reddit */}
              <a
                href={`https://reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(`${trek.name} — ${trek.region}, ${trek.country}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FF4500] text-white hover:bg-[#e03d00] transition-colors"
                aria-label="Share on Reddit"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                Reddit
              </a>
              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pageUrl).then(() => {
                    const btn = document.getElementById('copy-link-btn');
                    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000); }
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span id="copy-link-btn">Copy Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-8 border-t">
          <div className="bg-muted/30 rounded-lg p-4 flex gap-3 items-start border border-border/50">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-muted-foreground/80">AI-generated content:</span> Trek itineraries, risk information, and gear recommendations are AI-generated and intended for planning inspiration only. Details may be incomplete or inaccurate. Always verify routes, permits, weather conditions, and equipment requirements with official sources or certified guides before setting out. TrekMind has no affiliation with any gear brands mentioned.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-muted-foreground/80">Route map:</span> The interactive map shows key waypoints and overnight stops only — it is not a navigation tool and should not be used in the field. For full trail maps and GPS tracks, use{" "}
                <a href="https://www.alltrails.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">AllTrails</a>,{" "}
                <a href="https://www.gaiagps.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">Gaia GPS</a>,
                {" "}or download the official GPX from the relevant trail authority.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value: string; highlight?: boolean }) {
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


// Strip any embedded unit suffix and re-add the correct one
// Prevents "12kmkm", "1200mm", "12 km km" from data inconsistencies
function stripUnit(val: string | number, unit: string): string {
  const cleaned = String(val).replace(/\s*(km|m|KM|M)$/i, "").trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return String(val); // fallback: return raw if unparseable
  return `${num % 1 === 0 ? num : num.toFixed(1)}${unit}`;
}
const fmtKm = (v: string | number) => stripUnit(v, "km");
const fmtM  = (v: string | number) => stripUnit(v, "m");

function ItineraryItem({ day }: { day: any }) {
  const isHardDay =
    parseFloat(day.maxAltM || day.maxAlt || day.elevation || "0") > 4500 ||
    parseFloat(day.distanceKm || day.distance || "0") > 20;

  return (
    <div className="group">
      <div className={cn(
        "bg-card rounded-xl border border-border transition-all duration-200 hover:shadow-md",
        isHardDay && "border-l-4 border-l-orange-500"
      )}>
        <div className="w-full flex items-center gap-4 p-4 text-left">
          <div className={cn(
            "flex flex-col items-center justify-center w-12 h-12 rounded-lg font-bold shrink-0",
            isHardDay ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"
          )}>
            <span className="text-[10px] uppercase">Day</span>
            <span className="text-lg leading-none">{day.day}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-foreground truncate">
                {day.overnight || day.route || day.location}
              </h4>
              {isHardDay && (
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                  Challenging
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
              {(day.distanceKm || day.distance) && <span>Distance: {fmtKm(day.distanceKm || day.distance)}</span>}
              {(day.elevGainM || day.elevGain) && <span>· ↑ {fmtM(day.elevGainM || day.elevGain)}</span>}
              {(day.elevLossM || day.elevLoss) && <span>· ↓ {fmtM(day.elevLossM || day.elevLoss)}</span>}
              {(day.maxAltM || day.maxAlt || day.elevation) && <span>· Alt: {fmtM(day.maxAltM || day.maxAlt || day.elevation)}</span>}
            </div>
          </div>
        </div>
        <div className="px-4 pb-5 pt-0 ml-[4.5rem] border-l border-dashed border-border/50 pl-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {day.mapNote || day.notes || day.overnightStay || "No additional notes for this day."}
          </p>
        </div>
      </div>
    </div>
  );
}
