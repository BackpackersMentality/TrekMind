// components/compare/TrekComparison.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen comparison modal for TrekH2H.
// Shows 2–3 treks side-by-side with a structured row layout.
// Highlights the "winner" on key quantitative rows.
// Mobile-first: horizontally scrollable on small screens.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import {
  X, Clock, Route, Mountain, Bed, MapPin,
  DollarSign, Star, Zap, ChevronRight, Trash2,
  GitCompareArrows, Info,
} from "lucide-react";
import { useCompareStore, CompareTrek } from "@/store/compareStore";
import { getTrekImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Parse the first integer from a string like "12 days" or "120 km" */
function parseNum(s: string | number | undefined): number {
  if (s === undefined || s === null) return 0;
  const m = String(s).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

/** Map budget string to $ symbols */
function budgetSymbol(b?: string) {
  if (b === "Low")    return { symbol: "$",   label: "Budget",   color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  if (b === "Medium") return { symbol: "$$",  label: "Mid-range", color: "text-amber-600 bg-amber-50 border-amber-200" };
  if (b === "High")   return { symbol: "$$$", label: "Premium",  color: "text-rose-600 bg-rose-50 border-rose-200" };
  return { symbol: "?", label: "Unknown", color: "text-muted-foreground bg-muted border-border" };
}

/** Map tier number to label */
function tierLabel(tier: number) {
  const map: Record<number, string> = {
    1: "Iconic",
    2: "Classic",
    3: "Remote",
    4: "Thru-Hike",
    5: "Trekking Peak",
  };
  return `Tier ${tier} — ${map[tier] ?? "Unknown"}`;
}

/** Derive a "Best For" shorthand from terrain + tier + accommodation */
function bestFor(trek: CompareTrek): string {
  const t = trek.terrain.toLowerCase();
  if (trek.tier === 4) return "Thru-hikers";
  if (trek.tier === 5) return "Alpinists";
  if (t.includes("coast")) return "Coastal walkers";
  if (t.includes("jungle") || t.includes("rainforest")) return "Jungle explorers";
  if (t.includes("desert")) return "Desert trekkers";
  if (t.includes("volcanic")) return "Volcano lovers";
  if (t.includes("glacial") || t.includes("arctic")) return "Polar adventurers";
  if (t.includes("high alpine")) return "High altitude seekers";
  if (trek.accommodation?.toLowerCase().includes("teahouse")) return "Cultural trekkers";
  return "Alpine adventurers";
}

/** Popularity score → label */
function popularityLabel(score: number) {
  if (score >= 8) return "Iconic";
  if (score >= 5) return "Popular";
  return "Hidden Gem";
}

// ─── sub-components ───────────────────────────────────────────────────────────

/** Difficulty dots — maps tier to visual difficulty */
function DifficultyDots({ tier }: { tier: number }) {
  const filled = Math.min(tier, 5);
  return (
    <div className="flex items-center gap-1" aria-label={`Difficulty: ${filled} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2.5 h-2.5 rounded-full border transition-colors",
            i < filled
              ? filled <= 2
                ? "bg-emerald-500 border-emerald-500"
                : filled <= 3
                ? "bg-amber-500 border-amber-500"
                : "bg-rose-500 border-rose-500"
              : "bg-muted border-border",
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{tierLabel(tier)}</span>
    </div>
  );
}

/** Header card for each trek column */
function TrekHeader({ trek, onRemove }: { trek: CompareTrek; onRemove: () => void }) {
  return (
    <div className="relative flex flex-col min-w-0">
      {/* Hero image */}
      <div className="relative h-36 sm:h-44 overflow-hidden rounded-xl bg-muted">
        <img
          src={getTrekImageUrl(trek.imageFilename)}
          alt={trek.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Remove from comparison */}
        <button
          onClick={onRemove}
          aria-label={`Remove ${trek.name} from comparison`}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-colors border border-white/20"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[11px] font-semibold text-white/60 uppercase tracking-widest leading-none mb-1">
            {trek.region} · {trek.country}
          </p>
          <h3 className="text-white font-bold text-base leading-tight line-clamp-2">
            {trek.name}
          </h3>
        </div>
      </div>

      {/* View Details CTA */}
      <Link href={`/trek/${trek.id}`}>
        <button className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors">
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </Link>
    </div>
  );
}

// ─── row definitions ──────────────────────────────────────────────────────────

type WinnerFn = (treks: CompareTrek[]) => string | null; // returns winning trek id or null

interface RowDef {
  key:      string;
  label:    string;
  icon:     React.ReactNode;
  render:   (trek: CompareTrek) => React.ReactNode;
  /** Optional: return the id of the "best" trek for this row */
  winner?:  WinnerFn;
}

const ROW_DEFS: RowDef[] = [
  {
    key: "duration",
    label: "Duration",
    icon: <Clock className="w-4 h-4" />,
    render: (t) => <span className="font-semibold text-foreground">{t.totalDays || "—"}</span>,
    winner: (treks) => {
      // Shortest duration wins
      const parsed = treks.map(t => ({ id: t.id, v: parseNum(t.totalDays) })).filter(x => x.v > 0);
      if (parsed.length < 2) return null;
      const min = Math.min(...parsed.map(x => x.v));
      const winners = parsed.filter(x => x.v === min);
      return winners.length === 1 ? winners[0].id : null;
    },
  },
  {
    key: "distance",
    label: "Distance",
    icon: <Route className="w-4 h-4" />,
    render: (t) => <span className="font-semibold text-foreground">{t.distance || "—"}</span>,
    winner: (treks) => {
      // Shortest distance (for standard treks) — no winner on thru-hikes
      if (treks.some(t => t.tier === 4)) return null;
      const parsed = treks.map(t => ({ id: t.id, v: parseNum(t.distance) })).filter(x => x.v > 0);
      if (parsed.length < 2) return null;
      const min = Math.min(...parsed.map(x => x.v));
      const winners = parsed.filter(x => x.v === min);
      return winners.length === 1 ? winners[0].id : null;
    },
  },
  {
    key: "altitude",
    label: "Max Altitude",
    icon: <Mountain className="w-4 h-4" />,
    render: (t) => (
      <span className={cn(
        "font-semibold",
        parseNum(t.maxAltitude) > 5000 ? "text-rose-600" : "text-foreground",
      )}>
        {t.maxAltitude || "—"}
      </span>
    ),
    winner: (treks) => {
      // Highest altitude wins
      const parsed = treks.map(t => ({ id: t.id, v: parseNum(t.maxAltitude) })).filter(x => x.v > 0);
      if (parsed.length < 2) return null;
      const max = Math.max(...parsed.map(x => x.v));
      const winners = parsed.filter(x => x.v === max);
      return winners.length === 1 ? winners[0].id : null;
    },
  },
  {
    key: "difficulty",
    label: "Difficulty",
    icon: <Zap className="w-4 h-4" />,
    render: (t) => <DifficultyDots tier={t.tier} />,
    // No winner for difficulty — subjective
  },
  {
    key: "accommodation",
    label: "Accommodation",
    icon: <Bed className="w-4 h-4" />,
    render: (t) => (
      <span className="text-sm text-foreground font-medium">{t.accommodation || "—"}</span>
    ),
  },
  {
    key: "region",
    label: "Region",
    icon: <MapPin className="w-4 h-4" />,
    render: (t) => (
      <div>
        <span className="font-semibold text-foreground text-sm">{t.region}</span>
        <p className="text-xs text-muted-foreground mt-0.5">{t.country}</p>
      </div>
    ),
  },
  {
    key: "budget",
    label: "Budget",
    icon: <DollarSign className="w-4 h-4" />,
    render: (t) => {
      const b = budgetSymbol(t.budget);
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border", b.color)}>
          {b.symbol} <span className="font-normal">{b.label}</span>
        </span>
      );
    },
    winner: (treks) => {
      // Cheapest wins
      const order = { Low: 0, Medium: 1, High: 2 };
      const parsed = treks
        .filter(t => t.budget)
        .map(t => ({ id: t.id, v: order[t.budget as keyof typeof order] ?? 99 }));
      if (parsed.length < 2) return null;
      const min = Math.min(...parsed.map(x => x.v));
      const winners = parsed.filter(x => x.v === min);
      return winners.length === 1 ? winners[0].id : null;
    },
  },
  {
    key: "popularity",
    label: "Popularity",
    icon: <Star className="w-4 h-4" />,
    render: (t) => (
      <div className="flex items-center gap-2">
        {/* Score bar */}
        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full"
            style={{ width: `${(t.popularityScore / 10) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{popularityLabel(t.popularityScore)}</span>
      </div>
    ),
    winner: (treks) => {
      const parsed = treks.map(t => ({ id: t.id, v: t.popularityScore }));
      if (parsed.length < 2) return null;
      const max = Math.max(...parsed.map(x => x.v));
      const winners = parsed.filter(x => x.v === max);
      return winners.length === 1 ? winners[0].id : null;
    },
  },
  {
    key: "bestFor",
    label: "Best For",
    icon: <Info className="w-4 h-4" />,
    render: (t) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
        {bestFor(t)}
      </span>
    ),
  },
  {
    key: "season",
    label: "Best Season",
    icon: <Clock className="w-4 h-4" />,
    render: (t) => (
      <span className="text-sm text-foreground font-medium">{t.season || "Year-round"}</span>
    ),
  },
  {
    key: "permits",
    label: "Permits",
    icon: <Info className="w-4 h-4" />,
    render: (t) => (
      <span className={cn(
        "text-xs font-semibold px-2 py-0.5 rounded-full",
        (t.permits?.toLowerCase().includes("not required") || t.permits?.toLowerCase() === "no")
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-amber-50 text-amber-700 border border-amber-200",
      )}>
        {t.permits?.toLowerCase().includes("not required") ? "Not Required" : "Required"}
      </span>
    ),
  },
];

// ─── main component ───────────────────────────────────────────────────────────

export function TrekComparison() {
  const { selectedTreks, isCompareOpen, closeCompare, removeTrekFromCompare, clearCompare } =
    useCompareStore();

  // Lock body scroll when open
  useEffect(() => {
    if (isCompareOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isCompareOpen]);

  // Escape key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeCompare(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCompare]);

  // Pre-compute winners for all rows (memoised)
  const winnerMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    ROW_DEFS.forEach(row => {
      map[row.key] = row.winner ? row.winner(selectedTreks) : null;
    });
    return map;
  }, [selectedTreks]);

  if (!isCompareOpen || selectedTreks.length < 2) return null;

  const colCount = selectedTreks.length; // 2 or 3

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trek comparison"
      className="fixed inset-0 z-[200] flex flex-col bg-background"
    >
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">
            TrekH2H — Head-to-Head
          </h2>
          <span className="hidden sm:inline text-xs text-muted-foreground font-medium ml-1">
            Comparing {colCount} treks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCompare}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground border border-border hover:bg-muted transition-all"
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </button>
          <button
            onClick={closeCompare}
            aria-label="Close comparison"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground border border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[600px] max-w-5xl mx-auto px-4 sm:px-6 pb-16 pt-4">

          {/* Trek header cards — sticky so they stay visible while scrolling rows */}
          <div
            className={cn(
              "grid gap-4 mb-6",
              colCount === 2 ? "grid-cols-[180px_1fr_1fr]" : "grid-cols-[180px_1fr_1fr_1fr]",
            )}
          >
            {/* Row label spacer */}
            <div className="hidden sm:block" aria-hidden />

            {selectedTreks.map(trek => (
              <TrekHeader
                key={trek.id}
                trek={trek}
                onRemove={() => removeTrekFromCompare(trek.id)}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-2" />

          {/* ── Comparison rows ────────────────────────────────────────────── */}
          <div className="space-y-0">
            {ROW_DEFS.map((row, rowIdx) => {
              const winnerId = winnerMap[row.key];

              return (
                <div
                  key={row.key}
                  className={cn(
                    "grid gap-4 items-center py-3 border-b border-border/50",
                    colCount === 2
                      ? "grid-cols-[180px_1fr_1fr]"
                      : "grid-cols-[180px_1fr_1fr_1fr]",
                    rowIdx % 2 === 0 ? "bg-transparent" : "bg-muted/20 rounded-lg",
                  )}
                >
                  {/* Row label */}
                  <div className="flex items-center gap-2 text-muted-foreground pr-2">
                    <span className="shrink-0 text-muted-foreground/60">{row.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 leading-tight">
                      {row.label}
                    </span>
                  </div>

                  {/* Data cells */}
                  {selectedTreks.map(trek => {
                    const isWinner = winnerId === trek.id;
                    return (
                      <div
                        key={trek.id}
                        className={cn(
                          "relative rounded-lg px-3 py-2 min-h-[44px] flex items-center transition-colors",
                          isWinner && "bg-primary/8 ring-1 ring-primary/20",
                        )}
                      >
                        {/* Winner badge */}
                        {isWinner && (
                          <span className="absolute -top-2 left-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider rounded-full leading-none">
                            Best
                          </span>
                        )}
                        {row.render(trek)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── Key Features row (full-width, not in grid) ─────────────────── */}
          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Star className="w-4 h-4 text-muted-foreground/60" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                Key Features
              </span>
            </div>
            <div
              className={cn(
                "grid gap-4",
                colCount === 2 ? "grid-cols-2" : "grid-cols-3",
              )}
            >
              {selectedTreks.map(trek => {
                // Split keyFeatures by comma and take first 3
                const features = trek.keyFeatures
                  ?.split(",")
                  .map(f => f.trim())
                  .filter(Boolean)
                  .slice(0, 3) ?? [];

                return (
                  <div key={trek.id} className="space-y-1.5">
                    <p className="text-xs font-bold text-foreground truncate">{trek.name}</p>
                    {features.length > 0 ? (
                      <ul className="space-y-1">
                        {features.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-1.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 italic">No features listed</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Disclaimer ──────────────────────────────────────────────────── */}
          <div className="mt-8 flex items-start gap-2 text-xs text-muted-foreground/50 border-t border-border pt-4">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              "Best" indicators reflect objective metrics (shortest distance, cheapest budget, highest altitude).
              The right trek depends on your personal goals — always read the full detail page before booking.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
