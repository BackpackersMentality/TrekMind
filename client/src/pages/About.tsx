// About.tsx — TrekMind Info & About page
// Route: /about
// Purpose: SEO-rich explainer covering tier system, curation philosophy, how to use the app

import React from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Globe2, Mountain, Zap, Compass, Star,
  Map, Filter, Sparkles, Trophy, ChevronRight, Info,
  BookOpen, Shield, Users, Clock, Timer, TrendingUp
} from "lucide-react";
import { getAllTreks } from "../lib/treks";

// ── Tier definition data ──────────────────────────────────────────────────────

const TIERS = [
  {
    number: 1,
    name: "Iconic",
    colour: "amber",
    dot: "bg-amber-400",
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-800",
    badge: "bg-amber-100 text-amber-800",
    description: "The world's most celebrated trekking routes — routes that define what adventure travel means. Everest Base Camp, Tour du Mont Blanc, the Inca Trail. Every serious trekker has these on their list. Well-maintained infrastructure, clear trails, and extraordinary landscapes that have earned their global reputations.",
    examples: ["Everest Base Camp", "Tour du Mont Blanc", "Inca Trail", "Kilimanjaro", "Milford Track"],
    stats: { count: 25, avgDays: "7–14 days", difficulty: "Moderate to Challenging" }
  },
  {
    number: 2,
    name: "Classic",
    colour: "blue",
    dot: "bg-blue-400",
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-800",
    badge: "bg-blue-100 text-blue-800",
    description: "Exceptional routes known deeply within the trekking community — the trails serious hikers graduate to after completing the icons. Less crowded than Tier 1 but no less spectacular. Kanchenjunga Base Camp, Cerro Castillo, the Dolomites Alta Via routes. Often harder to access and logistically more demanding.",
    examples: ["Kanchenjunga BC", "Cerro Castillo", "Alta Via 1", "Teton Crest", "Roraima"],
    stats: { count: 43, avgDays: "5–12 days", difficulty: "Moderate to Hard" }
  },
  {
    number: 3,
    name: "Remote",
    colour: "slate",
    dot: "bg-slate-400",
    border: "border-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-700",
    badge: "bg-slate-100 text-slate-700",
    description: "Wilderness routes for experienced trekkers who want genuine remoteness — minimal infrastructure, limited waymarking, and landscapes that feel genuinely untouched. These demand navigation skills, self-sufficiency, and strong fitness. The payoff is solitude in some of the most extraordinary terrain on Earth.",
    examples: ["Dusky Track", "Wind River High Route", "Huemul Circuit", "Tusheti", "Dhaulagiri Circuit"],
    stats: { count: 25, avgDays: "7–21 days", difficulty: "Hard to Very Hard" }
  },
  {
    number: 4,
    name: "Thru-Hike",
    colour: "violet",
    dot: "bg-violet-400",
    border: "border-violet-200",
    bg: "bg-violet-50",
    text: "text-violet-800",
    badge: "bg-violet-100 text-violet-800",
    description: "The great long trails — routes measured in months rather than days. The Appalachian Trail, Pacific Crest Trail, Te Araroa, the Great Himalaya Trail. Completing a thru-hike is a life-defining undertaking that requires months of planning, significant logistical support, and unwavering commitment. Most are completed as sections over multiple years.",
    examples: ["Appalachian Trail", "Pacific Crest Trail", "Te Araroa", "Great Himalaya Trail", "CDT"],
    stats: { count: 7, avgDays: "30–165 days", difficulty: "Extreme (multi-month)" }
  }
];

