'use client'

import { SupabaseAuthProviderWrapper } from '../providers/SupabaseAuthProviderWrapper'
import { Suspense } from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SupabaseAuthProviderWrapper>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      }>
        {children}
      </Suspense>
    </SupabaseAuthProviderWrapper>
  )
} 