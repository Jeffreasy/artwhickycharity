'use client'

import { ReactNode, createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js'

type AuthMode = 'nextauth' | 'supabase' | null

type CombinedAuthState = {
  authMode: AuthMode
  // NextAuth info
  nextAuthStatus: 'loading' | 'authenticated' | 'unauthenticated'
  // Supabase info
  supabaseUser: SupabaseUser | null
  supabaseSession: SupabaseSession | null
  isLoading: boolean
  // Supabase methods
  signUp: (email: string, password: string) => Promise<{
    error: any | null
    data: any | null
  }>
  signIn: (email: string, password: string) => Promise<{
    error: any | null
    data: any | null
  }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{
    error: any | null
    data: any | null
  }>
}

const CombinedAuthContext = createContext<CombinedAuthState | undefined>(
  undefined
)

export function CombinedAuthProvider({
  children,
}: {
  children: ReactNode
}) {
  // Next Auth session
  const { data: session, status } = useSession()
  
  // Supabase Auth state
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [supabaseSession, setSupabaseSession] = useState<SupabaseSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  
  useEffect(() => {
    // Determine auth mode based on status and pathnames
    if (status === 'authenticated' && session) {
      setAuthMode('nextauth')
    } else if (supabaseUser) {
      setAuthMode('supabase')
    } else {
      setAuthMode(null)
    }
  }, [status, session, supabaseUser])

  useEffect(() => {
    // Fetch initial Supabase session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      setSupabaseSession(data.session)
      setSupabaseUser(data.session?.user || null)
      setIsLoading(false)
    }

    getSession()

    // Set up listener for Supabase auth changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseSession(session)
      setSupabaseUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const signOut = async () => {
    if (authMode === 'supabase') {
      await supabase.auth.signOut()
    }
    // NextAuth signOut is handled by the NextAuth components directly
  }

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
  }

  const value = {
    authMode,
    // NextAuth
    nextAuthStatus: status,
    // Supabase
    supabaseUser,
    supabaseSession,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return (
    <CombinedAuthContext.Provider value={value}>
      {children}
    </CombinedAuthContext.Provider>
  )
}

export const useCombinedAuth = () => {
  const context = useContext(CombinedAuthContext)
  if (context === undefined) {
    throw new Error('useCombinedAuth must be used within a CombinedAuthProvider')
  }
  return context
} 