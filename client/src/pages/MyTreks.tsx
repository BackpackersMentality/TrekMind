// MyTreks.tsx — /my-treks route
// Place at: client/src/pages/MyTreks.tsx

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, Trophy } from "lucide-react";
import { useTrekList, TrekStatus } from "@/hooks/useTrekList";
import { getAllTreks } from "@/lib/treks";
import { cn } from "@/lib/utils";

type TabId = "completed" | "inProgress" | "wishlist";

const TOTAL = 100;

const CDN = "https://raw.githubusercontent.com/BackpackersMentality/TrekMind-Images/main/treks";

const STATUS_CFG = {
  completed:  { icon: "✓", label: "Completed",   short: "Done",     color: "text-amber-400",  bg: "bg-amber-500/20 border-amber-500/40"  },
  inProgress: { icon: "⟳", label: "In Progress", short: "Doing",    color: "text-sky-400",    bg: "bg-sky-500/20 border-sky-500/40"      },
  wishlist:   { icon: "◇", label: "Bucket List", short: "Wishlist", color: "text-violet-400", bg: "bg-violet-500/20 border-violet-500/40" },
} as const;

function StatusPill({
  currentStatus,
  trekId,
  onToggle,
}: {
  currentStatus: TrekStatus;
  trekId: string;
  onToggle: (id: string, s: Exclude<TrekStatus, null>) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = currentStatus ? STATUS_CFG[currentStatus] : null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
          cfg
            ? `${cfg.color} ${cfg.bg}`
            : "text-white/25 border-white/10 hover:border-white/20 hover:text-white/40"
        )}
      >
        <span>{cfg ? cfg.icon : "◇"}</span>
        <span>{cfg ? cfg.short : "Save"}</span>
        <span className="opacity-40 text-[9px]">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 bg-gray-900/98 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 min-w-[150px]">
            {(Object.entries(STATUS_CFG) as [Exclude<TrekStatus, null>, typeof STATUS_CFG[keyof typeof STATUS_CFG]][]).map(([s, c]) => (
              <button
                key={s}
                onClick={() => { onToggle(trekId, s); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left",
                  currentStatus === s
                    ? `${c.color} bg-white/[0.07]`
                    : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
                )}
              >
                <span className="w-3 text-center">{c.icon}</span>
                <span>{c.label}</span>
                {currentStatus === s && <span className="ml-auto text-[10px] opacity-50">✓</span>}
              </button>
            ))}
            {currentStatus && (
              <button
                onClick={() => { onToggle(trekId, currentStatus); setOpen(false); }}
                className="w-full mt-0.5 pt-1.5 border-t border-white/[0.06] text-[10px] text-white/20 hover:text-white/35 transition-colors text-center"
              >
                Remove
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TrekRow({ trek, onToggle }: { trek: any; onToggle: (id: string, s: Exclude<TrekStatus, null>) => void }) {
  const { getStatus } = useTrekList();
  const status = getStatus(trek.id);

  return (
    <div className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/10 rounded-xl p-3 transition-all duration-200">
      <Link href={`/trek/${trek.id}`}>
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-800 cursor-pointer">
          <img
            src={`${CDN}/${trek.imageFilename}.jpg`}
            alt={trek.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://placehold.co/56x56/0d1b2e/38bdf8?text=${encodeURIComponent(trek.name.slice(0, 2))}`;
            }}
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/trek/${trek.id}`}>
          <p className="text-sm font-semibold text-white/90 hover:text-white truncate cursor-pointer transition-colors">
            {trek.name}
          </p>
        </Link>
        <p className="text-xs text-white/30 mt-0.5 truncate">
          {trek.country} · {trek.totalDays}
        </p>
      </div>

      <div className="shrink-0">
        <StatusPill currentStatus={status} trekId={trek.id} onToggle={onToggle} />
      </div>
    </div>
  );
}

export default function MyTreks() {
  const { toggle, counts: rawCounts, lists: rawLists } = useTrekList();

  // ── Defensive null-guards ────────────────────────────────────────────────
  // useTrekList() can return undefined counts/lists when:
  //   a) Supabase is paused / unreachable (network error during auth check)
  //   b) The hook hasn't resolved its async initialisation yet
  // Without guards, counts.completed throws "Cannot read properties of
  // undefined (reading 'completed')" and crashes the page.
  const counts = rawCounts ?? { completed: 0, inProgress: 0, wishlist: 0 };
  const lists  = rawLists  ?? {
    completed:  new Set<string>(),
    inProgress: new Set<string>(),
    wishlist:   new Set<string>(),
  };

  const [activeTab, setActiveTab] = useState<TabId>("completed");

  const allTreks = useMemo(() => getAllTreks(), []);
  const trekMap = useMemo(() => {
    const map: Record<string, any> = {};
    allTreks.forEach((t: any) => { map[t.id] = t; });
    return map;
  }, [allTreks]);

  const completedTreks  = useMemo(() => Array.from(lists.completed  ?? []).map(id => trekMap[id]).filter(Boolean), [lists.completed,  trekMap]);
  const inProgressTreks = useMemo(() => Array.from(lists.inProgress ?? []).map(id => trekMap[id]).filter(Boolean), [lists.inProgress, trekMap]);
  const wishlistTreks   = useMemo(() => Array.from(lists.wishlist   ?? []).map(id => trekMap[id]).filter(Boolean), [lists.wishlist,   trekMap]);

  const allSaved = useMemo(() => {
    const seen = new Set<string>();
    return [...completedTreks, ...inProgressTreks, ...wishlistTreks].filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id); return true;
    });
  }, [completedTreks, inProgressTreks, wishlistTreks]);

  const pct = Math.min(100, Math.round((counts.completed / TOTAL) * 100));

  const milestone =
    counts.completed === 0  ? "Start your journey — save your first trek."
    : counts.completed < 5  ? "Early days. The world is waiting."
    : counts.completed < 15 ? "Building something special."
    : counts.completed < 30 ? "Experienced trekker."
    : counts.completed < 50 ? "Half the world's greatest routes."
    : counts.completed < 75 ? "Elite trekker. You've seen the world."
    : counts.completed < 100 ? "Almost there. Legendary status incoming."
    : "All 100. Absolute legend.";

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "completed",  label: "Completed",   count: counts.completed  },
    { id: "inProgress", label: "In Progress", count: counts.inProgress },
    { id: "wishlist",   label: "Bucket List", count: counts.wishlist   },
  ];

  const TAB_COLOR: Record<TabId, string> = {
    completed:  "text-amber-400",
    inProgress: "text-sky-400",
    wishlist:   "text-violet-400",
  };
  const TAB_EMPTY_ICON: Record<TabId, string> = { completed: "✓", inProgress: "⟳", wishlist: "◇" };
  const TAB_EMPTY_MSG: Record<TabId, string> = {
    completed:  "No completed treks yet. Open any trek and tap the bookmark to save it.",
    inProgress: "Nothing in progress. Found your next adventure? Save it here.",
    wishlist:   "Your bucket list is empty. Browse the Top 100 and start dreaming.",
  };

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
              <p className="text-[11px] text-white/30">
                Saved to this device · {allSaved.length} trek{allSaved.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/top-100">
              <button className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
                Top 100 →
              </button>
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          {/* ── Progress card ──────────────────────────────────────────── */}
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-amber-400">{counts.completed}</span>
                  <span className="text-xl text-white/20">/ {TOTAL}</span>
                </div>
                <p className="text-xs text-white/30 mt-0.5">treks completed</p>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400/80">
                <Trophy className="w-4 h-4" />
                <span className="text-lg font-bold">{pct}%</span>
              </div>
            </div>

            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
              />
            </div>
            <p className="text-[11px] text-white/25 mt-2 italic">{milestone}</p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/[0.06]">
              {[
                { label: "Done",     val: counts.completed,  cls: "text-amber-400"  },
                { label: "Doing",    val: counts.inProgress, cls: "text-sky-400"    },
                { label: "Wishlist", val: counts.wishlist,   cls: "text-violet-400" },
              ].map(({ label, val, cls }) => (
                <div key={label} className="text-center">
                  <p className={`text-2xl font-bold ${cls}`}>{val}</p>
                  <p className="text-[9px] text-white/20 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tabs ───────────────────────────────────────────────────── */}
          <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
            {tabs.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200",
                  activeTab === id ? "bg-white/[0.08] text-white shadow-sm" : "text-white/30 hover:text-white/50"
                )}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span className={cn("font-bold", activeTab === id ? TAB_COLOR[id] : "text-white/20")}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Trek list ──────────────────────────────────────────────── */}
          {activeList.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-5xl opacity-10">{TAB_EMPTY_ICON[activeTab]}</div>
              <p className="text-white/25 text-sm max-w-xs mx-auto">{TAB_EMPTY_MSG[activeTab]}</p>
              <Link href="/top-100">
                <button className="mt-2 text-sm px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all">
                  Browse the Top 100
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activeList.map((trek: any) => (
                <TrekRow key={trek.id} trek={trek} onToggle={toggle} />
              ))}
            </div>
          )}

          <p className="text-center text-[10px] text-white/10 pb-4">
            Saved to this device only. Clearing browser data will reset your lists.
          </p>
        </div>
      </div>
    </>
  );
}
