// pages/ContinentPage.tsx
import { useRoute } from 'wouter';
import { getContinentPageData } from '@/lib/seo-pages';
import SEOPage from '@/components/SEOPage';

export default function ContinentPage() {
  const [, params] = useRoute('/treks/continent/:slug');
  const slug = params?.slug ?? '';
  const data = getContinentPageData(slug);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Continent not found.</p>
    </div>
  );

  return <SEOPage data={data} pageUrl={`https://trekmind.pages.dev/treks/continent/${slug}`} />;
}


// pages/DurationPage.tsx
import { useRoute as useDurationRoute } from 'wouter';
import { getDurationPageData } from '@/lib/seo-pages';

export function DurationPage() {
  const [, params] = useDurationRoute('/treks/duration/:slug');
  const slug = params?.slug ?? '';
  const data = getDurationPageData(slug);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Duration category not found.</p>
    </div>
  );

  return <SEOPage data={data} pageUrl={`https://trekmind.pages.dev/treks/duration/${slug}`} />;
}


// pages/TierPage.tsx
import { useRoute as useTierRoute } from 'wouter';
import { getTierPageData } from '@/lib/seo-pages';

export function TierPage() {
  const [, params] = useTierRoute('/treks/tier/:slug');
  const slug = params?.slug ?? '';
  const data = getTierPageData(slug);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Tier category not found.</p>
    </div>
  );

  return <SEOPage data={data} pageUrl={`https://trekmind.pages.dev/treks/tier/${slug}`} />;
}
