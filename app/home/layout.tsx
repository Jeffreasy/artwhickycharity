import { BaseLayout } from '@/components/layouts/BaseLayout'
import { ErrorBoundary } from '@/components/layouts/ErrorBoundary'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <BaseLayout disablePadding>
        {children}
      </BaseLayout>
    </ErrorBoundary>
  )
} 