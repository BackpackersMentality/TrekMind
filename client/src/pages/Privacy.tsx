// client/src/pages/Privacy.tsx
import { Helmet } from 'react-helmet-async'
import { Link } from 'wouter'
import { ChevronLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | TrekMind</title>
        <meta name="description" content="TrekMind privacy policy — what data we collect and how we use it." />
        <link rel="canonical" href="https://trekmind.app/privacy" />
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to TrekMind
          </button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">

          <section>
            <h2 className="text-lg font-bold mb-2">1. Who we are</h2>
            <p className="text-muted-foreground leading-relaxed">
              TrekMind is a trekking discovery web application operated by Backpacker's Mentality
              ("we", "us", "our"). Our website is located at{' '}
              <a href="https://trekmind.app" className="text-primary underline">trekmind.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. What data we collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect the minimum data necessary to provide the service:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Account information</strong> — if you create an account:
                your email address and (if you use Google sign-in) your Google profile name and photo.
                Passwords are never stored by us; they are managed by Supabase's authentication service.
              </li>
              <li>
                <strong className="text-foreground">Saved treks</strong> — the trek IDs you mark as
                completed, in progress, or on your bucket list.
              </li>
              <li>
                <strong className="text-foreground">Onboarding state</strong> — whether you have seen
                the introductory tour (a single boolean value).
              </li>
              <li>
                <strong className="text-foreground">Anonymous usage</strong> — if you don't create an
                account, saved treks and onboarding state are stored only in your browser's localStorage
                and never sent to our servers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>To save and restore your trek list across devices and browsers.</li>
              <li>To remember your onboarding status so it does not repeat unnecessarily.</li>
              <li>To provide access to your saved treks when you log in from a new browser or device.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We do <strong className="text-foreground">not</strong> sell your data.
              We do <strong className="text-foreground">not</strong> use your data for advertising.
              We do <strong className="text-foreground">not</strong> share your data with third parties
              except as required to operate the service (Supabase for database and authentication).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. Cookies and local storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use browser localStorage to store your saved treks and onboarding state when you are
              not logged in. When you log in, an authentication session cookie is set by Supabase.
              We do not use advertising cookies or third-party tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Data retention and deletion</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is retained for as long as your account is active. You can request deletion
              of your account and all associated data at any time by emailing us at{' '}
              <a href="mailto:hello@backpackersmentality.com" className="text-primary underline">
                hello@backpackersmentality.com
              </a>.
              We will delete your account and all associated data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. Third-party services</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Supabase</strong> — database and authentication.
                Data is stored on Supabase's infrastructure. See{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer"
                   className="text-primary underline">supabase.com/privacy</a>.
              </li>
              <li>
                <strong className="text-foreground">Mapbox</strong> — interactive route maps. Map tile
                requests include your IP address as part of normal web traffic. See{' '}
                <a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener noreferrer"
                   className="text-primary underline">mapbox.com/legal/privacy</a>.
              </li>
              <li>
                <strong className="text-foreground">Cloudflare Pages</strong> — hosting. See{' '}
                <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer"
                   className="text-primary underline">cloudflare.com/privacypolicy</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">7. Your rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access the personal data we hold about you, to correct inaccurate data,
              and to request deletion. To exercise these rights, email{' '}
              <a href="mailto:hello@backpackersmentality.com" className="text-primary underline">
                hello@backpackersmentality.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">8. Changes to this policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy as the service evolves. Material changes will be communicated
              via the website. The date at the top of this page reflects the most recent update.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about this policy:{' '}
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
