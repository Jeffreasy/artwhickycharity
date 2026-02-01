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

/**
 * Create a realtime channel for specific features
 * Call cleanup() when done to prevent memory leaks
 * 
 * @example
 * const { channel, cleanup } = createRealtimeChannel('my-channel')
 * // ... use channel
 * cleanup() // Always cleanup when done
 */
export function createRealtimeChannel(channelName: string) {
  const channel = supabase.channel(channelName)

  const subscribe = (callback?: (status: string) => void) => {
    return channel.subscribe((status) => {
      if (callback) callback(status)

      if (status === 'SUBSCRIBED') {
        console.log(`Realtime channel '${channelName}' connected`)
      }
      if (status === 'CHANNEL_ERROR') {
        console.error(`Realtime channel '${channelName}' error`)
      }
    })
  }

  const cleanup = () => {
    channel.unsubscribe()
    console.log(`Realtime channel '${channelName}' cleaned up`)
  }

  return { channel, subscribe, cleanup }
} 