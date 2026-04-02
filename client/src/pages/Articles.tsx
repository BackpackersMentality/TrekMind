import { useMemo } from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Clock, ArrowRight, Compass, Map, HelpCircle, Mountain, ChevronRight } from 'lucide-react';
import { articlesMeta, type ArticleMeta } from '@/lib/articles';

// ─── Category config ──────────────────────────────────────────────────────────
// Supports BOTH old lowercase slugs and new Title-case values so the component
// is resilient to whichever meta version the lib returns.
const CATEGORY_ICONS: Record<string, any> = {
  // New capitalised keys
  Lists:            Map,
  Destinations:     Compass,
  Guides:           HelpCircle,
  // Old lowercase keys (legacy fallback)
  inspiration:      Map,
  planning:         HelpCircle,
  guides:           HelpCircle,
  'trekking-peaks': Mountain,
};

const CATEGORY_COLOURS: Record<string, string> = {
  Lists:            'bg-amber-100 text-amber-800 border-amber-200',
  Destinations:     'bg-blue-100 text-blue-800 border-blue-200',
  Guides:           'bg-green-100 text-green-800 border-green-200',
  inspiration:      'bg-amber-100 text-amber-800 border-amber-200',
  planning:         'bg-green-100 text-green-800 border-green-200',
  'trekking-peaks': 'bg-purple-100 text-purple-800 border-purple-200',
};

const ACCENT: Record<string, string> = {
  Lists:            'bg-amber-400',
  Destinations:     'bg-blue-400',
  Guides:           'bg-green-400',
  inspiration:      'bg-amber-400',
  planning:         'bg-green-400',
  'trekking-peaks': 'bg-purple-400',
};

/** Normalise a category value to one of our four display buckets */
function normaliseCat(raw: string): 'Lists' | 'Destinations' | 'Guides' | 'Trekking Peaks' {
  switch (raw) {
    case 'Lists':
    case 'inspiration':
      return 'Lists';
    case 'Destinations':
      return 'Destinations';
    case 'Guides':
    case 'guides':
    case 'planning':
      return 'Guides';
    case 'trekking-peaks':
      return 'Trekking Peaks';
    default:
      return 'Guides';
  }
}

// ─── Article card ─────────────────────────────────────────────────────────────
function ArticleCard({ article, featured = false }: { article: ArticleMeta; featured?: boolean }) {
  const Icon        = CATEGORY_ICONS[article.category] ?? BookOpen;
  const colourClass = CATEGORY_COLOURS[article.category] ?? 'bg-muted text-muted-foreground border-border';
  const accent      = ACCENT[article.category] ?? 'bg-primary';
  const isPending   = (article as any)._noContent === true;

  return (
    <Link href={`/articles/${article.slug}`}>
      <article
        className={`group h-full bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200 flex flex-col cursor-pointer ${featured ? 'md:flex-row' : ''} ${isPending ? 'opacity-60' : ''}`}
      >
        <div className={`flex-shrink-0 ${featured ? 'h-1.5 w-full md:h-auto md:w-1.5' : 'h-1.5 w-full'} ${accent}`} />
        <div className={`p-5 flex flex-col flex-1 ${featured ? 'md:p-7' : ''}`}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colourClass}`}>
              <Icon className="w-3 h-3" />
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
            {isPending && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                Coming Soon
              </span>
            )}
          </div>
          <h2 className={`font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 ${featured ? 'text-xl md:text-2xl' : 'text-base'}`}>
            {article.title}
          </h2>
          <p className={`text-muted-foreground leading-relaxed flex-1 ${featured ? 'text-sm md:text-base' : 'text-sm line-clamp-2'}`}>
            {article.description}
          </p>
          {!isPending && (
            <div className="mt-4 flex items-center gap-1 text-primary text-sm font-semibold">
              Read article
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

// ─── Section component ────────────────────────────────────────────────────────
function Section({ title, accentClass, articles, featured = false }: {
  title: string;
  accentClass: string;
  articles: ArticleMeta[];
  featured?: boolean;
}) {
  if (articles.length === 0) return null;
  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
        <span className={`w-1 h-5 ${accentClass} rounded-full inline-block`} />
        {title}
      </h2>
      <div className={`grid gap-4 ${featured ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {articles.map(article => (
          <ArticleCard key={article.slug} article={article} featured={featured} />
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Articles() {
  const featured      = useMemo(() => articlesMeta.filter(a => a.featured), []);
  const lists         = useMemo(() => articlesMeta.filter(a => normaliseCat(a.category) === 'Lists' && !a.featured), []);
  const destinations  = useMemo(() => articlesMeta.filter(a => normaliseCat(a.category) === 'Destinations' && !a.featured), []);
  const guides        = useMemo(() => articlesMeta.filter(a => normaliseCat(a.category) === 'Guides' && !a.featured), []);
  const trekkingPeaks = useMemo(() => articlesMeta.filter(a => normaliseCat(a.category) === 'Trekking Peaks' && !a.featured), []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Trekking Articles & Guides | TrekMind</title>
        <meta name="description" content="Expert trekking guides, destination articles, and bucket list inspiration. Everything you need to discover and plan the world's greatest multi-day routes." />
        <link rel="canonical" href="https://trekmind.app/articles" />
        <meta property="og:title"       content="Trekking Articles & Guides | TrekMind" />
        <meta property="og:description" content="Expert trekking guides, destination articles, and bucket list inspiration." />
        <meta property="og:type"        content="website" />
      </Helmet>

      {/* Header */}
      <div className="relative bg-foreground text-background py-10 md:py-14 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=75"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-6 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Globe
            </button>
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-7 h-7 text-amber-300 shrink-0" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Trekking Articles</h1>
          </div>
          <p className="text-white/70 text-base md:text-lg max-w-2xl">
            Destination guides, trek lists, and practical planning advice for the world's greatest multi-day routes.
          </p>
          <p className="text-white/40 text-sm mt-2">{articlesMeta.length} articles</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* Featured */}
        {featured.length > 0 && (
          <Section title="Featured" accentClass="bg-amber-400" articles={featured} featured />
        )}

        {/* Trek Lists */}
        <Section title="Trek Lists" accentClass="bg-amber-400" articles={lists} />

        {/* Destination Guides */}
        <Section title="Destination Guides" accentClass="bg-blue-400" articles={destinations} />

        {/* Planning & How-To Guides */}
        <Section title="Planning & How-To Guides" accentClass="bg-green-400" articles={guides} />

        {/* Trekking Peaks — only renders if old articles are present */}
        {trekkingPeaks.length > 0 && (
          <Section title="Trekking Peaks" accentClass="bg-purple-400" articles={trekkingPeaks} />
        )}

        {/* CTA */}
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Ready to explore the routes?</h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
            Every trek mentioned in these articles is on TrekMind's interactive globe — with full itineraries, route maps, and gear guides.
          </p>
          <Link href="/">
            <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              Explore the Globe →
            </button>
          </Link>
        </section>

      </div>
    </div>
  );
}
