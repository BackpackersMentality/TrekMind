// MyTreks.tsx — /my-treks route
// Place at: client/src/pages/MyTreks.tsx

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, Trophy, CheckCircle2, Clock, Bookmark } from "lucide-react";
import { useTrekList } from "@/hooks/useTrekList";
import { getAllTreks } from "@/lib/treks";

type TabId = "completed" | "inProgress" | "wishlist";

const TOTAL = 100;

const CDN = "https://raw.githubusercontent.com/BackpackersMentality/TrekMind-Images/main/treks";

const TIER_STYLE: Record<number, string> = {
  1: "text-amber-400  bg-amber-500/10  border-amber-500/30",
  2: "text-sky-400    bg-sky-500/10    border-sky-500/30",
  3: "text-slate-300  bg-slate-500/10  border-slate-500/30",
  4: "text-violet-400 bg-violet-500/10 border-violet-500/30",
};
const TIER_LABEL: Record<number, string> = {
  1: "Iconic", 2: "Classic", 3: "Remote", 4: "Thru-Hike",
};

function TrekRow({
  trek,
  status,
  onRemove,
}: {
  trek: any;
  status: TabId;
  onRemove: () => void;
}) {
  const tierStyle = TIER_STYLE[trek.tier] ?? TIER_STYLE[2];
  const tierLabel = TIER_LABEL[trek.tier] ?? "Classic";

  return (
    <div className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.055] border border-white/[0.06] hover:border-white/10 rounded-xl p-3 transition-all duration-200">
      {/* Thumbnail */}
      <Link href={`/trek/${trek.id}`}>
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-800 cursor-pointer">
          <img
            src={`${CDN}/${trek.imageFilename}.jpg`}
            alt={trek.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://placehold.co/56x56/0d1b2e/38bdf8?text=${encodeURIComponent(trek.name.slice(0, 2))}`;
            }}
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/trek/${trek.id}`}>
          <p className="text-sm font-semibold text-white/90 hover:text-white truncate cursor-pointer transition-colors">
            {trek.name}
          </p>
        </Link>
        <p className="text-xs text-white/35 mt-0.5 truncate">
          {trek.country} · {trek.totalDays} · {trek.maxAltitude || "N/A"}
        </p>
        <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${tierStyle}`}>
          T{trek.tier} · {tierLabel}
        </span>
      </div>

      {/* Remove — hover reveal */}
      <button
        onClick={onRemove}
        title="Remove"
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 text-xs"
      >
        ✕
      </button>
    </div>
  );
}

export default function MyTreks() {
  const { getStatus, toggle, counts, lists } = useTrekList();
  const [activeTab, setActiveTab] = useState<TabId>("completed");

  const allTreks = useMemo(() => getAllTreks(), []);

  const trekMap = useMemo(() => {
    const map: Record<string, any> = {};
    allTreks.forEach((t: any) => { map[t.id] = t; });
    return map;
  }, [allTreks]);

  const completedTreks  = useMemo(() => Array.from(lists.completed).map(id  => trekMap[id]).filter(Boolean), [lists.completed,  trekMap]);
  const inProgressTreks = useMemo(() => Array.from(lists.inProgress).map(id => trekMap[id]).filter(Boolean), [lists.inProgress, trekMap]);
  const wishlistTreks   = useMemo(() => Array.from(lists.wishlist).map(id   => trekMap[id]).filter(Boolean), [lists.wishlist,   trekMap]);

  const pct = Math.min(100, Math.round((counts.completed / TOTAL) * 100));

  const milestone =
    counts.completed === 0  ? "Start your journey — tick off your first trek."
    : counts.completed < 5  ? "Early days. The world is waiting."
    : counts.completed < 15 ? "Building something special."
    : counts.completed < 30 ? "Real credibility. Experienced trekker."
    : counts.completed < 50 ? "Half the world's greatest routes. Serious explorer."
    : counts.completed < 75 ? "Elite trekker. You've seen the world."
    : counts.completed < 100? "Almost there. Legendary status incoming."
    : "All 100 completed. Absolute legend.";

  const tabs: { id: TabId; label: string; count: number; Icon: any; accentCls: string; emptyMsg: string }[] = [
    {
      id: "completed", label: "Completed", count: counts.completed,
      Icon: CheckCircle2, accentCls: "text-amber-400",
      emptyMsg: "No completed treks yet. Visit a trek page and mark it done.",
    },
    {
      id: "inProgress", label: "In Progress", count: counts.inProgress,
      Icon: Clock, accentCls: "text-sky-400",
      emptyMsg: "Nothing in progress. Planning a trek? Mark it here.",
    },
    {
      id: "wishlist", label: "Bucket List", count: counts.wishlist,
      Icon: Bookmark, accentCls: "text-violet-400",
      emptyMsg: "Your bucket list is empty. Browse the Top 100 and start dreaming.",
    },
  ];

  const activeList =
    activeTab === "completed"  ? completedTreks  :
    activeTab === "inProgress" ? inProgressTreks :
    wishlistTreks;

  return (
    <>
      <Helmet>
        <title>My Treks — TrekMind</title>
        <meta name="description" content="Track your completed treks, current adventures, and trekking bucket list." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-[#080e1a] text-white">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="border-b border-white/[0.06] sticky top-0 bg-[#080e1a]/95 backdrop-blur-sm z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/">
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="text-base font-bold text-white">My Treks</h1>
              <p className="text-[11px] text-white/35">Saved to this device · no account needed</p>
            </div>
            <Link href="/top-100">
              <button className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
                Browse Top 100 →
              </button>
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

          {/* ── Progress card ──────────────────────────────────────────── */}
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
            {/* Top row */}
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-amber-400">{counts.completed}</span>
                  <span className="text-xl text-white/25">/ {TOTAL}</span>
                </div>
                <p className="text-xs text-white/35 mt-0.5">treks completed</p>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400/80">
                <Trophy className="w-4 h-4" />
                <span className="text-lg font-bold">{pct}%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-white/30 mt-2 italic">{milestone}</p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/[0.06]">
              {[
                { label: "Completed",   val: counts.completed,  cls: "text-amber-400"  },
                { label: "In Progress", val: counts.inProgress, cls: "text-sky-400"    },
                { label: "Bucket List", val: counts.wishlist,   cls: "text-violet-400" },
              ].map(({ label, val, cls }) => (
                <div key={label} className="text-center">
                  <p className={`text-2xl font-bold ${cls}`}>{val}</p>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tabs ───────────────────────────────────────────────────── */}
          <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
            {tabs.map(({ id, label, count, accentCls }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg
                  text-xs font-semibold transition-all duration-200
                  ${activeTab === id
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-white/35 hover:text-white/55"}
                `}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span className={`font-bold ${activeTab === id ? accentCls : "text-white/25"}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Trek list ──────────────────────────────────────────────── */}
          {activeList.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-5xl opacity-20">
                {activeTab === "completed" ? "✓" : activeTab === "inProgress" ? "⟳" : "◇"}
              </div>
              <p className="text-white/30 text-sm">
                {tabs.find(t => t.id === activeTab)?.emptyMsg}
              </p>
              <Link href="/top-100">
                <button className="mt-2 text-sm px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all">
                  Browse the Top 100
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activeList.map((trek: any) => (
                <TrekRow
                  key={trek.id}
                  trek={trek}
                  status={activeTab}
                  onRemove={() => toggle(trek.id, activeTab)}
                />
              ))}
            </div>
          )}

          <p className="text-center text-[10px] text-white/15 pb-4">
            Lists are saved to this device only. Clearing browser data will reset them.
          </p>
        </div>
      </div>
    </>
  );
}