import { useMemo } from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Clock, ArrowRight, Compass, Map, HelpCircle } from 'lucide-react';
import { articlesMeta, type ArticleMeta } from '@/lib/articles';

const CATEGORY_ICONS: Record<string, any> = {
  Lists: Map,
  Destinations: Compass,
  Guides: HelpCircle,
};

const CATEGORY_COLOURS: Record<string, string> = {
  Lists: 'bg-amber-100 text-amber-800 border-amber-200',
  Destinations: 'bg-blue-100 text-blue-800 border-blue-200',
  Guides: 'bg-green-100 text-green-800 border-green-200',
};

function ArticleCard({ article, featured = false }: { article: ArticleMeta; featured?: boolean }) {
  const Icon = CATEGORY_ICONS[article.category] ?? BookOpen;
  const colourClass = CATEGORY_COLOURS[article.category] ?? 'bg-muted text-muted-foreground border-border';

  return (
    <Link href={`/articles/${article.slug}`}>
      <article className={`group h-full bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200 flex flex-col ${featured ? 'md:flex-row' : ''}`}>
        {/* Colour accent bar */}
        <div className={`h-1.5 w-full flex-shrink-0 ${featured ? 'md:h-auto md:w-1.5' : ''} ${
          article.category === 'Lists' ? 'bg-amber-400' :
          article.category === 'Destinations' ? 'bg-blue-400' : 'bg-green-400'
        }`} />

        <div className={`p-5 flex flex-col flex-1 ${featured ? 'md:p-8' : ''}`}>
          {/* Category + read time */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colourClass}`}>
              <Icon className="w-3 h-3" />
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
          </div>

          {/* Title */}
          <h2 className={`font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 ${featured ? 'text-xl md:text-2xl' : 'text-base'}`}>
            {article.title}
          </h2>

          {/* Description */}
          <p className={`text-muted-foreground leading-relaxed flex-1 ${featured ? 'text-base' : 'text-sm line-clamp-2'}`}>
            {article.description}
          </p>

          {/* Read link */}
          <div className="mt-4 flex items-center gap-1 text-primary text-sm font-semibold">
            Read article
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function Articles() {
  const featured = useMemo(() => articlesMeta.filter(a => a.featured), []);
  const lists = useMemo(() => articlesMeta.filter(a => a.category === 'Lists'), []);
  const destinations = useMemo(() => articlesMeta.filter(a => a.category === 'Destinations'), []);
  const guides = useMemo(() => articlesMeta.filter(a => a.category === 'Guides'), []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Trekking Articles & Guides | TrekMind</title>
        <meta name="description" content="Expert trekking guides, destination articles, and bucket list inspiration. Everything you need to discover and plan the world's greatest multi-day routes." />
        <link rel="canonical" href="https://trekmind.pages.dev/articles" />
      </Helmet>

      {/* Header */}
      <div className="bg-foreground text-background py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/">
            <button className="text-white/60 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
              ← Back to Globe
            </button>
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-7 h-7 text-amber-300" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Trekking Articles</h1>
          </div>
          <p className="text-white/70 text-lg max-w-2xl">
            Destination guides, trek lists, and practical planning advice for the world's greatest multi-day routes.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Featured articles */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-400 rounded-full inline-block" />
            Featured
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {featured.map(article => (
              <ArticleCard key={article.slug} article={article} featured />
            ))}
          </div>
        </section>

        {/* Lists */}
        {lists.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-amber-400 rounded-full inline-block" />
              Trek Lists
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lists.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Destinations */}
        {destinations.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-400 rounded-full inline-block" />
              Destination Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {destinations.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Planning guides */}
        {guides.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-400 rounded-full inline-block" />
              Planning Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {guides.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* CTA to Globe */}
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Ready to explore the routes?</h3>
          <p className="text-muted-foreground mb-5">
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
