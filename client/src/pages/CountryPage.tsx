// pages/CountryPage.tsx
import { useRoute } from 'wouter';
import { getCountryPageData } from '@/lib/seo-pages';
import SEOPage from '@/components/SEOPage';

export default function CountryPage() {
  const [, params] = useRoute('/treks/country/:slug');
  const slug = params?.slug ?? '';
  const data = getCountryPageData(slug);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Country not found.</p>
    </div>
  );

  return <SEOPage data={data} pageUrl={`https://trekmind.pages.dev/treks/country/${slug}`} />;
}
