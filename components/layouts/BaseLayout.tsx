'use client'

import { Suspense } from 'react'
import { Loading } from '@/globalComponents/ui/Loading'
import { cn } from '@/utils/cn'

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
  disablePadding?: boolean
  customPadding?: string
}

export function BaseLayout({ 
  children, 
  className,
  disablePadding = false,
  customPadding
}: BaseLayoutProps) {
  const defaultPadding = "pt-[80px] sm:pt-[100px] md:pt-[120px]"
  
  return (
    <div className={cn(
      !disablePadding && (customPadding || defaultPadding),
      className
    )}>
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
    </div>
  )
} 