// Top100.tsx — World's Top 100 Treks ranked list page
// Route: /top-100
// Scoring: composite of popularity, altitude drama, terrain, tier, uniqueness

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { getAllTreks } from "@/lib/treks";
import { getTrekImageUrl } from "@/lib/images";
import {
  ArrowLeft, Mountain, Clock, MapPin, ChevronRight,
  Star, Compass, Zap, Globe2, Gem, Filter
} from "lucide-react";

// ── Scoring helpers ───────────────────────────────────────────────────────────

function parseNum(raw: any): number {
  const m = String(raw ?? "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function altitudeDrama(trek: any): number {
  const alt = parseNum(trek.maxAltitude);
  // Graduated: meaningful from 2000m, maxes at 5500m+
  if (alt >= 5500) return 28;
  if (alt >= 5000) return 24;
  if (alt >= 4500) return 20;
  if (alt >= 4000) return 16;
  if (alt >= 3000) return 11;
  if (alt >= 2000) return 7;
  return 3;
}

function terrainScore(trek: any): number {
  const t = (trek.terrain + " " + trek.keyFeatures).toLowerCase();
  let s = 0;
  if (t.includes("glacier") || t.includes("glacial")) s += 4;
  if (t.includes("volcanic") || t.includes("volcano"))  s += 3;
  if (t.includes("canyon") || t.includes("gorge"))       s += 3;
  if (t.includes("tepui") || t.includes("plateau"))      s += 3;
  if (t.includes("arctic") || t.includes("fjord"))       s += 3;
  if (t.includes("alpine"))                              s += 2;
  if (t.includes("coast") || t.includes("coastal"))     s += 2;
  if (t.includes("jungle") || t.includes("rainforest")) s += 2;
  return Math.min(12, s);
}

function compositeScore(trek: any): number {
  const pop = (trek.popularityScore ?? 5);
  const tierBonus: Record<number, number> = { 1: 18, 2: 12, 3: 7, 4: 11 };
  const days = parseNum(trek.totalDays);
  // Accessibility bonus for sweet-spot 5-14 day treks (widest audience appeal)
  const accessBonus = days >= 5 && days <= 14 ? 5 : days < 5 ? 3 : 0;

  return (
    pop * 4.2 +
    altitudeDrama(trek) +
    terrainScore(trek) +
    (tierBonus[trek.tier] ?? 12) +
    accessBonus
  );
}

// ── Sort presets ──────────────────────────────────────────────────────────────

type SortMode = "ranked" | "iconic" | "dramatic" | "hidden" | "short" | "region";

interface Preset {
  key: SortMode;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const PRESETS: Preset[] = [
  { key: "ranked",   label: "Top 100",      icon: <Star className="w-3.5 h-3.5" />,    description: "Overall composite ranking" },
  { key: "iconic",   label: "Most Iconic",  icon: <Globe2 className="w-3.5 h-3.5" />,   description: "Sorted by world fame" },
  { key: "dramatic", label: "Most Dramatic",icon: <Mountain className="w-3.5 h-3.5" />, description: "Highest altitude & terrain drama" },
  { key: "short",    label: "Short & Epic", icon: <Zap className="w-3.5 h-3.5" />,      description: "≤7 days, max impact" },
  { key: "hidden",   label: "Hidden Gems",  icon: <Gem className="w-3.5 h-3.5" />,      description: "Low-profile, high-reward" },
  { key: "region",   label: "By Region",    icon: <Compass className="w-3.5 h-3.5" />,  description: "Grouped by continent" },
];

const REGIONS = ["Asia", "Europe", "South America", "North America", "Africa", "Oceania"];

// ── Tier badge ────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: number }) {
  const cfg: Record<number, { label: string; cls: string }> = {
    1: { label: "Iconic",   cls: "bg-amber-100 text-amber-800 border-amber-200" },
    2: { label: "Classic",  cls: "bg-blue-100 text-blue-800 border-blue-200" },
    3: { label: "Remote",   cls: "bg-slate-100 text-slate-700 border-slate-200" },
    4: { label: "Thru",     cls: "bg-violet-100 text-violet-800 border-violet-200" },
  };
  const { label, cls } = cfg[tier] ?? cfg[2];
  return (
    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  );
}

// ── Rank medal ────────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-amber-200 shrink-0">1</div>
  );
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">2</div>
  );
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">3</div>
  );
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
      rank <= 10 ? "bg-primary/10 text-primary border border-primary/20" :
      "bg-muted text-muted-foreground"
    }`}>{rank}</div>
  );
}

// ── Trek row component ────────────────────────────────────────────────────────

function TrekRow({ trek, rank }: { trek: any; rank: number }) {
  const [imgError, setImgError] = useState(false);
  const days = parseNum(trek.totalDays);

  return (
    <Link href={`/trek/${trek.id}`}>
      <div className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer
        hover:shadow-md hover:border-primary/30 hover:-translate-y-px
        ${rank <= 3 ? "bg-gradient-to-r from-amber-50/60 to-transparent border-amber-200/60" :
          rank <= 10 ? "bg-card border-border/80" :
          "bg-card border-border/50"}`
      }>
        {/* Rank */}
        <RankBadge rank={rank} />

        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
          <img
            src={imgError ? "/images/placeholder-trek.jpg" : getTrekImageUrl(trek.imageFilename)}
            alt={trek.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {trek.name}
            </span>
            <TierBadge tier={trek.tier} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {trek.country}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3 shrink-0" />
              {days > 0 ? `${days}d` : trek.totalDays}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-0.5">
              <Mountain className="w-3 h-3 shrink-0" />
              {trek.maxAltitude}
            </span>
          </div>
          {/* Popularity bar */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-[9px] text-muted-foreground/60 shrink-0">Pop.</span>
            <div
              className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[80px]"
              title={`Popularity score: ${trek.popularityScore ?? 5}/10 — how well-known and accessible this trek is`}
            >
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${((trek.popularityScore ?? 5) / 10) * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">
              {trek.terrain?.split(",")[0]}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  );
}

// ── Region section ────────────────────────────────────────────────────────────

function RegionSection({ region, treks }: { region: string; treks: any[] }) {
  const flagMap: Record<string, string> = {
    "Asia": "🌏", "Europe": "🌍", "South America": "🌎",
    "North America": "🌎", "Africa": "🌍", "Oceania": "🌏"
  };
  return (
    <div className="mb-8">
      <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
        <span className="text-xl">{flagMap[region] ?? "🌐"}</span>
        {region}
        <span className="text-xs font-normal text-muted-foreground ml-1">({treks.length} treks)</span>
      </h3>
      <div className="space-y-2">
        {treks.map((t, i) => <TrekRow key={t.id} trek={t} rank={i + 1} />)}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Top100() {
  const allTreks = useMemo(() => getAllTreks() as any[], []);
  const [mode, setMode] = useState<SortMode>("ranked");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");

  // Pre-compute composite scores once
  const scored = useMemo(() =>
    allTreks.map(t => ({ ...t, _score: compositeScore(t) })),
    [allTreks]
  );

  const displayTreks = useMemo(() => {
    let list = [...scored];

    // Apply region filter (for non-region modes)
    if (mode !== "region" && regionFilter !== "ALL") {
      list = list.filter(t => t.region === regionFilter);
    }

    switch (mode) {
      case "ranked":
        return list.sort((a, b) => b._score - a._score);

      case "iconic":
        return list.sort((a, b) => {
          const pop = (b.popularityScore ?? 5) - (a.popularityScore ?? 5);
          if (pop !== 0) return pop;
          return b._score - a._score;
        });

      case "dramatic":
        return list.sort((a, b) => {
          const ad = (altitudeDrama(b) + terrainScore(b)) - (altitudeDrama(a) + terrainScore(a));
          if (ad !== 0) return ad;
          return parseNum(b.maxAltitude) - parseNum(a.maxAltitude);
        });

      case "short":
        return list
          .filter(t => parseNum(t.totalDays) <= 7 && t.tier !== 4)
          .sort((a, b) => b._score - a._score);

      case "hidden":
        return list
          .filter(t => (t.popularityScore ?? 5) <= 5)
          .sort((a, b) => b._score - a._score);

      case "region":
        return list.sort((a, b) => b._score - a._score);

      default:
        return list;
    }
  }, [scored, mode, regionFilter]);

  const currentPreset = PRESETS.find(p => p.key === mode)!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>World's Top 100 Treks — TrekMind</title>
        <meta name="description" content="The definitive ranked list of the world's 100 greatest trekking routes. Filter by iconic classics, dramatic altitude, hidden gems, and more." />
        <link rel="canonical" href="https://trekmind.pages.dev/top-100" />
      </Helmet>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-foreground text-background relative overflow-hidden shrink-0">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-4 pb-5">
          {/* Back link */}
          <Link href="/">
            <button className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium mb-3 transition-colors group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to Globe
            </button>
          </Link>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 bg-amber-400 rounded-full" />
                <span className="text-amber-400 text-[11px] font-bold uppercase tracking-widest">
                  Definitive Ranking
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                World's Top 100 Treks
              </h1>
              <p className="text-white/60 text-xs mt-1 font-light">
                Ranked by popularity, drama, terrain & experience
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-white/10 leading-none select-none">100</div>
            </div>
          </div>
        </div>

        {/* ── Sort tabs ─────────────────────────────────────────────────────── */}
        <div className="relative z-10 border-t border-white/10">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {PRESETS.map(preset => (
                <button
                  key={preset.key}
                  onClick={() => setMode(preset.key)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 shrink-0
                    ${mode === preset.key
                      ? "border-amber-400 text-amber-400"
                      : "border-transparent text-white/50 hover:text-white/80"
                    }`}
                >
                  {preset.icon}
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Region + count bar ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-muted/30 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Region filter — only shown in non-region modes */}
          {mode !== "region" && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <Filter className="w-3 h-3 text-muted-foreground shrink-0" />
              {["ALL", ...REGIONS].map(r => (
                <button
                  key={r}
                  onClick={() => setRegionFilter(r)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap transition-all shrink-0
                    ${regionFilter === r
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                >
                  {r === "ALL" ? "🌐 All" : r}
                </button>
              ))}
            </div>
          )}

          {/* Count */}
          <span className="text-[11px] text-muted-foreground font-medium shrink-0 ml-auto">
            {mode === "short" ? `${displayTreks.length} short treks` :
             mode === "hidden" ? `${displayTreks.length} hidden gems` :
             mode === "region" ? `${allTreks.length} treks` :
             `${displayTreks.length} treks`}
          </span>
        </div>
      </div>

      {/* ── List ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 pb-20">

        {/* Preset description */}
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          {currentPreset.icon}
          {currentPreset.description}
          {mode === "short" && " · Tier 4 thru-hikes excluded"}
        </p>

        {/* Region view — grouped by continent */}
        {mode === "region" ? (
          <div>
            {REGIONS.map(region => {
              const regionTreks = displayTreks.filter(t => t.region === region);
              if (regionTreks.length === 0) return null;
              return <RegionSection key={region} region={region} treks={regionTreks} />;
            })}
          </div>
        ) : (
          /* Ranked list */
          <div className="space-y-2">
            {displayTreks.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Mountain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No treks match this filter</p>
              </div>
            ) : (
              displayTreks.map((trek, i) => (
                <TrekRow key={trek.id} trek={trek} rank={i + 1} />
              ))
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-1 shrink-0">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-bold text-[10px] text-foreground">TrekMind</p>
          <p className="text-[7px] text-muted-foreground">
            © 2024 TrekMind. Rankings are editorial — based on popularity, altitude, terrain & experience. Adventure responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}
