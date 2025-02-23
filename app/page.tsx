import React, { Suspense } from 'react'
import { Home } from '@/app/home/components/Home'
import { ClientSearchParams } from '@/components/wrappers/ClientSearchParams'
import { Loading } from '@/globalComponents/ui/Loading'

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientSearchParams />
      <Home />
    </Suspense>
  )
}