// ── Feature cards ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Globe2 className="w-5 h-5" />,
    title: "Interactive 3D Globe",
    desc: "Every trek is pinned on a real-time rotatable globe. Spin to explore continents, zoom into mountain ranges, and discover routes you've never heard of."
  },
  {
    icon: <Filter className="w-5 h-5" />,
    title: "Smart Filtering",
    desc: "Filter by region, terrain type, duration, accommodation style, and difficulty tier. Find exactly the right trek for your timeframe and experience level."
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI Trek Finder",
    desc: "Answer a few questions about your experience, preferences, and timeframe. The AI Trek Finder matches you with routes tailored to your profile."
  },
  {
    icon: <Map className="w-5 h-5" />,
    title: "Detailed Itineraries",
    desc: "Day-by-day route breakdowns with elevation data, overnight stops, and key highlights for all 100 treks — including full section maps for the thru-hikes."
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Top 100 Ranking",
    desc: "A composite-scored definitive ranking of the top 100 routes. Sort by overall ranking, iconic status, altitude drama, short adventures, or hidden gems."
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Editorial Guides",
    desc: "Each trek includes a curated editorial — what makes it special, the six defining highlights, and the essential context to understand why it's on the list."
  }
];

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How were the 135 treks chosen?",
    a: "We evaluated hundreds of routes against four criteria: landscape quality, cultural significance, trekking infrastructure, and global recognition within the adventure travel community. The list deliberately spans all continents and all difficulty levels — from a 2-day coastal walk to a 165-day thru-hike."
  },
  {
    q: "What's the difference between a multi-day trek and a thru-hike?",
    a: "Multi-day treks (Tiers 1–3) are typically completed as a single continuous journey over days or weeks. Thru-hikes (Tier 4) are long trails measured in months — the Appalachian Trail takes 5–7 months, the Great Himalaya Trail up to 150 days. Most people complete thru-hikes in sections over multiple years rather than as a single journey."
  },
  {
    q: "Are the difficulty ratings official?",
    a: "No — the tier system is TrekMind's editorial classification based on trail infrastructure, remoteness, elevation, and the experience level typically required. Always research individual treks thoroughly and consult national park authorities, local guides, and recent trip reports before setting out."
  },
  {
    q: "How current is the trek information?",
    a: "Trek data (distances, elevations, seasons) is based on established sources and is accurate for normal conditions. Trail conditions, permit requirements, and accessibility can change due to weather, geopolitical situations, or environmental closures. Always verify current conditions with official sources before departure."
  },
  {
    q: "Can I plan my full trip using TrekMind?",
    a: "TrekMind is a discovery and planning inspiration tool — it helps you find and understand the world's greatest routes. For full trip planning you'll need specialist operators, current permit information, gear lists, and ideally local guide services. Our itineraries and editorial content give you the foundation to start that planning."
  }
];


// ── Tier page: mini trek card ─────────────────────────────────────────────────

