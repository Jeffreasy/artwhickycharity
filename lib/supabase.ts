import { createClient } from '@supabase/supabase-js'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
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
  }
)

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