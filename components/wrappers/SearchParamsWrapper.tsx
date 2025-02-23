'use client'

import { Suspense } from 'react'
import { Loading } from '@/globalComponents/ui/Loading'

export function SearchParamsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  )
} 