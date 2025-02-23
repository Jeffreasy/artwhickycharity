import React, { Suspense } from 'react'
import { Home } from '@/app/home/components/Home'
import { SearchParamsWrapper } from '@/components/wrappers/SearchParamsWrapper'
import { Loading } from '@/globalComponents/ui/Loading'

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchParamsWrapper>
        <Home />
      </SearchParamsWrapper>
    </Suspense>
  )
}
