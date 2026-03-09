// MyTreks.tsx — /my-treks route
// Bucket list dashboard: completed, in progress, wishlist
// localStorage only — no auth required

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTrekList } from '../hooks/useTrekList'
import treks from '../data/treks.json'

type TabId = 'completed' | 'inProgress' | 'wishlist'

const TOTAL_TREKS = 100

const TIER_LABELS: Record<number, string> = {
  1: 'Iconic',
  2: 'Classic',
  3: 'Remote',
  4: 'Thru-Hike',
}

const TIER_COLOURS: Record<number, string> = {
  1: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  2: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  3: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
  4: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
}

const CDN = 'https://raw.githubusercontent.com/BackpackersMentality/TrekMind-Images/main/treks'

function TrekCard({
  trek,
  status,
  onToggle,
}: {
  trek: (typeof treks)[0]
  status: 'completed' | 'inProgress' | 'wishlist'
  onToggle: (id: string, s: 'completed' | 'inProgress' | 'wishlist') => void
}) {
  const tierColour = TIER_COLOURS[trek.tier] || TIER_COLOURS[2]
  const tierLabel  = TIER_LABELS[trek.tier]  || 'Classic'

  return (
    <div className="group relative flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 rounded-2xl p-3 transition-all duration-200">

      {/* Thumbnail */}
      <Link to={`/trek/${trek.id}`} className="shrink-0">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800">
          <img
            src={`${CDN}/${trek.imageFilename}.jpg`}
            alt={trek.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-200"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = `https://placehold.co/64x64/0d1b2e/38bdf8?text=${encodeURIComponent(trek.name.slice(0, 2))}`
            }}
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/trek/${trek.id}`}
          className="block text-sm font-semibold text-white/90 hover:text-white truncate transition-colors"
        >
          {trek.name}
        </Link>
        <p className="text-xs text-white/40 mt-0.5 truncate">
          {trek.country} · {trek.totalDays} · {trek.maxAltitude}
        </p>
        <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${tierColour}`}>
          T{trek.tier} · {tierLabel}
        </span>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onToggle(trek.id, status)}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
        aria-label={`Remove ${trek.name}`}
        title="Remove"
      >
        ✕
      </button>
    </div>
  )
}

export default function MyTreks() {
  const { getStatus, toggle, counts, lists } = useTrekList()
  const [activeTab, setActiveTab] = useState<TabId>('completed')

  // Build lookup of trek objects for each list
  const trekMap = useMemo(() => {
    const map: Record<string, (typeof treks)[0]> = {}
    treks.forEach(t => { map[t.id] = t })
    return map
  }, [])

  const completedTreks  = useMemo(() => Array.from(lists.completed).map(id  => trekMap[id]).filter(Boolean), [lists.completed, trekMap])
  const inProgressTreks = useMemo(() => Array.from(lists.inProgress).map(id => trekMap[id]).filter(Boolean), [lists.inProgress, trekMap])
  const wishlistTreks   = useMemo(() => Array.from(lists.wishlist).map(id   => trekMap[id]).filter(Boolean), [lists.wishlist, trekMap])

  const completedPct = Math.round((counts.completed / TOTAL_TREKS) * 100)

  // Milestone copy
  const milestone = counts.completed === 0   ? "Start your journey — tick off your first trek."
                  : counts.completed < 5     ? "Early days. The world is waiting."
                  : counts.completed < 15    ? "Getting started. You're building something special."
                  : counts.completed < 30    ? "Experienced trekker. Real credibility building."
                  : counts.completed < 50    ? "Half the world's greatest routes. Serious explorer."
                  : counts.completed < 75    ? "Elite trekker. You've seen the world."
                  : counts.completed < 100   ? "Almost there. Legendary status incoming."
                  : "You've completed all 100. Absolute legend."

  const tabs: { id: TabId; label: string; count: number; colour: string; emptyMsg: string }[] = [
    {
      id: 'completed',
      label: 'Completed',
      count: counts.completed,
      colour: 'text-amber-400',
      emptyMsg: "No completed treks yet. Head to a trek page and mark it done.",
    },
    {
      id: 'inProgress',
      label: 'In Progress',
      count: counts.inProgress,
      colour: 'text-sky-400',
      emptyMsg: "Nothing in progress. Planning a trek? Mark it here.",
    },
    {
      id: 'wishlist',
      label: 'Bucket List',
      count: counts.wishlist,
      colour: 'text-violet-400',
      emptyMsg: "Your bucket list is empty. Browse the Top 100 and start dreaming.",
    },
  ]

  const activeList = activeTab === 'completed'  ? completedTreks
                   : activeTab === 'inProgress' ? inProgressTreks
                   : wishlistTreks

  return (
    <>
      <Helmet>
        <title>My Treks — TrekMind</title>
        <meta name="description" content="Track your completed treks, current adventures, and bucket list from the world's 100 greatest trekking routes." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-[#080e1a] text-white">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="border-b border-white/[0.06]">
          <div className="max-w-3xl mx-auto px-4 py-8">

            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">My Treks</h1>
                <p className="text-sm text-white/40 mt-1">
                  Saved to this device · no account required
                </p>
              </div>
              <Link
                to="/top-100"
                className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all"
              >
                Browse Top 100 →
              </Link>
            </div>

            {/* ── Progress bar ─────────────────────────────────────────── */}
            <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06]">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <span className="text-3xl font-bold text-amber-400">{counts.completed}</span>
                  <span className="text-lg text-white/30 ml-1">/ {TOTAL_TREKS}</span>
                  <p className="text-xs text-white/40 mt-0.5">treks completed</p>
                </div>
                <span className="text-2xl font-bold text-white/20">{completedPct}%</span>
              </div>

              {/* Progress track */}
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${completedPct}%` }}
                />
              </div>

              {/* Milestone message */}
              <p className="text-xs text-white/40 mt-3 italic">{milestone}</p>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                {[
                  { label: 'Completed',  value: counts.completed,  colour: 'text-amber-400' },
                  { label: 'In Progress', value: counts.inProgress, colour: 'text-sky-400'  },
                  { label: 'Bucket List', value: counts.wishlist,   colour: 'text-violet-400' },
                ].map(({ label, value, colour }) => (
                  <div key={label} className="text-center">
                    <p className={`text-xl font-bold ${colour}`}>{value}</p>
                    <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs + List ──────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* Tab bar */}
          <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 mb-6 border border-white/[0.04]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-white/40 hover:text-white/60'}
                `}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs font-bold ${activeTab === tab.id ? tab.colour : 'text-white/30'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Trek list */}
          {activeList.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4 opacity-30">
                {activeTab === 'completed'  ? '✓' : activeTab === 'inProgress' ? '⟳' : '◇'}
              </div>
              <p className="text-white/30 text-sm">
                {tabs.find(t => t.id === activeTab)?.emptyMsg}
              </p>
              <Link
                to="/top-100"
                className="inline-block mt-4 text-sm px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
              >
                Browse the Top 100
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {activeList.map(trek => (
                <TrekCard
                  key={trek.id}
                  trek={trek}
                  status={activeTab}
                  onToggle={toggle}
                />
              ))}
            </div>
          )}

          {/* Footer note */}
          <p className="text-center text-[11px] text-white/20 mt-10">
            Your lists are saved to this device only. Clearing browser data will reset them.
          </p>
        </div>
      </div>
    </>
  )
}
