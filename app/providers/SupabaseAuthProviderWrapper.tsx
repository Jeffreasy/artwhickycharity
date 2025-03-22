'use client'

import { ReactNode } from 'react'
import { SupabaseAuthProvider } from './SupabaseAuthProvider'

export function SupabaseAuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <SupabaseAuthProvider>
      {children}
    </SupabaseAuthProvider>
  )
} 