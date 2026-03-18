// SEOPage.tsx
// Universal page component for all programmatic SEO pages:
// region, country, continent, duration bracket, and tier pages.
// Accepts SEOPageData and renders consistently with full SEO meta.

import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { MapPin, Clock, Mountain, ArrowRight, ChevronRight } from 'lucide-react';
import { type SEOPageData } from '@/lib/seo-pages';
import { getTrekImageUrl } from '@/lib/images';

function TrekListCard({ trek }: { trek: any }) {
  const tierColour = {
    1: 'bg-amber-400',
    2: 'bg-blue-400',
    3: 'bg-slate-400',
    4: 'bg-violet-400',
  }[trek.tier as 1|2|3|4] ?? 'bg-blue-400';

  const tierLabel = {
    1: 'Iconic', 2: 'Legendary', 3: 'Remote', 4: 'Thru-Hike',
  }[trek.tier as 1|2|3|4] ?? 'Trek';

  return (
    <Link href={`/trek/${trek.id}`}>
      <article className="group flex gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
          <img
            src={getTrekImageUrl(trek.imageFilename)}
            alt={trek.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${tierColour} shrink-0`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tierLabel}</span>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {trek.name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />{trek.region}, {trek.country}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{trek.totalDays}
            </span>
            {trek.maxAltitude && (
              <span className="flex items-center gap-1">
                <Mountain className="w-3 h-3" />{trek.maxAltitude}
              </span>
            )}
          </div>
          {trek.keyFeatures && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{trek.keyFeatures}</p>
          )}
        </div>

        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 self-center transition-colors" />
      </article>
    </Link>
  );
}

interface SEOPageProps {
  data: SEOPageData;
  pageUrl: string;
}

export default function SEOPage({ data, pageUrl }: SEOPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content={pageUrl} />
        <meta property="og:title"       content={data.title} />
        <meta property="og:description" content={data.description} />
        <meta property="og:image"       content="https://trekmind.pages.dev/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": data.h1,
          "description": data.description,
          "url": pageUrl,
        })}</script>
      </Helmet>

      {/* Header */}
      <div className="bg-foreground text-background relative overflow-hidden py-10 px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-white/50 text-xs mb-4 flex-wrap">
            {data.breadcrumb.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {i < data.breadcrumb.length - 1 ? (
                  <Link href={crumb.href}>
                    <span className="hover:text-white/80 transition-colors cursor-pointer">{crumb.label}</span>
                  </Link>
                ) : (
                  <span className="text-white/80">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{data.h1}</h1>
          <p className="text-white/70 max-w-2xl">{data.intro}</p>
          <p className="text-white/40 text-sm mt-2">{data.treks.length} routes</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-10">

          {/* Trek list */}
          <div className="space-y-3">
            {data.treks.map(trek => (
              <TrekListCard key={trek.id} trek={trek} />
            ))}
          </div>

          {/* Sidebar: related pages */}
          <aside className="space-y-6">
            <div className="sticky top-6">
              {data.relatedPages.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                    Related
                  </h3>
                  <div className="space-y-2">
                    {data.relatedPages.map(page => (
                      <Link key={page.href} href={page.href}>
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground">
                          {page.label}
                          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">Explore all treks on the interactive globe</p>
                <Link href="/">
                  <button className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                    Open Globe →
                  </button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
