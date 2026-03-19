import { useRoute } from 'wouter';
import { getContinentPageData } from '@/lib/seo-pages';
import SEOPage from '@/components/SEOPage';

export default function ContinentPage() {
  const [, params] = useRoute('/treks/continent/:slug');
  const slug = params?.slug ?? '';
  const data = getContinentPageData(slug);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Continent not found.</p>
      </div>
    );
  }

  return (
    <SEOPage
      data={data}
      pageUrl={`https://trekmind.pages.dev/treks/continent/${slug}`}
    />
  );
}
