// About.tsx — TrekMind Info & About page
// Route: /about
// Updated: New tier colours (Gold/Burnt Orange/Forest Green/Deep Purple/Alpine Blue)
//          Accordion-style tier browser, Gear Assistant in features, Contact Us section

import React from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Globe2, Mountain, Zap, Compass,
  Map, Filter, Sparkles, Trophy, ChevronRight, Info,
  BookOpen, Shield, Users, Clock, Timer, TrendingUp, Pickaxe, Mail
} from "lucide-react";
import { getAllTreks } from "../lib/treks";

// ── Tier colour tokens — matches GlobeViewer TIER_COLORS exactly ─────────────
const TIER_TOKENS = {
  1: { hex: "#D4AF37", light: "#FDF8E7", border: "#EBD97A", textHex: "#7A5C00", badgeBg: "#F7EDB8", name: "Iconic" },
  2: { hex: "#E67E22", light: "#FEF3E9", border: "#F0A868", textHex: "#8B4000", badgeBg: "#FCDBB8", name: "Classic" },
  3: { hex: "#2E7D32", light: "#EBF5EC", border: "#81C784", textHex: "#1B5E20", badgeBg: "#C8E6C9", name: "Remote" },
  4: { hex: "#6A4C93", light: "#F3EFF8", border: "#B39DDB", textHex: "#4A0D6E", badgeBg: "#D1C4E9", name: "Thru-Hike" },
  5: { hex: "#2E86C1", light: "#EBF4FB", border: "#90CAF9", textHex: "#0D47A1", badgeBg: "#BBDEFB", name: "Trekking Peak" },
} as const;
type TierNum = keyof typeof TIER_TOKENS;

// ── Tier definition data ──────────────────────────────────────────────────────
const TIERS = [
  { number: 1 as TierNum, description: "The world's most celebrated trekking routes — routes that define what adventure travel means. Everest Base Camp, Tour du Mont Blanc, the Inca Trail. Every serious trekker has these on their list. Well-maintained infrastructure, clear trails, and extraordinary landscapes that have earned their global reputations.", examples: ["Everest Base Camp", "Tour du Mont Blanc", "Inca Trail", "Kilimanjaro", "Milford Track"], stats: { count: 30, avgDays: "7–14 days", difficulty: "Moderate to Challenging" } },
  { number: 2 as TierNum, description: "Exceptional routes known deeply within the trekking community — the trails serious hikers graduate to after completing the icons. Less crowded than Tier 1 but no less spectacular. Kanchenjunga Base Camp, Cerro Castillo, the Dolomites Alta Via routes. Often harder to access and logistically more demanding.", examples: ["Kanchenjunga BC", "Cerro Castillo", "Alta Via 1", "Teton Crest", "Roraima"], stats: { count: 59, avgDays: "5–12 days", difficulty: "Moderate to Hard" } },
  { number: 3 as TierNum, description: "Wilderness routes for experienced trekkers who want genuine remoteness — minimal infrastructure, limited waymarking, and landscapes that feel genuinely untouched. These demand navigation skills, self-sufficiency, and strong fitness. The payoff is solitude in some of the most extraordinary terrain on Earth.", examples: ["Dusky Track", "Wind River High Route", "Huemul Circuit", "Tusheti", "Dhaulagiri Circuit"], stats: { count: 34, avgDays: "7–21 days", difficulty: "Hard to Very Hard" } },
  { number: 4 as TierNum, description: "The great long trails — routes measured in months rather than days. The Appalachian Trail, Pacific Crest Trail, Te Araroa, the Great Himalaya Trail. Completing a thru-hike is a life-defining undertaking that requires months of planning, significant logistical support, and unwavering commitment.", examples: ["Appalachian Trail", "Pacific Crest Trail", "Te Araroa", "Great Himalaya Trail", "CDT"], stats: { count: 12, avgDays: "30–165 days", difficulty: "Extreme (multi-month)" } },
  { number: 5 as TierNum, description: "The gateway to the summit. Trekking peaks are high-altitude mountains — mostly between 5000m and 6500m — that bridge the gap between hiking and technical mountaineering. Crampons, ice axes, and rope travel are required, but advanced rock climbing or aid techniques are not.", examples: ["Island Peak", "Mera Peak", "Huayna Potosí", "Cotopaxi", "Mount Elbrus"], stats: { count: 15, avgDays: "2–16 days", difficulty: "Challenging to Technical" } },
];

