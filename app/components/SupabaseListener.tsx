'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseListener() {
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Refresh current route when auth state changes
      // This makes sure the server component picks up the new session
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return null
} 