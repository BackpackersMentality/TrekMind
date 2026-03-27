// client/src/lib/supabaseClient.ts
// Initialises the Supabase client — single instance shared across the app.
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnon)

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
  user_id:       string
  has_seen_intro: boolean
  updated_at:    string
}
