// client/src/hooks/useAuth.ts
// Manages Supabase auth session.
// Exposes: user, loading, signInWithGoogle, signInWithEmail, signOut

import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface AuthState {
  user:    User | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user:    null,
    session: null,
    loading: true,
  })

  useEffect(() => {
    // Fetch existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setState({
        user:    data.session?.user ?? null,
        session: data.session,
        loading: false,
      })
    })

    // Listen for auth changes (sign-in, sign-out, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user:    session?.user ?? null,
        session,
        loading: false,
      })
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: window.location.origin },
    })

  const signInWithEmail = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUpWithEmail = (email: string, password: string) =>
    supabase.auth.signUp({ email, password })

  const signOut = () => supabase.auth.signOut()

  return {
    ...state,
    isLoggedIn: !!state.user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }
}
