import React, { Suspense } from 'react'
import { Home } from '@/app/home/components/Home'
import { Loading } from '@/globalComponents/ui/Loading'

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  )
}
