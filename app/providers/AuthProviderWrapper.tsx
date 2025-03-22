'use client'

import { ReactNode } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { CombinedAuthProvider } from './CombinedAuthProvider'

// Inner component that can use the useSession hook
function CombinedAuthWrapper({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  
  return (
    <CombinedAuthProvider session={session} status={status}>
      {children}
    </CombinedAuthProvider>
  )
}

// Main wrapper component that provides session
export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CombinedAuthWrapper>
        {children}
      </CombinedAuthWrapper>
    </SessionProvider>
  )
} 