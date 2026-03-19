import { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Clock, ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import { getArticleBySlug, loadArticleContent, markdownToHtml, type ArticleMeta } from '@/lib/articles';
import { getTrekById } from '@/lib/treks';
import { getTrekImageUrl } from '@/lib/images';

// Related trek mini-card
function TrekCard({ trekId }: { trekId: string }) {
  const trek = getTrekById(trekId);
  if (!trek) return null;

  return (
    <Link href={`/trek/${trekId}`}>
      <div className="group flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-sm transition-all">
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
          <img
            src={getTrekImageUrl(trek.imageFilename)}
            alt={trek.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {trek.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{trek.region}, {trek.country}</p>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
      </div>
    </Link>
  );
}

export default function ArticleDetail() {
  const [, params] = useRoute('/articles/:slug');
  const slug = params?.slug ?? '';

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const meta: ArticleMeta | null = getArticleBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setContent(null);
    loadArticleContent(slug).then(md => {
      setContent(md);
      setLoading(false);
    });
  }, [slug]);

  if (!meta) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Article not found</h1>
          <Link href="/articles">
            <button className="text-primary hover:underline">← Back to articles</button>
          </Link>
        </div>
      </div>
    );
  }

  const pageUrl = `https://trekmind.pages.dev/articles/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{meta.title} | TrekMind</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type"        content="article" />
        <meta property="og:url"         content={pageUrl} />
        <meta property="og:title"       content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image"       content="https://trekmind.pages.dev/og-image.jpg" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": meta.title,
          "description": meta.description,
          "url": pageUrl,
          "datePublished": meta.publishedAt,
          "publisher": {
            "@type": "Organization",
            "name": "TrekMind",
            "url": "https://trekmind.pages.dev"
          }
        })}</script>
      </Helmet>

      {/* Sticky nav bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/articles">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Articles
            </button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {meta.readTime} read
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 lg:gap-12">

          {/* Main article content */}
          <main className="min-w-0 overflow-x-hidden">
            {/* Category tag */}
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">{meta.category}</span>
            </div>

            {loading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-muted/50 rounded w-3/4" />
                <div className="h-4 bg-muted/30 rounded w-full" />
                <div className="h-4 bg-muted/30 rounded w-5/6" />
                <div className="h-4 bg-muted/30 rounded w-4/5" />
              </div>
            )}

            {!loading && content && (
              <div
                className="prose-trekmind break-words"
                style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
              />
            )}

            {!loading && !content && (
              <div className="py-12 text-center text-muted-foreground">
                <p>Article content unavailable. Please try again later.</p>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="space-y-8 min-w-0">

            {/* Related treks */}
            {meta.relatedTreks.length > 0 && (
              <div className="sticky top-20">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                  Treks in this article
                </h3>
                <div className="space-y-2">
                  {meta.relatedTreks.map(id => (
                    <TrekCard key={id} trekId={id} />
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <Link href="/">
                    <button className="w-full py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                      Explore All Treks on Globe →
                    </button>
                  </Link>
                </div>
              </div>
            )}

          </aside>
        </div>

        {/* Bottom nav */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/articles">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              All articles
            </button>
          </Link>
          <Link href="/">
            <button className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              Explore the Globe →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
