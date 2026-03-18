// pages/RegionPage.tsx
import { useRoute } from 'wouter';
import { getRegionPageData } from '@/lib/seo-pages';
import SEOPage from '@/components/SEOPage';

export default function RegionPage() {
  const [, params] = useRoute('/treks/region/:slug');
  const slug = params?.slug ?? '';
  const data = getRegionPageData(slug);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Region not found.</p>
    </div>
  );

  return <SEOPage data={data} pageUrl={`https://trekmind.pages.dev/treks/region/${slug}`} />;
}
