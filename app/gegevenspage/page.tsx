'use client'

import { WhiskyImage } from './components/WhiskyImage'
import { WhiskyDetails } from './components/WhiskyDetails'
import { ClientSearchParams } from '@/components/wrappers/ClientSearchParams'
import { Suspense } from 'react'
import { Loading } from '@/globalComponents/ui/Loading'

export default function GegevensPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientSearchParams />
      <div className="min-h-screen bg-black text-white pt-[120px] px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <WhiskyImage />
          <WhiskyDetails />
        </div>
      </div>
    </Suspense>
  )
}
