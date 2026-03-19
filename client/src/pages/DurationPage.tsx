import { useRoute } from 'wouter';
import { getDurationPageData } from '@/lib/seo-pages';
import SEOPage from '@/components/SEOPage';

export default function DurationPage() {
  const [, params] = useRoute('/treks/duration/:slug');
  const slug = params?.slug ?? '';
  const data = getDurationPageData(slug);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Duration category not found.</p>
      </div>
    );
  }

  return (
    <SEOPage
      data={data}
      pageUrl={`https://trekmind.pages.dev/treks/duration/${slug}`}
    />
  );
}
