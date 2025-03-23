import { createClient } from '@supabase/supabase-js'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

// Controleer of alle benodigde environment variables aanwezig zijn
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined')
}

// Create a client with persistent session storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'artwhisky-auth-token',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use cookies for better session handling
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') {
          return null
        }
        
        // Try to get from cookies first (for better persistence)
        const fromCookie = document.cookie
          .split(';')
          .find(c => c.trim().startsWith(`${key}=`))
        
        if (fromCookie) {
          return fromCookie.split('=')[1]
        }
        
        // Fallback to localStorage
        return window.localStorage.getItem(key)
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') {
          return
        }
        
        // Set in both cookie and localStorage for redundancy
        document.cookie = `${key}=${value};path=/;max-age=31536000;SameSite=Lax`
        window.localStorage.setItem(key, value)
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') {
          return
        }
        
        // Remove from both cookie and localStorage
        document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Lax`
        window.localStorage.removeItem(key)
      },
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    // Custom email redirect URL
    fetch: (...args) => fetch(...args)
  }
})

// Set email redirect URL
if (typeof window !== 'undefined') {
  // We are in the browser
  supabase.auth.setSession({
    access_token: '',
    refresh_token: '',
  })
  
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      // We zouden hier extra acties kunnen uitvoeren als gebruikers inloggen
      console.log('User signed in or token refreshed')
    }
  })
}

// Create a channel for testing realtime connection
const channel = supabase.channel('system')
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Realtime connection established')
    }
    if (status === 'CLOSED') {
      console.log('Realtime connection closed')
    }
    if (status === 'CHANNEL_ERROR') {
      console.error('Realtime connection error')
    }
  })

// Export channel for cleanup if needed
export { channel as realtimeChannel } 