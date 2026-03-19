import { useRoute } from 'wouter';
import { getTierPageData } from '@/lib/seo-pages';
import SEOPage from '@/pages/SEOPage';

export default function TierPage() {
  const [, params] = useRoute('/treks/tier/:slug');
  const slug = params?.slug ?? '';
  const data = getTierPageData(slug);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Tier category not found.</p>
      </div>
    );
  }

  return (
    <SEOPage
      data={data}
      pageUrl={`https://trekmind.pages.dev/treks/tier/${slug}`}
    />
  );
}
