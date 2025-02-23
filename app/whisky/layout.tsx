import { BaseLayout } from '@/components/layouts/BaseLayout'
import { ErrorBoundary } from '@/components/layouts/ErrorBoundary'

export default function WhiskyLayout({
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