const FEATURES = [
  { icon: <Globe2 className="w-5 h-5" />, title: "Interactive 3D Globe", desc: "Every trek is pinned on a real-time rotatable globe. Spin to explore continents, zoom into mountain ranges, and discover routes you've never heard of." },
  { icon: <Filter className="w-5 h-5" />, title: "Smart Filtering", desc: "Filter by region, terrain type, duration, accommodation style, difficulty tier, and when to trek by month. Find exactly the right route for your timeframe and experience level." },
  { icon: <Sparkles className="w-5 h-5" />, title: "AI Trek Finder", desc: "Answer a few questions about your experience, preferences, and timeframe. The AI Trek Finder matches you with routes tailored to your profile." },
  { icon: <Map className="w-5 h-5" />, title: "Detailed Itineraries", desc: "Day-by-day route breakdowns with elevation data, overnight stops, and key highlights for all 150 treks — including full section maps and summit approach details." },
  { icon: <Trophy className="w-5 h-5" />, title: "Top 100 Ranking", desc: "A composite-scored definitive ranking of the top 100 routes. Sort by overall ranking, iconic status, altitude drama, short adventures, or hidden gems." },
  { icon: <BookOpen className="w-5 h-5" />, title: "Editorial Guides", desc: "Each trek includes a curated editorial — what makes it special, the six defining highlights, and the essential context to understand why it's on the list." },
  { icon: <Pickaxe className="w-5 h-5" />, title: "Gear Assistant", desc: "Every trek has tailored gear recommendations across three budgets — including full alpinism kit for Tier 5 trekking peaks. Linked to independently reviewed equipment on Backpacker's Mentality." },
];

const FAQS = [
  { q: "How were the 150 treks chosen?", a: "We evaluated hundreds of routes against four criteria: landscape quality, cultural significance, trekking infrastructure, and global recognition within the adventure travel community. The list spans all continents and all difficulty levels — from a 2-day coastal walk to a 165-day thru-hike, and now includes 15 trekking peaks for those stepping into technical alpinism." },
  { q: "What exactly is a Tier 5 Trekking Peak?", a: "Trekking peaks are mountains — mostly between 5000m and 6500m — that require basic mountaineering skills: crampons, ice axe, rope travel, and glacier awareness. They are not technical rock climbs or full expeditions, but they demand more than trekking fitness alone. All 15 Tier 5 peaks have multi-day approaches with proper base camps and overnight stays. Examples include Mera Peak (Nepal), Huayna Potosí (Bolivia), Cotopaxi (Ecuador), and Mount Elbrus (Russia)." },
  { q: "Do I need mountaineering experience for a Tier 5 peak?", a: "Most Tier 5 peaks are achievable with no prior technical climbing experience, provided you are very fit, have prior high-altitude trekking above 4000m, and climb with a qualified guide. Peaks like Huayna Potosí and Yala Peak are suited as first alpinism objectives. Lobuche East and Pisang Peak demand more technical confidence. Always climb with a licensed mountain guide." },
  { q: "What's the difference between a multi-day trek and a thru-hike?", a: "Multi-day treks (Tiers 1–3) are typically completed as a single continuous journey over days or weeks. Thru-hikes (Tier 4) are long trails measured in months — the Appalachian Trail takes 5–7 months, the Great Himalaya Trail up to 150 days. Most people complete thru-hikes in sections over multiple years." },
  { q: "Are the difficulty ratings official?", a: "No — the tier system is TrekMind's editorial classification based on trail infrastructure, remoteness, elevation, and the experience level typically required. Always research individual treks thoroughly and consult national park authorities, local guides, and recent trip reports before setting out." },
  { q: "How current is the trek information?", a: "Trek data (distances, elevations, seasons) is based on established sources and is accurate for normal conditions. Trail conditions, permit requirements, and accessibility can change due to weather, geopolitical situations, or environmental closures. Always verify current conditions with official sources before departure." },
  { q: "Can I plan my full trip using TrekMind?", a: "TrekMind is a discovery and planning inspiration tool — it helps you find and understand the world's greatest routes. For full trip planning you'll need specialist operators, current permit information, gear lists, and ideally local guide services. Our itineraries and editorial content give you the foundation to start that planning." },
];

