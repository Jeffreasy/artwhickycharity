import { Suspense } from 'react'
import { NavigationContent } from './NavigationContent'
import { Loading } from '@/globalComponents/ui/Loading'

export function Navigation() {
  return (
    <Suspense fallback={<Loading />}>
      <NavigationContent />
    </Suspense>
  )
} 