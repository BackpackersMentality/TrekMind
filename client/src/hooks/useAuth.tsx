// client/src/hooks/useAuth.ts
// Manages Supabase auth session using React Context.
// Exposes: user, session, loading, isLoggedIn, signInWithGoogle, signInWithEmail, signOut

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isLoggedIn: boolean
  signInWithGoogle: () => Promise<any>
  signInWithEmail: (e: string, p: string) => Promise<any>
  signUpWithEmail: (e: string, p: string) => Promise<any>
  signOut: () => Promise<any>
}

// 1. Create the Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 2. Create the Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setSession(data.session)
      setLoading(false)
    })

    // Listen for auth changes (sign-in, sign-out, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setUser(newSession?.user ?? null)
      setSession(newSession)
      setLoading(false)
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

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isLoggedIn: !!user, // <-- useTrekList needs this!
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Create the Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
