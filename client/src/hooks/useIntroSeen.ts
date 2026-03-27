// client/src/hooks/useIntroSeen.ts
// Tracks whether the user has seen the onboarding overlay.
//
//   Anonymous  → localStorage key 'trekmind_intro_seen'
//   Logged in  → Supabase user_preferences.has_seen_intro
//
// The IntroOverlay should read `hasSeen` and call `markSeen()` on dismiss.

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'

const LS_INTRO = 'trekmind_intro_seen'

export function useIntroSeen() {
  const { user, isLoggedIn } = useAuth()
  const [hasSeen, setHasSeen] = useState<boolean | null>(null) // null = loading

  useEffect(() => {
    if (!isLoggedIn || !user) {
      // Anonymous: check localStorage
      setHasSeen(localStorage.getItem(LS_INTRO) === 'true')
      return
    }

    // Logged in: check Supabase
    supabase
      .from('user_preferences')
      .select('has_seen_intro')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          // Row may not exist yet (trigger handles creation) — default false
          setHasSeen(false)
        } else {
          setHasSeen(data.has_seen_intro)
        }
      })
  }, [isLoggedIn, user])

  const markSeen = async () => {
    setHasSeen(true)
    localStorage.setItem(LS_INTRO, 'true') // always set LS so anonymous also works

    if (!isLoggedIn || !user) return

    await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, has_seen_intro: true, updated_at: new Date().toISOString() },
               { onConflict: 'user_id' })
  }

  return { hasSeen, markSeen }
}
