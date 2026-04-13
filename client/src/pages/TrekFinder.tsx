// TrekFinder.tsx
// AI-powered trek recommendation page at /trek-finder
// V1: smart local scoring against real trek database
// V2: Anthropic API natural language layer (optional — set AI_MODE = true)

import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { getAllTreks } from "@/lib/treks";
import { getTrekImageUrl } from "@/lib/images";
import {
  ChevronLeft, Sparkles, Mountain, Clock, Tent, Globe,
  MapPin, TrendingUp, ArrowRight, RotateCcw, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Toggle this to enable the Anthropic API layer ────────────────────────────
const AI_MODE = false; // set true once you want natural language queries

// ── Field parsing helpers (real trek data uses strings like "10 days", "2752m") ──
function parseDays(raw: any): number {
  const m = String(raw ?? "").match(/\d+/);
  return m ? parseInt(m[0]) : 0;
}
function parseAlt(raw: any): number {
  const m = String(raw ?? "").match(/\d+/);
  return m ? parseInt(m[0]) : 0;
}

// ── Normalise accommodation to three buckets ─────────────────────────────────
function accBucket(raw: string): "lodges" | "camping" | "mixed" {
  const a = raw.toLowerCase();
  const hasLodge  = a.includes("teahouse") || a.includes("hut") || a.includes("refuge") ||
                    a.includes("rifugio") || a.includes("guesthouse") || a.includes("hotel") ||
                    a.includes("b&b") || a.includes("albergue") || a.includes("gite") ||
                    a.includes("ryokan") || a.includes("minshuku") || a.includes("pension") ||
                    a.includes("monastery") || a.includes("lodge") || a.includes("homestay");
  const hasCamp   = a.includes("camp") || a.includes("wilderness") || a.includes("backcountry") ||
                    a.includes("yurt") || a.includes("hammock") || a.includes("cave");
  if (hasLodge && hasCamp) return "mixed";
  if (hasCamp)  return "camping";
  return "lodges";
}

// ── Difficulty derived from tier + maxAlt ────────────────────────────────────
function deriveDifficulty(trek: any): "Easy" | "Moderate" | "Hard" | "Extreme" {
  const alt = parseAlt(trek.maxAltitude);
  const tier = trek.tier;
  if (alt >= 5000 || tier >= 4) return "Extreme";
  if (alt >= 4000 || tier === 3) return "Hard";
  if (alt >= 2500 || tier === 2) return "Moderate";
  return "Easy";
}

// ── Preference types ──────────────────────────────────────────────────────────
interface Prefs {
  duration:      "short" | "medium" | "long" | "epic" | "";
  experience:    "beginner" | "intermediate" | "experienced" | "expert" | "";
  altitude:      "low" | "moderate" | "high" | "extreme" | "";
  accommodation: "lodges" | "camping" | "either" | "";
  region:        string;
  vibe:          "iconic" | "remote" | "scenic" | "cultural" | "";
}

// ── Scoring engine ────────────────────────────────────────────────────────────
interface ScoredTrek {
  trek: any;
  score: number;
  reasons: string[];
  matchPct: number;
}

function scoreTrek(trek: any, prefs: Prefs): ScoredTrek {
  let score = 0;
  const reasons: string[] = [];
  const days  = parseDays(trek.totalDays);
  const alt   = parseAlt(trek.maxAltitude);
  const acc   = accBucket(trek.accommodation ?? "");
  const diff  = deriveDifficulty(trek);

  // ── Duration (30 pts) ───────────────────────────────────────────────────────
  const durRanges: Record<string, [number, number]> = {
    short: [1, 5], medium: [6, 10], long: [11, 18], epic: [19, 9999],
  };
  const [dMin, dMax] = durRanges[prefs.duration] || [0, 99];
  if (days >= dMin && days <= dMax) {
    score += 30;
    reasons.push(`${days} days — perfect for a ${prefs.duration} trip`);
  } else {
    const mid = (dMin + dMax) / 2;
    if (Math.abs(days - mid) <= 4) { score += 12; }
    else { score -= 10; }
  }

  // ── Altitude (25 pts) ───────────────────────────────────────────────────────
  const altCeilings: Record<string, number> = {
    low: 2600, moderate: 4000, high: 5200, extreme: 9999,
  };
  const ceiling = altCeilings[prefs.altitude] || 9999;
  if (alt <= ceiling) {
    score += 25;
    reasons.push(`Max ${alt}m — within your altitude comfort zone`);
  } else {
    score -= 25; // hard penalise: safety matters
  }

  // ── Experience / difficulty (20 pts) ───────────────────────────────────────
  const diffRank: Record<string, number> = { Easy: 1, Moderate: 2, Hard: 3, Extreme: 4 };
  const expRank:  Record<string, number> = {
    beginner: 1, intermediate: 2, experienced: 3, expert: 4,
  };
  const gap = Math.abs(diffRank[diff] - (expRank[prefs.experience] || 2));
  if (gap === 0)      { score += 20; reasons.push(`${diff} difficulty — matches your experience`); }
  else if (gap === 1) { score += 8; }
  else if (gap >= 2)  { score -= 15; }

  // ── Accommodation (15 pts) ──────────────────────────────────────────────────
  if (prefs.accommodation === "either") {
    score += 15;
  } else if (prefs.accommodation === "lodges" && (acc === "lodges" || acc === "mixed")) {
    score += 15;
    reasons.push(`Lodge/hut accommodation available`);
  } else if (prefs.accommodation === "camping" && (acc === "camping" || acc === "mixed")) {
    score += 15;
    reasons.push(`Camping-based adventure`);
  } else {
    score -= 5;
  }

  // ── Region (15 pts) ─────────────────────────────────────────────────────────
  if (prefs.region === "anywhere") {
    score += 10;
  } else {
    const tregion = (trek.region ?? "").toLowerCase();
    const prefR   = prefs.region.toLowerCase();
    // "Himalaya" maps to Asia in our database
    const match = tregion === prefR ||
      (prefR === "himalaya" && tregion === "asia") ||
      tregion.includes(prefR) || prefR.includes(tregion);
    if (match) {
      score += 15;
      reasons.push(`Located in ${trek.region}`);
    }
  }

  // ── Vibe (10 pts) ───────────────────────────────────────────────────────────
  const pop  = trek.popularityScore ?? 5;
  const terr = (trek.terrain ?? "").toLowerCase();
  const feat = (trek.keyFeatures ?? "").toLowerCase();
  if (prefs.vibe === "iconic"   && pop >= 8)  { score += 10; reasons.push(`One of the world's most iconic routes`); }
  if (prefs.vibe === "remote"   && pop <= 5)  { score += 10; reasons.push(`Off the beaten track`); }
  if (prefs.vibe === "scenic"   && (terr.includes("alpine") || terr.includes("glacial") || terr.includes("volcanic"))) {
    score += 10; reasons.push(`Dramatic ${trek.terrain} scenery`);
  }
  if (prefs.vibe === "cultural" && (feat.includes("village") || feat.includes("culture") || feat.includes("temple") || feat.includes("monastery"))) {
    score += 10; reasons.push(`Rich cultural experience`);
  }

  // ── Tier bonus ──────────────────────────────────────────────────────────────
  score += Math.max(0, (4 - trek.tier)) * 3;

  const MAX_SCORE = 30 + 25 + 20 + 15 + 15 + 10 + 9;
  const matchPct  = Math.round(Math.max(0, Math.min(100, (score / MAX_SCORE) * 100)));

  return { trek, score: Math.max(0, score), reasons: reasons.slice(0, 3), matchPct };
}

function getTopMatches(prefs: Prefs): ScoredTrek[] {
  const allTreks = getAllTreks() as any[];
  return allTreks
    .map(t => scoreTrek(t, prefs))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// ── Anthropic AI layer (V2 — natural language) ───────────────────────────────
async function getAIInsight(trek: any, prefs: Prefs): Promise<string> {
  const prompt = `You are a trekking expert. In 2 sentences, explain why the ${trek.name} trek (${trek.country}, ${trek.totalDays}, max ${trek.maxAltitude}) is a great match for someone who wants a ${prefs.duration} ${prefs.experience}-level trek with ${prefs.accommodation} accommodation in ${prefs.region === "anywhere" ? "any region" : prefs.region}. Be specific and enthusiastic.`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 120,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  } catch {
    return "";
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OptionButton({
  value, selected, onClick, icon, label, sub,
}: {
  value: string; selected: boolean; onClick: () => void;
  icon: string; label: string; sub?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-150",
        selected
          ? "bg-primary/10 border-primary/50 text-primary"
          : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/60 hover:border-border hover:text-foreground"
      )}
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="text-sm font-semibold leading-tight">{label}</span>
      {sub && <span className="text-[11px] opacity-60 leading-tight">{sub}</span>}
    </button>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 rounded-full flex-1 transition-all duration-300",
            i < current ? "bg-primary" : i === current ? "bg-primary/50" : "bg-border"
          )}
        />
      ))}
    </div>
  );
}

function MatchBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-border/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-primary w-10 text-right">{pct}%</span>
    </div>
  );
}

function TrekResultCard({ result, rank }: { result: ScoredTrek; rank: number }) {
  const { trek, reasons, matchPct } = result;
  const [expanded, setExpanded] = useState(rank === 1);
  const [imgError, setImgError] = useState(false);
  const days = parseDays(trek.totalDays);
  const alt  = parseAlt(trek.maxAltitude);
  const diff = deriveDifficulty(trek);
  const diffColor: Record<string, string> = {
    Easy: "text-green-600 bg-green-50 border-green-200",
    Moderate: "text-blue-600 bg-blue-50 border-blue-200",
    Hard: "text-orange-600 bg-orange-50 border-orange-200",
    Extreme: "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-200",
      rank === 1
        ? "border-primary/30 bg-primary/5 shadow-md shadow-primary/10"
        : "border-border bg-card"
    )}>
      {/* Rank + title bar */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground truncate">{trek.name}</span>
            {rank === 1 && (
              <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                Top Match
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            {trek.country}
          </div>
        </div>

        <div className="shrink-0 w-28">
          <MatchBar pct={matchPct} />
        </div>

        {expanded
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        }
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Image */}
          <div className="h-40 rounded-xl overflow-hidden bg-muted">
            <img
              src={imgError ? "/images/placeholder-trek.jpg" : getTrekImageUrl(trek.imageFilename)}
              alt={trek.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { icon: Clock, label: "Duration", value: `${days}d` },
              { icon: Mountain, label: "Max alt", value: alt ? `${(alt/1000).toFixed(1)}k` : "—" },
              { icon: TrendingUp, label: "Difficulty", value: diff },
              { icon: Tent, label: "Tier", value: `T${trek.tier}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-muted/40 rounded-lg p-2">
                <Icon className="w-3 h-3 text-muted-foreground mx-auto mb-1" />
                <div className="text-[10px] text-muted-foreground">{label}</div>
                <div className={cn(
                  "text-xs font-bold",
                  label === "Difficulty" ? diffColor[diff]?.split(" ")[0] : "text-foreground"
                )}>{value}</div>
              </div>
            ))}
          </div>

          {/* Why it matches */}
          {reasons.length > 0 && (
            <div className="space-y-1">
              {reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* Key features */}
          {trek.keyFeatures && (
            <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
              {trek.keyFeatures}
            </p>
          )}

          {/* Season */}
          {trek.season && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/70">Best season:</span>
              {trek.season}
            </div>
          )}

          {/* CTA */}
          <Link href={`/trek/${trek.id}`}>
            <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors mt-2">
              View Full Trek Guide
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Questions data ────────────────────────────────────────────────────────────
const STEPS = [
  {
    key: "duration",
    label: "How long is your trip?",
    sub: "Total days available for the trek",
    options: [
      { value: "short",  icon: "⚡", label: "Short",  sub: "1–5 days" },
      { value: "medium", icon: "🏔️", label: "Medium", sub: "6–10 days" },
      { value: "long",   icon: "🌍", label: "Long",   sub: "11–18 days" },
      { value: "epic",   icon: "🗺️", label: "Epic",   sub: "19+ days" },
    ],
  },
  {
    key: "experience",
    label: "What's your trekking experience?",
    sub: "Be honest — safety depends on this",
    options: [
      { value: "beginner",     icon: "🌱", label: "Beginner",     sub: "New to multi-day trekking" },
      { value: "intermediate", icon: "🥾", label: "Intermediate", sub: "A few treks under my belt" },
      { value: "experienced",  icon: "⛰️", label: "Experienced",  sub: "Comfortable at altitude" },
      { value: "expert",       icon: "🧗", label: "Expert",       sub: "Remote & technical routes" },
    ],
  },
  {
    key: "altitude",
    label: "Altitude comfort zone?",
    sub: "Max elevation you're comfortable reaching",
    options: [
      { value: "low",      icon: "🌿", label: "Below 2,600m", sub: "Low alpine" },
      { value: "moderate", icon: "🏞️", label: "Up to 4,000m", sub: "Standard Himalayan" },
      { value: "high",     icon: "🏔️", label: "Up to 5,200m", sub: "High altitude" },
      { value: "extreme",  icon: "🌋", label: "No limit",      sub: "Acclimatised & prepared" },
    ],
  },
  {
    key: "accommodation",
    label: "How do you want to sleep?",
    sub: "This shapes the whole character of a trek",
    options: [
      { value: "lodges",  icon: "🛏️", label: "Lodges & huts", sub: "Teahouses, rifugios, refuges" },
      { value: "camping", icon: "⛺",  label: "Wild camping",   sub: "Carry tent & cook your own" },
      { value: "either",  icon: "🤝",  label: "Either",         sub: "Open to both" },
    ],
  },
  {
    key: "region",
    label: "Any preferred region?",
    sub: "Or let us search the whole world",
    options: [
      { value: "himalaya",      icon: "🇳🇵", label: "Himalaya",      sub: "Nepal, India, Bhutan" },
      { value: "europe",        icon: "🇪🇺", label: "Europe",        sub: "Alps, Dolomites & beyond" },
      { value: "south america", icon: "🌎",  label: "South America", sub: "Andes & Patagonia" },
      { value: "north america", icon: "🇺🇸", label: "N. America",    sub: "Rockies & Sierra Nevada" },
      { value: "africa",        icon: "🌍",  label: "Africa",        sub: "Kilimanjaro & beyond" },
      { value: "oceania",       icon: "🇳🇿", label: "Oceania",       sub: "NZ Great Walks" },
      { value: "anywhere",      icon: "🌐",  label: "Anywhere",      sub: "Show me the world" },
    ],
  },
  {
    key: "vibe",
    label: "What's the vibe you're after?",
    sub: "The feeling you want to come home with",
    options: [
      { value: "iconic",   icon: "⭐", label: "Iconic bucket-list", sub: "Famous routes everyone knows" },
      { value: "remote",   icon: "🧭", label: "Off the beaten path", sub: "Fewer people, raw adventure" },
      { value: "scenic",   icon: "📸", label: "Maximum scenery",     sub: "Glaciers, peaks, dramatic landscapes" },
      { value: "cultural", icon: "🏘️", label: "Cultural immersion",  sub: "Villages, monasteries, local life" },
    ],
  },
];

// ── Main page ─────────────────────────────────────────────────────────────────
type Phase = "intro" | "questions" | "thinking" | "results";

const EMPTY_PREFS: Prefs = {
  duration: "", experience: "", altitude: "",
  accommodation: "", region: "", vibe: "",
};

const THINK_STEPS = [
  "Reading your preferences…",
  "Scanning trek database…",
  "Checking altitude tolerance…",
  "Matching accommodation style…",
  "Scoring best candidates…",
  "Finalising your top 5…",
];

export default function TrekFinder() {
  const [phase, setPhase]           = useState<Phase>("intro");
  const [prefs, setPrefs]           = useState<Prefs>(EMPTY_PREFS);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults]       = useState<ScoredTrek[]>([]);
  const [thinkStep, setThinkStep]   = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setP = useCallback(<K extends keyof Prefs>(key: K, val: Prefs[K]) => {
    setPrefs(p => ({ ...p, [key]: val }));
  }, []);

  const currentStepDef = STEPS[currentStep];
  const currentValue   = prefs[currentStepDef?.key as keyof Prefs];
  const isLastStep     = currentStep === STEPS.length - 1;

  const goNext = useCallback(() => {
    if (!currentValue) return;
    if (isLastStep) {
      // kick off search
      setPhase("thinking");
      setThinkStep(0);
      let i = 0;
      timerRef.current = setInterval(() => {
        i++;
        setThinkStep(i);
        if (i >= THINK_STEPS.length) {
          clearInterval(timerRef.current!);
          const top = getTopMatches(prefs);
          setResults(top);
          setTimeout(() => setPhase("results"), 400);
        }
      }, 400);
    } else {
      setCurrentStep(s => s + 1);
    }
  }, [currentValue, isLastStep, prefs]);

  const goBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
    else setPhase("intro");
  }, [currentStep]);

  const reset = useCallback(() => {
    clearInterval(timerRef.current!);
    setPrefs(EMPTY_PREFS);
    setCurrentStep(0);
    setResults([]);
    setThinkStep(0);
    setPhase("intro");
  }, []);

  useEffect(() => () => clearInterval(timerRef.current!), []);

  // Auto-advance on selection (except last step — show confirm button)
  const handleOptionClick = useCallback((key: string, val: string) => {
    setP(key as keyof Prefs, val as any);
    if (key !== "vibe") {
      // small delay so the selection highlight is visible before advancing
      setTimeout(() => {
        setCurrentStep(s => {
          const next = s + 1;
          if (next >= STEPS.length) return s; // handled by goNext
          return next;
        });
      }, 200);
    }
  }, [setP]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>AI Trek Finder — Find Your Perfect Trek | TrekMind</title>
        <meta name="description" content="Answer 6 quick questions and TrekMind's AI matches you with your perfect trek from 100 world-class routes. Personalised by experience, altitude, duration and region." />
        <link rel="canonical" href="https://trekmind.pages.dev/trek-finder" />
      </Helmet>

      {/* Header */}
      <header className="bg-foreground text-background py-4 px-4 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="max-w-2xl mx-auto relative z-10">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Back to Globe
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">AI Trek Finder</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
            Find Your Perfect Trek
          </h1>
          <p className="text-white/70 text-sm mt-1">
            6 questions. Matched from {(getAllTreks() as any[]).length} world-class routes.
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8">

        {/* ── INTRO ──────────────────────────────────────────────────────────── */}
        {phase === "intro" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Globe,    label: "Global database",   sub: `${(getAllTreks() as any[]).length} curated treks` },
                { icon: Sparkles, label: "AI matched",        sub: "Scored to your profile" },
                { icon: Mountain, label: "Safety first",      sub: "Altitude-aware filtering" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground">{label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-foreground">How it works</h2>
              {[
                "Answer 6 questions about your trip length, experience, and preferences",
                "Our algorithm scores every trek in the database against your answers",
                "Get your top 5 personalised matches with reasons why they fit",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {s}
                </div>
              ))}
            </div>

            <button
              onClick={() => setPhase("questions")}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-4 text-base font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-5 h-5" />
              Start Trek Finder
            </button>
          </div>
        )}

        {/* ── QUESTIONS ──────────────────────────────────────────────────────── */}
        {phase === "questions" && currentStepDef && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep}>
            <StepIndicator current={currentStep} total={STEPS.length} />

            <div>
              <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                Question {currentStep + 1} of {STEPS.length}
              </div>
              <h2 className="text-xl font-bold text-foreground">{currentStepDef.label}</h2>
              <p className="text-sm text-muted-foreground mt-1">{currentStepDef.sub}</p>
            </div>

            <div className={cn(
              "grid gap-3",
              currentStepDef.options.length <= 4 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
            )}>
              {currentStepDef.options.map(opt => (
                <OptionButton
                  key={opt.value}
                  value={opt.value}
                  selected={currentValue === opt.value}
                  onClick={() => {
                    setP(currentStepDef.key as keyof Prefs, opt.value as any);
                    if (!isLastStep) {
                      setTimeout(() => setCurrentStep(s => s + 1), 220);
                    }
                  }}
                  icon={opt.icon}
                  label={opt.label}
                  sub={opt.sub}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2.5 rounded-xl border border-border hover:bg-muted/30"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {isLastStep && (
                <button
                  disabled={!currentValue}
                  onClick={goNext}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all",
                    currentValue
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Find My Treks
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── THINKING ───────────────────────────────────────────────────────── */}
        {phase === "thinking" && (
          <div className="py-16 text-center space-y-8 animate-in fade-in duration-300">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2 max-w-xs mx-auto text-left">
              {THINK_STEPS.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "flex items-center gap-2.5 text-sm transition-all duration-300",
                    i < thinkStep ? "text-foreground" : "text-muted-foreground/30"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center text-xs shrink-0",
                    i < thinkStep ? "bg-green-100 text-green-600" : "bg-muted"
                  )}>
                    {i < thinkStep ? "✓" : ""}
                  </span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULTS ────────────────────────────────────────────────────────── */}
        {phase === "results" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Your Top 5 Treks</h2>
                <p className="text-sm text-muted-foreground">
                  Matched from {(getAllTreks() as any[]).length} routes worldwide
                </p>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl px-3 py-2 hover:bg-muted/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start over
              </button>
            </div>

            {/* Preference summary chips */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(prefs).filter(([, v]) => v).map(([k, v]) => (
                <span key={k} className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 capitalize">
                  {String(v).replace(/_/g, " ")}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              {results.length > 0
                ? results.map((r, i) => (
                    <TrekResultCard key={r.trek.id} result={r} rank={i + 1} />
                  ))
                : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mountain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No close matches found</p>
                    <p className="text-sm mt-1">Try relaxing your altitude or region filters</p>
                    <button onClick={reset} className="mt-4 text-primary text-sm underline">Start over</button>
                  </div>
                )}
            </div>

            {results.length > 0 && (
              <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground/70">How matches work: </span>
                Each trek is scored against your 6 preferences. Altitude safety is weighted highest — treks above your comfort zone are always excluded. Scores combine duration fit, difficulty match, accommodation type, region, and vibe.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
