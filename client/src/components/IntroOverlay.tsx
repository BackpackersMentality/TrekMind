// IntroOverlay.tsx — first-visit introduction to TrekMind
// Place at: client/src/components/IntroOverlay.tsx
// Shows once per device, stored in localStorage. Dismiss on tap/click anywhere.

import { useState, useEffect } from "react";
import { useIntroSeen } from "@/hooks/useIntroSeen";
import { Globe, Trophy, Bookmark, Sparkles, SlidersHorizontal, Pickaxe } from "lucide-react";


// ── Tier grid for welcome slide ───────────────────────────────────────────────
// Colours match TIER_TOKENS in About.tsx and GlobeViewer TIER_COLORS exactly:
//   1 Gold #D4AF37 · 2 Burnt Orange #E67E22 · 3 Forest Green #2E7D32
//   4 Deep Purple #6A4C93 · 5 Alpine Blue #2E86C1
const TIER_GRID = [
  {
    number: 1,
    name: "Iconic",
    count: 30,
    // Gold — #D4AF37
    pinColor: "#D4AF37",
    cardBg: "#FDF8E7",
    borderColor: "#EBD97A",
    textColor: "#7A5C00",
    example: "Everest BC, Inca Trail",
  },
  {
    number: 2,
    name: "Classic",
    count: 59,
    // Burnt Orange — #E67E22
    pinColor: "#E67E22",
    cardBg: "#FEF3E9",
    borderColor: "#F0A868",
    textColor: "#8B4000",
    example: "Cerro Castillo, Alta Via 4",
  },
  {
    number: 3,
    name: "Remote",
    count: 34,
    // Forest Green — #2E7D32
    pinColor: "#2E7D32",
    cardBg: "#EBF5EC",
    borderColor: "#81C784",
    textColor: "#1B5E20",
    example: "Dusky Track, Huemul",
  },
  {
    number: 4,
    name: "Thru-Hike",
    count: 12,
    // Deep Purple — #6A4C93
    pinColor: "#6A4C93",
    cardBg: "#F3EFF8",
    borderColor: "#B39DDB",
    textColor: "#4A0D6E",
    example: "PCT, Te Araroa, AT",
  },
  {
    number: 5,
    name: "Trekking Peak",
    count: 15,
    // Alpine Blue — #2E86C1
    pinColor: "#2E86C1",
    cardBg: "#EBF4FB",
    borderColor: "#90CAF9",
    textColor: "#0D47A1",
    example: "Mera Peak, Elbrus",
  },
];

// ── Feature steps (slides 2–6) ────────────────────────────────────────────────
const STEPS = [
  {
    icon: Globe,
    color: "text-sky-400",
    bg: "bg-sky-500/15 border-sky-500/30",
    title: "Spin the Globe",
    body: "Drag to explore 150 of the world's greatest trekking routes and peaks. Tap any pin to preview the trek.",
  },
  {
    icon: SlidersHorizontal,
    color: "text-violet-400",
    bg: "bg-violet-500/15 border-violet-500/30",
    title: "Filter & Discover",
    body: "Use the filter button to narrow by region, terrain, duration, accommodation type, and even when to trek by month.",
  },
  {
    icon: Trophy,
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
    title: "Top 100 Ranked",
    body: "Every trek is ranked across five tiers — from iconic classics to remote hidden gems and beginner mountaineering peaks.",
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
  const { hasSeen, markSeen } = useIntroSeen();
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(0); // 0 = welcome, 1–5 = feature steps
  const [exiting, setExiting] = useState(false);

  // Show overlay once hasSeen is confirmed false (null = still loading)
  useEffect(() => {
    if (hasSeen === false) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
    // If hasSeen becomes true (e.g. user logs in), hide the overlay
    if (hasSeen === true) setVisible(false);
  }, [hasSeen]);

  const dismiss = () => {
    setExiting(true);
    markSeen(); // persists to Supabase (if logged in) or localStorage (anonymous)
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
      <div className="absolute inset-0 bg-white/20 backdrop-blur-md" onClick={dismiss} />

      {/* Card */}
      <div className="relative w-full max-w-sm animate-in slide-in-from-bottom-6 duration-400 fade-in">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden">

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 pt-5 px-5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slide ? "w-6 bg-slate-700" : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>

          {/* ── Slide 0: Welcome ── */}
          {slide === 0 && (
            <div className="px-5 pt-4 pb-5">
              {/* App name + slogan */}
              <div className="mb-4">
                <h1 className="text-slate-950 font-black text-2xl tracking-tight leading-none">
                  Trek<span className="text-sky-500">Mind</span>
                </h1>
                <p className="text-amber-600 text-xs font-semibold tracking-wide mt-1">
                  The Atlas of the World's Best Treks & Peaks
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                  Discover iconic trails, remote adventures, and first summits.
                </p>
              </div>

              {/* Tier colour grid */}
              <div className="mb-4">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                  Pin colours on the globe
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TIER_GRID.map(tier => (
                    <div
                      key={tier.number}
                      className="rounded-xl px-3 py-2.5 flex items-start gap-2.5"
                      style={{
                        background: tier.cardBg,
                        border: `1.5px solid ${tier.borderColor}`,
                      }}
                    >
                      {/* Pin dot — slightly larger for contrast on light bg */}
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 shadow"
                        style={{ backgroundColor: tier.pinColor }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-sm leading-none" style={{ color: tier.textColor }}>
                            {tier.name}
                          </span>
                          <span className="text-[9px] font-bold" style={{ color: tier.textColor, opacity: 0.65 }}>
                            {tier.count}
                          </span>
                        </div>
                        <p className="text-[10px] leading-tight mt-0.5 truncate font-medium" style={{ color: tier.textColor, opacity: 0.75 }}>
                          {tier.example}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button onClick={dismiss} className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
                  Skip
                </button>
                <button
                  onClick={next}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all"
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
                <h2 className="text-slate-950 font-bold text-lg mb-1.5">{current.title}</h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">{current.body}</p>
                <div className="flex items-center gap-3">
                  <button onClick={dismiss} className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
                    Skip
                  </button>
                  <button
                    onClick={next}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all"
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
