'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loading } from '@/globalComponents/ui/Loading'

interface SearchParamsWrapperProps {
  children: React.ReactNode
}

function SearchParamsContent({ children }: SearchParamsWrapperProps) {
  // Trigger the useSearchParams hook here
  useSearchParams()
  return <>{children}</>
}

export function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={<Loading />}>
      <SearchParamsContent>{children}</SearchParamsContent>
    </Suspense>
  )
} 