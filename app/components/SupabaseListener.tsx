'use client'

import { useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'

// Component that uses router
function SupabaseListenerContent() {
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

// Main export with Suspense
export default function SupabaseListener() {
  return (
    <Suspense fallback={null}>
      <SupabaseListenerContent />
    </Suspense>
  )
} 