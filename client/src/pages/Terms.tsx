// client/src/pages/Terms.tsx
import { Helmet } from 'react-helmet-async'
import { Link } from 'wouter'
import { ChevronLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Use | TrekMind</title>
        <meta name="description" content="TrekMind terms of use." />
        <link rel="canonical" href="https://trekmind.app/terms" />
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to TrekMind
          </button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">

          <section>
            <h2 className="text-lg font-bold mb-2">1. Acceptance</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using TrekMind you agree to these terms. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. The service</h2>
            <p className="text-muted-foreground leading-relaxed">
              TrekMind is an informational trekking discovery tool. It is provided free of charge
              and without warranty. Trek itineraries, route data, gear recommendations, and risk
              information are AI-generated and intended for planning inspiration only. They may be
              incomplete or inaccurate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. Not a navigation tool</h2>
            <p className="text-muted-foreground leading-relaxed">
              TrekMind's interactive maps and route information must not be used for navigation in
              the field. Always use official trail maps, GPS devices, and qualified guides when
              undertaking any trek. Always verify permits, weather conditions, and route safety
              with official sources before setting out.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. Your account</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the security of your account. You must not share
              your login credentials. We reserve the right to terminate accounts that misuse the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Limitation of liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TrekMind and Backpacker's Mentality accept no liability for any loss, injury, or damage
              arising from use of the service or reliance on any information provided. Trekking in
              remote terrain involves inherent risks. You undertake any trek entirely at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. Intellectual property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The TrekMind name, logo, and editorial content are owned by Backpacker's Mentality.
              Trek imagery is sourced from Unsplash under their licence terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">7. Changes</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms. Continued use of the service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions:{' '}
              <a href="mailto:hello@backpackersmentality.com" className="text-primary underline">
                hello@backpackersmentality.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
