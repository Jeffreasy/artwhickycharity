import { BaseLayout } from '@/components/layouts/BaseLayout'
import { ErrorBoundary } from '@/components/layouts/ErrorBoundary'
import { SHOP_CONFIG } from '../config/shopConfig'
import ShopClosed from './components/ShopClosed'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Als shop disabled is, toon alleen de ShopClosed component
  if (!SHOP_CONFIG.isEnabled) {
    return <ShopClosed />
  }

  return (
    <ErrorBoundary>
      <BaseLayout>
        {children}
      </BaseLayout>
    </ErrorBoundary>
  )
} 