import { BaseLayout } from '@/components/layouts/BaseLayout'
import { ErrorBoundary } from '@/components/layouts/ErrorBoundary'

export default function ArtLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <BaseLayout>
        {children}
      </BaseLayout>
    </ErrorBoundary>
  )
} 