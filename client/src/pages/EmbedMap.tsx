// client/src/pages/EmbedMap.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Route: /embed/:id
//
// A completely bare-canvas page — no navbar, footer, sidebar, or CookieBanner.
// Designed to be iframed into backpackersmentality.com blog posts.
//
// Features:
//   • 100vw × 100vh map — no chrome at all
//   • scrollZoom disabled — prevents scroll trap on desktop
//   • dragPan disabled on touch — prevents page-scroll trap on mobile
//   • frame-ancestors CSP enforced via _headers (see public/_headers)
// ─────────────────────────────────────────────────────────────────────────────

import { useRoute }             from "wouter";
import { Suspense, lazy, useMemo, useEffect } from "react";
import { getTrekById, getItineraryAsync } from "@/lib/treks";
import { Mountain }             from "lucide-react";
import { Helmet }               from "react-helmet-async";
import { useState }             from "react";

// Load RouteMap lazily — same chunk as TrekDetail so no double-download if user
// visited a trek page first
const RouteMap = lazy(() => import("@/components/RouteMap"));

// ── Minimal loading state ────────────────────────────────────────────────────
function MapLoading() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-white/60">
        <Mountain className="w-8 h-8 animate-pulse" />
        <span className="text-sm font-medium tracking-wide">Loading route…</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EmbedMap() {
  const [, params] = useRoute("/embed/:id");
  const trekId     = params?.id ?? "";

  const trek = useMemo(() => getTrekById(trekId), [trekId]);

  const [itinerary, setItinerary] = useState<any[]>([]);

  // Fetch itinerary waypoints exactly as TrekDetail does
  useEffect(() => {
    if (!trekId) return;
    let cancelled = false;
    getItineraryAsync(trekId).then(data => {
      if (!cancelled) setItinerary(data ?? []);
    });
    return () => { cancelled = true; };
  }, [trekId]);

  // ── 404 guard ───────────────────────────────────────────────────────────────
  if (!trek) {
    return (
      <div className="w-screen h-screen bg-slate-900 flex items-center justify-center text-white">
        <p className="text-sm text-white/60">Trek not found: <code>{trekId}</code></p>
      </div>
    );
  }

  return (
    <>
      {/* ── SEO / iframe title ────────────────────────────────────────────── */}
      <Helmet>
        <title>{trek.name} — TrekMind Interactive Route Map</title>
        {/* Prevent this embed page from appearing in search results */}
        <meta name="robots" content="noindex, nofollow" />
        {/*
          frame-ancestors is set via HTTP header in public/_headers (see that file).
          The meta http-equiv equivalent below is a belt-and-suspenders fallback
          for browsers that read meta CSP, though real CSP must come from headers.
        */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="frame-ancestors https://backpackersmentality.com https://www.backpackersmentality.com"
        />
      </Helmet>

      {/*
        ── Root container ──────────────────────────────────────────────────────
        overflow:hidden prevents any accidental scroll on the outer shell.
        position:fixed pins it fully regardless of browser chrome on mobile.
      */}
      <div
        style={{
          position:   "fixed",
          inset:      0,
          width:      "100vw",
          height:     "100vh",
          overflow:   "hidden",
          background: "#0d1b2e",
        }}
      >
        {/* ── Map — fills 100% of the container ─────────────────────────── */}
        <Suspense fallback={<MapLoading />}>
          <RouteMap
            stops={itinerary}
            trek={trek}
            // ── Step 3: embed-specific map options ───────────────────────
            // Passed as a prop to RouteMap (see RouteMap.tsx changes below).
            // scrollZoom: false  — mouse wheel won't zoom the map (desktop scroll trap)
            // touchPitch: false  — disables two-finger pitch on touch
            // dragPan on touch:  — disabled in RouteMap via the embedMode flag
            embedMode={true}
          />
        </Suspense>

        {/* ── TrekMind branding watermark — bottom-left ─────────────────── */}
        <a
          href="https://www.trekmind.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position:       "absolute",
            bottom:         "8px",
            left:           "10px",
            zIndex:         10,
            display:        "flex",
            alignItems:     "center",
            gap:            "5px",
            padding:        "4px 8px",
            borderRadius:   "6px",
            backgroundColor:"rgba(13,27,46,0.75)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            color:          "rgba(255,255,255,0.7)",
            fontSize:       "10px",
            fontWeight:     600,
            textDecoration: "none",
            letterSpacing:  "0.04em",
          }}
        >
          <Mountain style={{ width: 10, height: 10 }} />
          TrekMind
        </a>
      </div>
    </>
  );
}