function TierTrekCard({ trek, tier }: { trek: any; tier: typeof TIERS[0] }) {
  return (
    <Link href={`/trek/${trek.id}`}>
      <div className={`group rounded-xl border ${tier.border} bg-white hover:${tier.bg} transition-all cursor-pointer overflow-hidden flex gap-3 p-2.5 items-center`}>
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
          {trek.imageUrl ? (
            <img
              src={trek.imageUrl}
              alt={trek.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${tier.bg}`}>
              <Mountain className={`w-4 h-4 ${tier.text}`} />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-foreground truncate leading-tight">{trek.name}</p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{trek.country}</p>
          <div className={`flex items-center gap-2 mt-1 text-[9px] font-semibold ${tier.text}`}>
            {trek.totalDays && <span className="flex items-center gap-0.5"><Timer className="w-2.5 h-2.5" />{trek.totalDays}</span>}
            {(trek.maxAltitude || trek.maxAltitudeM) && (
              <span className="flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{trek.maxAltitude || trek.maxAltitudeM}</span>
            )}
          </div>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${tier.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
    </Link>
  );
}


// ── Tier browser component ────────────────────────────────────────────────────

function TierBrowser() {
  const [openTier, setOpenTier] = React.useState<number | null>(1);
  const allTreks = React.useMemo(() => getAllTreks(), []);

  return (
    <div className="space-y-3">
      {TIERS.map(tier => {
        const tierTreks = allTreks.filter((t: any) => t.tier === tier.number);
        const isOpen = openTier === tier.number;
        return (
          <div key={tier.number} className={`rounded-2xl border ${tier.border} overflow-hidden transition-all`}>
            {/* Tier header — tap to expand */}
            <button
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${isOpen ? tier.bg : "bg-white hover:" + tier.bg}`}
              onClick={() => setOpenTier(isOpen ? null : tier.number)}
            >
              <div className={`w-9 h-9 rounded-full ${tier.dot} flex items-center justify-center shadow-sm shrink-0`}>
                <span className="text-white font-black text-sm">{tier.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-black text-sm ${tier.text}`}>Tier {tier.number} — {tier.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.badge}`}>
                    {tierTreks.length} treks
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{tier.stats.avgDays} · {tier.stats.difficulty}</p>
              </div>
              <ChevronRight className={`w-4 h-4 ${tier.text} transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90" : ""}`} />
            </button>

            {/* Trek grid */}
            {isOpen && (
              <div className={`${tier.bg} border-t ${tier.border} px-3 py-3`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {tierTreks.map((trek: any) => (
                    <TierTrekCard key={trek.id} trek={trek} tier={tier} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-amber-400 rounded-full" />
        <span className="text-amber-600 text-[11px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{title}</h2>
      {sub && <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{sub}</p>}
    </div>
  );
}

// ── Tier card ─────────────────────────────────────────────────────────────────

function TierCard({ tier }: { tier: typeof TIERS[0] }) {
  return (
    <div className={`rounded-2xl border ${tier.border} ${tier.bg} p-5 flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${tier.dot} flex items-center justify-center shadow-md shrink-0`}>
          <span className="text-white font-black text-sm">{tier.number}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-black text-base ${tier.text}`}>Tier {tier.number}</h3>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${tier.badge}`}>
              {tier.name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{tier.stats.count} treks · {tier.stats.avgDays} · {tier.stats.difficulty}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground/80 leading-relaxed">{tier.description}</p>

      {/* Examples */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Examples</p>
        <div className="flex flex-wrap gap-1.5">
          {tier.examples.map(ex => (
            <span key={ex} className={`text-[11px] px-2 py-0.5 rounded-full border ${tier.border} ${tier.text} font-medium`}>
              {ex}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FAQ item ──────────────────────────────────────────────────────────────────

function FaqItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  return (
    <div className="border-b border-border/50 py-4 last:border-0">
      <div className="flex gap-3">
        <span className="text-amber-500 font-black text-sm mt-0.5 shrink-0">Q{index + 1}</span>
        <div>
          <p className="font-bold text-sm text-foreground mb-1.5">{faq.q}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>About TrekMind — World's Top Trekking Routes Explained</title>
        <meta name="description" content="Discover how TrekMind curates and ranks the world's greatest trekking routes. Learn about our tier system — from Iconic classics to remote wilderness and epic thru-hikes." />
        <meta name="keywords" content="best trekking routes world, tier 1 treks, thru hiking explained, iconic hikes, trekking difficulty ratings, adventure travel guide" />
        <link rel="canonical" href="https://trekmind.pages.dev/about" />
        <meta property="og:title" content="About TrekMind — The World's Top 100 Treks Explained" />
        <meta property="og:description" content="How we rank and categorise the world's greatest trekking routes — from multi-day hikes to 165-day thru-hikes." />
        <meta property="og:url" content="https://trekmind.pages.dev/about" />
      </Helmet>

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-4 pb-8">
          {/* Back */}
          <Link href="/">
            <button className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium mb-4 transition-colors group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to Globe
            </button>
          </Link>

          <div className="flex items-start gap-3 mb-3">
            <div className="w-1 h-12 bg-amber-400 rounded-full mt-1 shrink-0" />
            <div>
              <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-1">The Definitive Guide</p>
              <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight">
                About TrekMind
              </h1>
              <p className="text-white/65 text-sm mt-2 leading-relaxed max-w-xl">
                How we discovered, ranked, and documented the greatest trekking routes on Earth — from a two-day coastal walk to a five-month wilderness crossing.
              </p>
            </div>
          </div>

          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { icon: <Mountain className="w-3 h-3" />, label: "135 World-Class Routes" },
              { icon: <Globe2 className="w-3 h-3" />, label: "6 Continents" },
              { icon: <Clock className="w-3 h-3" />, label: "2 Days to 165 Days" },
              { icon: <Shield className="w-3 h-3" />, label: "4 Difficulty Tiers" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1">
                <span className="text-amber-400">{icon}</span>
                <span className="text-white text-[11px] font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-20 space-y-14">

        {/* What is TrekMind */}
        <section>
          <SectionHeader
            label="Our Mission"
            title="What is TrekMind?"
            sub="A curated discovery platform for the world's greatest trekking routes — built for everyone from first-time multi-day hikers to veteran thru-hikers."
          />
          <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed space-y-3">
            <p>
              TrekMind exists because finding the right trekking route is genuinely hard. Dozens of guidebooks, thousands of travel blogs, and contradictory forum posts make it difficult to understand the landscape of what's actually possible — and to match your experience level, timeframe, and ambition to a route that will be meaningful rather than overwhelming.
            </p>
            <p>
              We curated 135 routes from every continent, spanning the full spectrum of difficulty and duration, then built tools to help you discover, compare, and plan them. The 3D globe puts them in geographical context. The tier system helps you understand what you're signing up for. The AI Trek Finder matches your profile to routes you might not have considered.
            </p>
            <p>
              The goal is simple: to be the starting point for anyone who wants to explore the world on foot at a serious level.
            </p>
          </div>
        </section>

        {/* Tier system — definition cards first */}
        <section>
          <SectionHeader
            label="Understanding Difficulty"
            title="The Four-Tier System"
            sub="Every trek in TrekMind is classified into one of four tiers based on infrastructure, remoteness, elevation, and the experience level typically required."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIERS.map(tier => <TierCard key={tier.number} tier={tier} />)}
          </div>
          <div className="mt-4 p-4 bg-muted/40 rounded-xl border border-border/50">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Important:</strong> Tier ratings are TrekMind's editorial classifications, not official gradings. Trail conditions, seasonal weather, and individual fitness levels significantly affect the experience. Always research current conditions, obtain required permits, and consider a licensed local guide for Tier 3 and Tier 4 routes.
              </p>
            </div>
          </div>
        </section>

        {/* Tier browser — browse treks by tier, now after the tier definitions */}
        <section id="tiers">
          <SectionHeader
            label="Browse by Tier"
            title="The Four Tiers"
            sub="Every trek ranked and categorised. Tap any route to read the full guide."
          />
          <TierBrowser />
        </section>

        {/* Features */}
        <section>
          <SectionHeader
            label="How It Works"
            title="Using TrekMind"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-3 p-4 rounded-xl border border-border/60 bg-card hover:border-amber-200 hover:bg-amber-50/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground mb-0.5">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Curation philosophy */}
        <section>
          <SectionHeader
            label="Curation"
            title="How We Choose the Treks"
            sub="Not every famous trail is world-class. Not every world-class trail is famous."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Mountain className="w-4 h-4" />, title: "Landscape Quality", desc: "The route must pass through genuinely exceptional terrain — not just accessible or popular, but visually and experientially outstanding." },
              { icon: <Users className="w-4 h-4" />, title: "Community Standing", desc: "We weight routes that experienced trekkers across the world's hiking communities consistently identify as bucket-list calibre." },
              { icon: <Compass className="w-4 h-4" />, title: "Geographic Spread", desc: "The list must represent global trekking culture — we deliberately include routes from underrepresented regions alongside the well-known classics." },
              { icon: <Zap className="w-4 h-4" />, title: "Range of Experience", desc: "From a 2-day track to a 165-day thru-hike, the list spans the full spectrum so every trekker finds something appropriate and aspirational." },
            ].map(c => (
              <div key={c.title} className="flex gap-3 p-4 rounded-xl border border-border/50 bg-card">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 text-foreground/60 flex items-center justify-center shrink-0">
                  {c.icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground mb-0.5">{c.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <SectionHeader
            label="Common Questions"
            title="FAQ"
          />
          <div className="rounded-2xl border border-border/60 bg-card px-5 divide-y divide-border/40">
            {FAQS.map((faq, i) => <FaqItem key={i} faq={faq} index={i} />)}
          </div>
        </section>

        {/* CTA strip */}
        <section className="rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative z-10 px-6 py-8 text-center">
            <h3 className="text-xl font-black text-white mb-2">Ready to find your route?</h3>
            <p className="text-white/65 text-sm mb-5">Explore all 100 treks on the globe, or let the AI Trek Finder match you to your perfect adventure.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-bold rounded-full shadow-lg hover:bg-white/90 transition-all">
                  <Globe2 className="w-4 h-4" />
                  Explore the Globe
                </button>
              </Link>
              <Link href="/trek-finder">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-full shadow-lg hover:bg-amber-400 transition-all">
                  <Sparkles className="w-4 h-4" />
                  Find My Trek
                </button>
              </Link>
              <Link href="/top-100">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/25 text-white text-sm font-bold rounded-full hover:bg-white/20 transition-all backdrop-blur-sm">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Top 100 List
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-1 shrink-0">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-bold text-[10px] text-foreground">TrekMind</p>
          <p className="text-[7px] text-muted-foreground">
            © 2024 TrekMind. Information is for discovery purposes. Always verify current conditions, permits, and safety requirements with official sources before trekking. Adventure responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}
