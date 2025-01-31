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
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

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