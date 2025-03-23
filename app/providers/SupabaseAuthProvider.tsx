'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import Cookies from 'js-cookie'

// Define the auth context type
interface SupabaseAuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{
    error: Error | null
  }>
  signOut: () => Promise<void>
}

// Create the auth context
const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {}
})

// Provider component for auth
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize session on mount
  useEffect(() => {
    // First, check for the session in Supabase
    const initialize = async () => {
      try {
        // Get the current session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setIsLoading(false)
          return
        }
        
        // If we have a session, set it
        if (data.session) {
          setSession(data.session)
          setUser(data.session.user)
          
          // Set the has_session cookie as backup
          Cookies.set('has_session', 'true', { 
            path: '/',
            secure: window.location.protocol === 'https:',
            sameSite: 'lax',
            expires: 1/48 // 30 minutes
          })
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setIsLoading(false)
      }
    }
    
    initialize()
    
    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session) {
          setSession(session)
          setUser(session.user)
          
          // Set the has_session cookie on auth changes as backup
          Cookies.set('has_session', 'true', { 
            path: '/',
            secure: window.location.protocol === 'https:',
            sameSite: 'lax',
            expires: 1/48 // 30 minutes
          })
        } else {
          setSession(null)
          setUser(null)
          
          // Clean up the has_session cookie
          Cookies.remove('has_session', { path: '/' })
        }
        
        setIsLoading(false)
      }
    )

    // Clean up the listener
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (!error) {
        // Set login success cookie for middleware
        Cookies.set('login_success', 'true', { 
          path: '/',
          secure: window.location.protocol === 'https:',
          sameSite: 'lax',
          expires: 1/144 // 10 minutes
        })
      }
      
      return { error }
    } catch (error) {
      console.error('Error during sign in:', error)
      return { error: error as Error }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      // Set a flag to prevent redirect loops
      sessionStorage.setItem('isSigningOut', 'true')
      
      // Clear all auth-related cookies first
      Cookies.remove('has_session', { path: '/' })
      Cookies.remove('login_success', { path: '/' })
      Cookies.remove('admin_bypass', { path: '/' })
      
      // Remove all Supabase-related local storage
      if (typeof window !== 'undefined') {
        Object.keys(localStorage)
          .filter(key => key.includes('supabase') || key.includes('artwhisky'))
          .forEach(key => localStorage.removeItem(key))
      }
      
      // Then sign out from Supabase
      await supabase.auth.signOut({ scope: 'local' })
      
      // Clear state
      setUser(null)
      setSession(null)
      
      console.log('Successfully signed out')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      // Clear the flag after a short delay
      setTimeout(() => {
        sessionStorage.removeItem('isSigningOut')
      }, 1000)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

// Hook for using auth context
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext)
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
} 