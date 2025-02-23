import React from 'react'
import { Home } from '@/app/home/components/Home'
import { SearchParamsWrapper } from '@/components/wrappers/SearchParamsWrapper'

export default function Page() {
  return (
    <SearchParamsWrapper>
      <Home />
    </SearchParamsWrapper>
  )
}
