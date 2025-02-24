import { Suspense } from 'react'
import { Loading } from '@/globalComponents/ui/Loading'

export default function NotFound() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-lg text-white/80">The page you are looking for does not exist.</p>
        </div>
      </div>
    </Suspense>
  )
} 