import { Suspense } from 'react'
import { Loading } from '@/globalComponents/ui/Loading'

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="pt-[80px] sm:pt-[100px] md:pt-[120px]">
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
    </div>
  )
} 