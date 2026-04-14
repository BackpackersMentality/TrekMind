// analytics.ts — Google Analytics 4 setup for TrekMind
// Place at: client/src/lib/analytics.ts
//
// ── SETUP CHECKLIST ──────────────────────────────────────────────────────────
//
// Step 1: Create a GA4 property
//   → Go to analytics.google.com
//   → Admin → Create Property → name it "TrekMind"
//   → Choose "Web", enter https://www.trekmind.app
//   → Copy the Measurement ID (format: G-XXXXXXXXXX)
//
// Step 2: Add to Cloudflare Pages environment variables
//   → Cloudflare Pages → Settings → Environment Variables
//   → Add: VITE_GA_MEASUREMENT_ID = G-XXXXXXXXXX
//
// Step 3: Add the gtag.js snippet to index.html (with Consent Mode v2)
//   → See the HTML snippet at the bottom of this file
//
// Step 4: Import and call initAnalytics() in your main.tsx / App.tsx
//   → import { initAnalytics } from '@/lib/analytics'
//   → Call initAnalytics() once on app load
//
// Step 5: The CookieBanner component handles updating consent state
//   → When user accepts analytics, applyConsent() calls gtag('consent', 'update', ...)
//   → GA4 respects this and only fires tracking events after consent is granted
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

// ── Measurement ID ────────────────────────────────────────────────────────────

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

// ── Initialise GA4 with Consent Mode v2 ──────────────────────────────────────

export function initAnalytics(): void {
  if (!GA_ID) {
    console.warn('[TrekMind] VITE_GA_MEASUREMENT_ID not set — analytics disabled.')
    return
  }

  if (typeof window === 'undefined') return

  // Initialise the dataLayer and gtag function
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }

  // ── Consent Mode v2 — set defaults BEFORE gtag.js loads ──────────────────
  // This tells Google to hold all tracking until the user grants consent.
  // Required for GDPR compliance (EU) and for the CookieBanner to work.
  window.gtag('consent', 'default', {
    analytics_storage:   'denied',  // No GA cookies until user accepts
    ad_storage:          'denied',  // No ad cookies (we don't run ads)
    ad_user_data:        'denied',
    ad_personalization:  'denied',
    wait_for_update:     500,       // Wait 500ms for the banner to read saved consent
  })

  window.gtag('js', new Date())
  window.gtag('config', GA_ID, {
    // Anonymise IPs for GDPR compliance (auto in GA4 but explicit is good practice)
    anonymize_ip: true,
    // Disable Google Signals (cross-device tracking) — not needed for our use case
    allow_google_signals: false,
    // Send page views automatically on route change (handled separately below)
    send_page_view: false,
  })
}

// ── Page view tracking ────────────────────────────────────────────────────────
// Call this whenever the route changes (see App.tsx wiring below).

export function trackPageView(path: string, title?: string): void {
  if (!GA_ID || typeof window?.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path:  path,
    page_title: title ?? document.title,
  })
}

// ── Custom event tracking ─────────────────────────────────────────────────────
// Use this for key user interactions. Keep event names snake_case.

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!GA_ID || typeof window?.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

// ── Suggested TrekMind events ─────────────────────────────────────────────────
// Call these at the relevant points in the app:
//
//   trackEvent('trek_viewed',    { trek_id: 'ebc', trek_name: 'Everest Base Camp' })
//   trackEvent('trek_saved',     { trek_id: 'ebc', status: 'completed' })
//   trackEvent('filter_applied', { filter_type: 'region', filter_value: 'Asia' })
//   trackEvent('compare_opened', { trek_count: 2 })
//   trackEvent('gear_assistant_used', { trek_id: 'ebc', budget: 'mid' })
//   trackEvent('trek_finder_used', {})
//   trackEvent('sign_up',        { method: 'google' })
//   trackEvent('login',          { method: 'email' })

// ── Wiring into App.tsx / main.tsx ────────────────────────────────────────────
/*
  // In App.tsx — add route change tracking with wouter:

  import { useEffect } from 'react'
  import { useLocation } from 'wouter'
  import { initAnalytics, trackPageView } from '@/lib/analytics'

  // Call once at app start:
  initAnalytics()

  // Inside your App component:
  function App() {
    const [location] = useLocation()

    useEffect(() => {
      trackPageView(location)
    }, [location])

    return <Router>...</Router>
  }
*/
