// IntroOverlay.tsx — first-visit introduction to TrekMind
// Place at: client/src/components/IntroOverlay.tsx
// Shows once per device, stored in localStorage. Dismiss on tap/click anywhere.

import { useState, useEffect } from "react";
import { Globe, Trophy, Bookmark, Sparkles, SlidersHorizontal } from "lucide-react";

const STORAGE_KEY = "trekmind_intro_seen";

// ── Tier grid for welcome slide ───────────────────────────────────────────────
const TIER_GRID = [
  {
    number: 1,
    name: "Iconic",
    count: 25,
    pinBg: "bg-amber-400",
    cardBg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-300",
    sub: "text-amber-200/60",
    example: "Everest BC, Inca Trail",
  },
  {
    number: 2,
    name: "Classic",
    count: 43,
    pinBg: "bg-blue-400",
    cardBg: "bg-blue-500/15",
    border: "border-blue-500/30",
    text: "text-blue-300",
    sub: "text-blue-200/60",
    example: "Cerro Castillo, Alta Via 4",
  },
  {
    number: 3,
    name: "Remote",
    count: 25,
    pinBg: "bg-slate-400",
    cardBg: "bg-slate-500/15",
    border: "border-slate-500/30",
    text: "text-slate-300",
    sub: "text-slate-200/60",
    example: "Dusky Track, Huemul",
  },
  {
    number: 4,
    name: "Thru-Hike",
    count: 7,
    pinBg: "bg-violet-400",
    cardBg: "bg-violet-500/15",
    border: "border-violet-500/30",
    text: "text-violet-300",
    sub: "text-violet-200/60",
    example: "PCT, Te Araroa, AT",
  },
];

// ── Feature steps (slides 2–6) ────────────────────────────────────────────────
const STEPS = [
  {
    icon: Globe,
    color: "text-sky-400",
    bg: "bg-sky-500/15 border-sky-500/30",
    title: "Spin the Globe",
    body: "Drag to explore 100 of the world's greatest trekking routes. Tap any pin to preview the trek.",
  },
  {
    icon: SlidersHorizontal,
    color: "text-violet-400",
    bg: "bg-violet-500/15 border-violet-500/30",
    title: "Filter & Discover",
    body: "Use the filter button to narrow by region, terrain, duration, and accommodation type.",
  },
  {
    icon: Trophy,
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
    title: "Top 100 Ranked",
    body: "Every trek is ranked across four tiers — from iconic classics to remote hidden gems.",
  },
  {
    icon: Bookmark,
    color: "text-violet-400",
    bg: "bg-violet-500/15 border-violet-500/30",
    title: "Track Your Treks",
    body: "Open any trek and tap the bookmark icon to save it as completed, in progress, or on your bucket list.",
  },
  {
    icon: Sparkles,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    title: "Find My Trek",
    body: "Not sure where to start? Use Find My Trek to get a personalised recommendation based on your preferences.",
  },
];

const TOTAL_SLIDES = 1 + STEPS.length; // welcome + 5 feature slides

export function IntroOverlay() {
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(0); // 0 = welcome, 1–5 = feature steps
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setVisible(true), 900);
        return () => clearTimeout(t);
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  const dismiss = () => {
    setExiting(true);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setTimeout(() => setVisible(false), 300);
  };

  const next = () => {
    if (slide < TOTAL_SLIDES - 1) setSlide(s => s + 1);
    else dismiss();
  };

  if (!visible) return null;

  const isLast = slide === TOTAL_SLIDES - 1;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end justify-center pb-8 px-4 transition-opacity duration-300 ${exiting ? "opacity-0" : "opacity-100"}`}
    >
      {/* Backdrop — tap to skip entirely */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={dismiss} />

      {/* Card */}
      <div className="relative w-full max-w-sm animate-in slide-in-from-bottom-6 duration-400 fade-in">
        <div className="bg-[#0d1b2e]/96 backdrop-blur-md border border-white/[0.09] rounded-2xl shadow-2xl overflow-hidden">

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 pt-5 px-5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slide ? "w-6 bg-white/70" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* ── Slide 0: Welcome ── */}
          {slide === 0 && (
            <div className="px-5 pt-4 pb-5">
              {/* App name + slogan */}
              <div className="mb-4">
                <h1 className="text-white font-black text-2xl tracking-tight leading-none">
                  Trek<span className="text-sky-400">Mind</span>
                </h1>
                <p className="text-amber-300/90 text-xs font-semibold tracking-wide mt-1">
                  The Atlas of the World's Best Treks
                </p>
                <p className="text-white/40 text-[11px] mt-0.5 leading-snug">
                  Discover iconic trails, remote adventures, and unforgettable journeys.
                </p>
              </div>

              {/* Tier colour grid */}
              <div className="mb-4">
                <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mb-2">
                  Pin colours on the globe
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TIER_GRID.map(tier => (
                    <div
                      key={tier.number}
                      className={`rounded-xl border ${tier.border} ${tier.cardBg} px-3 py-2.5 flex items-start gap-2.5`}
                    >
                      {/* Pin dot */}
                      <div className={`w-3 h-3 rounded-full ${tier.pinBg} shadow-sm shrink-0 mt-0.5`} />
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`font-black text-sm leading-none ${tier.text}`}>
                            {tier.name}
                          </span>
                          <span className={`text-[9px] font-semibold ${tier.sub}`}>
                            {tier.count}
                          </span>
                        </div>
                        <p className={`text-[10px] leading-tight mt-0.5 truncate ${tier.sub}`}>
                          {tier.example}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button onClick={dismiss} className="text-white/25 text-xs hover:text-white/45 transition-colors">
                  Skip
                </button>
                <button
                  onClick={next}
                  className="flex-1 py-2.5 bg-white/90 hover:bg-white text-[#0d1b2e] text-sm font-bold rounded-xl transition-all"
                >
                  How it works →
                </button>
              </div>
            </div>
          )}

          {/* ── Slides 1–5: Feature steps ── */}
          {slide > 0 && (() => {
            const current = STEPS[slide - 1];
            const Icon = current.icon;
            return (
              <div className="px-5 pt-4 pb-5">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${current.bg}`}>
                  <Icon className={`w-6 h-6 ${current.color}`} />
                </div>
                <h2 className="text-white font-bold text-lg mb-1.5">{current.title}</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-5">{current.body}</p>
                <div className="flex items-center gap-3">
                  <button onClick={dismiss} className="text-white/25 text-xs hover:text-white/45 transition-colors">
                    Skip
                  </button>
                  <button
                    onClick={next}
                    className="flex-1 py-2.5 bg-white/90 hover:bg-white text-[#0d1b2e] text-sm font-bold rounded-xl transition-all"
                  >
                    {isLast ? "Start Exploring →" : "Next →"}
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
