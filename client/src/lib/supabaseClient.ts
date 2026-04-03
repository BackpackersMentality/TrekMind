// client/src/lib/supabaseClient.ts
// Initialises the Supabase client — single instance shared across the app.
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env (dev)
// and in Cloudflare Pages → Settings → Environment Variables (production).

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string | undefined
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// ── Graceful degradation ───────────────────────────────────────────────────
// Previously this threw a hard Error, which crashed the entire app at module
// load time when env vars were missing or Supabase was paused.
// Now we log a warning and export a null sentinel — all consuming hooks must
// guard against supabase being null (see useTrekList, useAuth, useIntroSeen).
if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    '[TrekMind] Supabase env vars not set (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
    'Auth and cloud save features will be disabled. ' +
    'Add these to Cloudflare Pages → Settings → Environment Variables.'
  )
}

export const supabase = (supabaseUrl && supabaseAnon)
  ? createClient(supabaseUrl, supabaseAnon)
  : null

// ── Auth redirect URL ──────────────────────────────────────────────────────
// Used by signInWithGoogle() to tell Supabase where to send the user after
// OAuth completes. Must match an entry in Supabase → Authentication →
// URL Configuration → Redirect URLs.
//
// In production this resolves to https://www.trekmind.app
// In local dev (VITE_APP_URL not set) falls back to window.location.origin
// so localhost:5173 / localhost:3000 both work automatically.
export const AUTH_REDIRECT_URL =
  (import.meta.env.VITE_APP_URL as string | undefined) ?? window.location.origin

// ── Types ──────────────────────────────────────────────────────────────────
export type TrekStatus = 'completed' | 'inProgress' | 'wishlist'

export interface SavedTrek {
  id:         string        // DB uuid
  user_id:    string
  trek_id:    string
  status:     TrekStatus
  created_at: string
}

export interface UserPreferences {
  user_id:        string
  has_seen_intro: boolean
  updated_at:     string
}
