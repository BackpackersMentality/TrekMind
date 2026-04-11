// CookieBanner.tsx — GDPR, CCPA, PIPEDA compliant consent banner
// Place at: client/src/components/CookieBanner.tsx
//
// Mount once at the root layout / App.tsx level so it appears on every page.
// Manages three consent categories:
//   • necessary  — always true, cannot be toggled (Supabase auth)
//   • analytics  — Google Analytics (requires explicit opt-in under GDPR)
//   • marketing  — Affiliate cookies on blog (requires explicit opt-in)
//
// ── How to wire up GA4 ───────────────────────────────────────────────────────
// In index.html or your GA init file, load gtag.js with consent mode:
//
//   window.gtag('consent', 'default', {
//     analytics_storage: 'denied',
//     ad_storage: 'denied',
//     wait_for_update: 500,
//   });
//
// Then when the user accepts analytics, call:
//   window.gtag('consent', 'update', { analytics_storage: 'granted' });
//
// This component exports useCookieConsent() — call it anywhere to read
// the current consent state (e.g. in your GA init logic).
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, createContext, useContext } from 'react'
import { X, Settings, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from 'wouter'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ConsentState {
  necessary: true         // always true — cannot be changed
  analytics: boolean
  marketing: boolean
  hasChosen: boolean      // true once user makes any choice (hides banner)
}

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  hasChosen: false,
}

const STORAGE_KEY = 'trekmind-cookie-consent'

// ── Context ───────────────────────────────────────────────────────────────────

const ConsentContext = createContext<ConsentState>(DEFAULT_CONSENT)

export function useCookieConsent(): ConsentState {
  return useContext(ConsentContext)
}

// ── Persistence helpers ───────────────────────────────────────────────────────

function loadConsent(): ConsentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONSENT
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    return {
      necessary: true,
      analytics: parsed.analytics ?? false,
      marketing: parsed.marketing ?? false,
      hasChosen: parsed.hasChosen ?? false,
    }
  } catch {
    return DEFAULT_CONSENT
  }
}

function saveConsent(state: ConsentState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore storage errors */ }
}

// ── Apply consent to third-party scripts ──────────────────────────────────────