function TierTrekCard({ trek, tierNum }: { trek: any; tierNum: TierNum }) {
  const t = TIER_TOKENS[tierNum];
  return (
    <Link href={`/trek/${trek.id}`}>
      <div className="group rounded-xl overflow-hidden flex gap-3 p-2.5 items-center cursor-pointer transition-colors duration-150" style={{ border: `1px solid ${t.border}`, background: "#fff" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = t.light; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
          {trek.imageUrl ? (
            <img src={trek.imageUrl} alt={trek.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: t.light }}>
              <Mountain className="w-4 h-4" style={{ color: t.textHex }} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-foreground truncate leading-tight">{trek.name}</p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{trek.country}</p>
          <div className="flex items-center gap-2 mt-1 text-[9px] font-semibold" style={{ color: t.textHex }}>
            {trek.totalDays && <span className="flex items-center gap-0.5"><Timer className="w-2.5 h-2.5" />{trek.totalDays}</span>}
            {(trek.maxAltitude || trek.maxAltitudeM) && <span className="flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{trek.maxAltitude || trek.maxAltitudeM}</span>}
          </div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: t.textHex }} />
      </div>
    </Link>
  );
}

function TierBrowser() {
  const [openTier, setOpenTier] = React.useState<TierNum | null>(1);
  const allTreks = React.useMemo(() => getAllTreks(), []);
  return (
    <div className="space-y-3">
      {TIERS.map(tierDef => {
        const tn = tierDef.number;
        const t = TIER_TOKENS[tn];
        const tierTreks = (allTreks as any[]).filter(tr => tr.tier === tn);
        const isOpen = openTier === tn;
        return (
          <div key={tn} className="rounded-2xl overflow-hidden transition-all" style={{ border: `1px solid ${t.border}` }}>
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
              style={{ background: isOpen ? t.light : "#fff" }}
              onClick={() => setOpenTier(isOpen ? null : tn)}
              onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = t.light; }}
              onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = "#fff"; }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm shrink-0" style={{ background: t.hex }}>
                <span className="text-white font-black text-sm">{tn}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm" style={{ color: t.textHex }}>Tier {tn} — {t.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: t.badgeBg, color: t.textHex }}>{tierTreks.length} treks</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{tierDef.stats.avgDays} · {tierDef.stats.difficulty}</p>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90" : ""}`} style={{ color: t.textHex }} />
            </button>
            {isOpen && (
              <div className="border-t px-3 py-3" style={{ background: t.light, borderColor: t.border }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {tierTreks.map((trek: any) => <TierTrekCard key={trek.id} trek={trek} tierNum={tn} />)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TierCard({ tierDef }: { tierDef: typeof TIERS[0] }) {
  const t = TIER_TOKENS[tierDef.number];
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ border: `1px solid ${t.border}`, background: t.light }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md shrink-0" style={{ background: t.hex }}>
          <span className="text-white font-black text-sm">{tierDef.number}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-base" style={{ color: t.textHex }}>Tier {tierDef.number}</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: t.badgeBg, color: t.textHex }}>{t.name}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{tierDef.stats.count} routes · {tierDef.stats.avgDays} · {tierDef.stats.difficulty}</p>
        </div>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">{tierDef.description}</p>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Examples</p>
        <div className="flex flex-wrap gap-1.5">
          {tierDef.examples.map(ex => (
            <span key={ex} className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ border: `1px solid ${t.border}`, color: t.textHex }}>{ex}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

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

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>About TrekMind — World's Top Trekking Routes & Peaks Explained</title>
        <meta name="description" content="Discover how TrekMind curates and ranks the world's greatest trekking routes and trekking peaks. Learn about our five-tier system — from Iconic classics to remote wilderness, epic thru-hikes, and beginner alpinism peaks." />
        <meta name="keywords" content="best trekking routes world, trekking peaks, beginner alpinism, tier 1 treks, thru hiking explained, iconic hikes, trekking difficulty ratings, adventure travel guide, Island Peak, Mera Peak, Huayna Potosi" />
        <link rel="canonical" href="https://trekmind.app/about" />
        <meta property="og:title" content="About TrekMind — The World's Top 150 Treks & Peaks Explained" />
        <meta property="og:description" content="How we rank and categorise the world's greatest trekking routes — from multi-day hikes to 165-day thru-hikes and beginner mountaineering peaks." />
        <meta property="og:url" content="https://trekmind.app/about" />
      </Helmet>

      <header className="relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-4 pb-8">
          <Link href="/"><button className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium mb-4 transition-colors group"><ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />Back to Globe</button></Link>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-1 h-12 bg-amber-400 rounded-full mt-1 shrink-0" />
            <div>
              <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-1">The Definitive Guide</p>
              <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight">About TrekMind</h1>
              <p className="text-white/65 text-sm mt-2 leading-relaxed max-w-xl">How we discovered, ranked, and documented the greatest trekking routes on Earth — from a two-day coastal walk to a five-month wilderness crossing, and into the summits themselves.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { icon: <Mountain className="w-3 h-3" />, label: "150 World-Class Routes" },
              { icon: <Globe2 className="w-3 h-3" />, label: "6 Continents" },
              { icon: <Clock className="w-3 h-3" />, label: "2 Days to 165 Days" },
              { icon: <Shield className="w-3 h-3" />, label: "5 Difficulty Tiers" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1">
                <span className="text-amber-400">{icon}</span>
                <span className="text-white text-[11px] font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-20 space-y-14">

        <section>
          <SectionHeader label="Our Mission" title="What is TrekMind?" sub="A curated discovery platform for the world's greatest trekking routes and trekking peaks — built for everyone from first-time multi-day hikers to those taking their first steps into alpinism." />
          <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed space-y-3">
            <p>TrekMind exists because finding the right trekking route is genuinely hard. Dozens of guidebooks, thousands of travel blogs, and contradictory forum posts make it difficult to understand the landscape of what's actually possible — and to match your experience level, timeframe, and ambition to a route that will be meaningful rather than overwhelming.</p>
            <p>We curated 150 routes from every continent, spanning the full spectrum of difficulty and duration, then built tools to help you discover, compare, and plan them. The 3D globe puts them in geographical context. The five-tier system helps you understand what you're signing up for. The AI Trek Finder matches your profile to routes you might not have considered.</p>
            <p>With the addition of Tier 5 — Trekking Peaks — TrekMind now covers the full progression from first hike to first summit. The goal is simple: to be the starting point for anyone who wants to explore the world on foot at a serious level.</p>
          </div>
        </section>

        {/* Tier 5 spotlight */}
        <section className="rounded-2xl p-6" style={{ border: `1px solid ${TIER_TOKENS[5].border}`, background: TIER_TOKENS[5].light }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md shrink-0" style={{ background: TIER_TOKENS[5].hex }}>
              <span className="text-white font-black text-sm">5</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base" style={{ color: TIER_TOKENS[5].textHex }}>Tier 5 — Trekking Peaks</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: TIER_TOKENS[5].badgeBg, color: TIER_TOKENS[5].textHex }}>15 peaks</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">The gateway between trekking and technical mountaineering</p>
            </div>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">Trekking peaks bridge the gap between hiking and serious alpinism. Most sit between 5000m and 6500m and require crampons, ice axes, and basic rope technique — but not advanced rock climbing skills. Every peak in Tier 5 has a genuine multi-day approach with at least one overnight stay.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Altitude range", value: "4061m – 6476m" },
              { label: "Skills needed", value: "Crampons, ice axe, rope" },
              { label: "Trip length", value: "2 – 16 days" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.65)", border: `1px solid ${TIER_TOKENS[5].border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: TIER_TOKENS[5].hex }}>{s.label}</p>
                <p className="text-sm font-bold" style={{ color: TIER_TOKENS[5].textHex }}>{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader label="Understanding Difficulty" title="The Five-Tier System" sub="Every route in TrekMind is classified into one of five tiers based on infrastructure, remoteness, elevation, and the experience level typically required." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIERS.map(td => <TierCard key={td.number} tierDef={td} />)}
          </div>
          <div className="mt-4 p-4 bg-muted/40 rounded-xl border border-border/50">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">Important:</strong> Tier ratings are TrekMind's editorial classifications, not official gradings. Trail conditions, seasonal weather, and individual fitness levels significantly affect the experience. Always research current conditions, obtain required permits, and consider a licensed local guide — especially for Tier 3, Tier 4, and all Tier 5 Trekking Peaks.</p>
            </div>
          </div>
        </section>

        <section id="tiers">
          <SectionHeader label="Browse by Tier" title="All Five Tiers" sub="Every trek and trekking peak ranked and categorised. Tap any route to read the full guide." />
          <TierBrowser />
        </section>

        <section>
          <SectionHeader label="How It Works" title="Using TrekMind" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-3 p-4 rounded-xl border border-border/60 bg-card hover:border-amber-200 hover:bg-amber-50/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">{f.icon}</div>
                <div>
                  <p className="font-bold text-sm text-foreground mb-0.5">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader label="Curation" title="How We Choose the Routes" sub="Not every famous trail is world-class. Not every world-class trail is famous. Not every summit is achievable." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Mountain className="w-4 h-4" />, title: "Landscape Quality", desc: "The route must pass through genuinely exceptional terrain — not just accessible or popular, but visually and experientially outstanding." },
              { icon: <Users className="w-4 h-4" />, title: "Community Standing", desc: "We weight routes that experienced trekkers across the world's hiking communities consistently identify as bucket-list calibre." },
              { icon: <Compass className="w-4 h-4" />, title: "Geographic Spread", desc: "The list must represent global trekking culture — we deliberately include routes from underrepresented regions alongside the well-known classics." },
              { icon: <Zap className="w-4 h-4" />, title: "Range of Experience", desc: "From a 2-day coastal walk to a 165-day thru-hike and a 6476m summit, the list spans the full spectrum so every adventurer finds something appropriate and aspirational." },
            ].map(c => (
              <div key={c.title} className="flex gap-3 p-4 rounded-xl border border-border/50 bg-card">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 text-foreground/60 flex items-center justify-center shrink-0">{c.icon}</div>
                <div>
                  <p className="font-bold text-sm text-foreground mb-0.5">{c.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader label="Common Questions" title="FAQ" />
          <div className="rounded-2xl border border-border/60 bg-card px-5 divide-y divide-border/40">
            {FAQS.map((faq, i) => <FaqItem key={i} faq={faq} index={i} />)}
          </div>
        </section>

        <section className="rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative z-10 px-6 py-8 text-center">
            <h3 className="text-xl font-black text-white mb-2">Ready to find your route?</h3>
            <p className="text-white/65 text-sm mb-5">Explore all 150 treks and peaks on the globe, or let the AI Trek Finder match you to your perfect adventure.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/"><button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-bold rounded-full shadow-lg hover:bg-white/90 transition-all"><Globe2 className="w-4 h-4" />Explore the Globe</button></Link>
              <Link href="/trek-finder"><button className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-full shadow-lg hover:bg-amber-400 transition-all"><Sparkles className="w-4 h-4" />Find My Trek</button></Link>
              <Link href="/top-100"><button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/25 text-white text-sm font-bold rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"><Trophy className="w-4 h-4 text-amber-400" />Top 100 List<ChevronRight className="w-3.5 h-3.5" /></button></Link>
            </div>
          </div>
        </section>

        {/* Contact Us */}
        <section>
          <SectionHeader label="Get in Touch" title="Contact Us" />
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground mb-1">Questions or Feedback?</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  We'd love to hear from you — whether it's a route suggestion, a data correction, a feature idea, or just a note about a trek you've completed. TrekMind is built by people who love the mountains, and every message gets read.
                </p>
                <a href="mailto:hello@backpackersmentality.com" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors group">
                  <Mail className="w-4 h-4 shrink-0" />
                  hello@backpackersmentality.com
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-border bg-card py-2 shrink-0">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-bold text-[10px] text-foreground">TrekMind</p>
          <p className="text-[7px] text-muted-foreground">© 2025 TrekMind. Information is for discovery purposes. Always verify current conditions, permits, and safety requirements with official sources before trekking or climbing. Adventure responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
