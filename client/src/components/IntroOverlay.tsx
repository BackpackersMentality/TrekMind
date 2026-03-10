// IntroOverlay.tsx — first-visit introduction to TrekMind
// Place at: client/src/components/IntroOverlay.tsx
// Shows once per device, stored in localStorage. Dismiss on tap/click anywhere.

import { useState, useEffect } from "react";
import { Globe, Trophy, Bookmark, Sparkles, SlidersHorizontal } from "lucide-react";

const STORAGE_KEY = "trekmind_intro_seen";

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

export function IntroOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Small delay so globe loads first — feels more intentional
        const t = setTimeout(() => setVisible(true), 900);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage unavailable — skip overlay
    }
  }, []);

  const dismiss = () => {
    setExiting(true);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setTimeout(() => setVisible(false), 300);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end justify-center pb-8 px-4 transition-opacity duration-300 ${exiting ? "opacity-0" : "opacity-100"}`}
    >
      {/* Backdrop — tap to skip entirely */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm animate-in slide-in-from-bottom-6 duration-400 fade-in">
        <div className="bg-[#0d1b2e]/96 backdrop-blur-md border border-white/[0.09] rounded-2xl p-5 shadow-2xl">

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-white/70" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${current.bg}`}>
            <Icon className={`w-6 h-6 ${current.color}`} />
          </div>

          {/* Text */}
          <h2 className="text-white font-bold text-lg mb-1.5">{current.title}</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-5">{current.body}</p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={dismiss}
              className="text-white/25 text-xs hover:text-white/45 transition-colors"
            >
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
      </div>
    </div>
  );
}