function applyConsent(state: ConsentState): void {
  // Google Analytics Consent Mode v2
  // gtag must be loaded in index.html with default 'denied' state.
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    ;(window as any).gtag('consent', 'update', {
      analytics_storage:  state.analytics  ? 'granted' : 'denied',
      ad_storage:         state.marketing  ? 'granted' : 'denied',
      ad_user_data:       state.marketing  ? 'granted' : 'denied',
      ad_personalization: state.marketing  ? 'granted' : 'denied',
    })
  }

  // CCPA — if user rejected marketing, set Do Not Sell signal
  // (Relevant if you later use ad networks or data brokers.)
  if (typeof window !== 'undefined') {
    (window as any).__uspapi_doNotSell = !state.marketing
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export function CookieBanner() {
  const [consent, setConsent]           = useState<ConsentState>(DEFAULT_CONSENT)
  const [showBanner, setShowBanner]     = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDetails, setShowDetails]   = useState(false)

  // Draft state inside the customise panel
  const [draftAnalytics, setDraftAnalytics] = useState(false)
  const [draftMarketing, setDraftMarketing] = useState(false)

  // Load saved consent on mount
  useEffect(() => {
    const saved = loadConsent()
    setConsent(saved)
    applyConsent(saved)

    // Show banner if user hasn't made a choice yet
    if (!saved.hasChosen) {
      // Small delay so it doesn't flash before the page renders
      const t = setTimeout(() => setShowBanner(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  const commit = (next: Omit<ConsentState, 'necessary'> & { hasChosen: true }) => {
    const full: ConsentState = { necessary: true, ...next }
    setConsent(full)
    saveConsent(full)
    applyConsent(full)
    setShowBanner(false)
    setShowSettings(false)
  }

  // ── Button handlers ─────────────────────────────────────────────────────────

  // Accept All — grants analytics + marketing consent
  const handleAcceptAll = () => commit({ analytics: true, marketing: true, hasChosen: true })

  // Reject Non-Essential — only keeps strictly necessary cookies
  // GDPR: this is the compliant "deny" path
  const handleRejectAll = () => commit({ analytics: false, marketing: false, hasChosen: true })

  // Save custom choices from the settings panel
  const handleSavePreferences = () => commit({
    analytics: draftAnalytics,
    marketing: draftMarketing,
    hasChosen: true,
  })

  // Open settings panel (also used from footer "Cookie Settings" link)
  const handleOpenSettings = () => {
    setDraftAnalytics(consent.analytics)
    setDraftMarketing(consent.marketing)
    setShowSettings(true)
    setShowBanner(true)
  }

  // Expose handleOpenSettings globally so footer link can trigger it
  useEffect(() => {
    ;(window as any).__openCookieSettings = handleOpenSettings
  }, [consent])

  if (!showBanner) {
    return (
      <ConsentContext.Provider value={consent}>
        {/* Nothing visible — consent already given */}
      </ConsentContext.Provider>
    )
  }

  return (
    <ConsentContext.Provider value={consent}>
      {/* ── Backdrop for settings panel ── */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[299]"
          onClick={() => setShowSettings(false)}
        />
      )}

      {/* ── Settings panel (full customisation) ── */}
      {showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-[300] sm:bottom-4 sm:left-4 sm:right-auto sm:w-[420px]">
          <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-900">Cookie Preferences</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-500 leading-relaxed">
                We use cookies to keep you logged in and to understand how our platform is used.
                Strictly necessary cookies cannot be disabled. All others require your consent.{" "}
                <Link href="/privacy#cookies" className="text-slate-700 underline underline-offset-2">
                  Learn more
                </Link>
              </p>

              {/* Cookie category toggles */}
              {[
                {
                  id: "necessary",
                  label: "Strictly Necessary",
                  badge: "Always On",
                  badgeClass: "bg-emerald-100 text-emerald-700",
                  description: "Supabase authentication and session cookies. Required to keep you logged in. Cannot be disabled.",
                  checked: true,
                  disabled: true,
                  onChange: () => {},
                },
                {
                  id: "analytics",
                  label: "Analytics",
                  badge: "Optional",
                  badgeClass: "bg-slate-100 text-slate-600",
                  description: "Google Analytics 4. Helps us understand how TrekMind and the blog are used, in anonymised aggregate. Never used to identify individuals.",
                  checked: draftAnalytics,
                  disabled: false,
                  onChange: () => setDraftAnalytics(v => !v),
                },
                {
                  id: "marketing",
                  label: "Marketing & Affiliate",
                  badge: "Blog Only · Optional",
                  badgeClass: "bg-amber-100 text-amber-700",
                  description: "Affiliate tracking cookies on Backpacker's Mentality blog. These are set by partner retailers when you click an affiliate link. Not present in the TrekMind app.",
                  checked: draftMarketing,
                  disabled: false,
                  onChange: () => setDraftMarketing(v => !v),
                },
              ].map(cat => (
                <div key={cat.id} className="border border-slate-100 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{cat.label}</span>
                      <span className={cn("ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full", cat.badgeClass)}>{cat.badge}</span>
                    </div>
                    {/* Toggle switch */}
                    <button
                      role="switch"
                      aria-checked={cat.checked}
                      aria-label={`Toggle ${cat.label}`}
                      disabled={cat.disabled}
                      onClick={cat.onChange}
                      className={cn(
                        "relative w-10 h-5.5 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500",
                        cat.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                        cat.checked ? "bg-slate-900" : "bg-slate-200",
                      )}
                      style={{ height: 22, width: 40 }}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200",
                          cat.checked ? "translate-x-[18px]" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                  {/* Description — collapsible on mobile */}
                  <div className="px-4 py-2.5">
                    <p className="text-[11px] text-slate-500 leading-relaxed">{cat.description}</p>
                  </div>
                </div>
              ))}

              {/* CCPA Do Not Sell notice */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">California residents (CCPA):</strong> We do not sell or share your personal information for cross-context behavioural advertising. Disabling Marketing cookies above is equivalent to exercising your "Do Not Sell or Share My Personal Information" right.
                </p>
              </div>
            </div>

            {/* Save button */}
            <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleRejectAll}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-black transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main cookie banner (shown until user makes a choice) ── */}
      {!showSettings && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-0 left-0 right-0 z-[300] sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm"
        >
          <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

            <div className="px-5 pt-5 pb-4">
              {/* Icon + headline */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-slate-600" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">We use cookies</h2>
              </div>

              {/* Main copy — GDPR requires this to be clear & plain language */}
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                We use cookies to keep you logged in (essential) and to understand how TrekMind is used (analytics). The Backpacker's Mentality blog also uses affiliate tracking cookies. We don't run ads and we never sell your data.{" "}
                <Link href="/privacy#cookies" className="text-slate-700 underline underline-offset-2">
                  Cookie policy
                </Link>
              </p>

              {/* ── Action buttons ── */}
              {/* GDPR: Accept and Reject must be equally prominent */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="w-full py-2.5 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-black transition-colors"
                >
                  Accept All Cookies
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={handleOpenSettings}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Customise
                  </button>
                </div>
              </div>
            </div>

            {/* CCPA footer note */}
            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100">
              <p className="text-[9px] text-slate-400 leading-relaxed text-center">
                California residents: clicking "Reject Non-Essential" exercises your right to opt out of the sale/sharing of personal information under CCPA. We do not sell data.{" "}
                <Link href="/privacy" className="underline underline-offset-1">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </ConsentContext.Provider>
  )
}

// ── Export helper for footer "Cookie Settings" link ──────────────────────────
// Usage in any component:
//   <button onClick={() => (window as any).__openCookieSettings?.()}>
//     Cookie Settings
//   </button>
export function openCookieSettings() {
  if (typeof window !== 'undefined') {
    ;(window as any).__openCookieSettings?.()
  }
}
