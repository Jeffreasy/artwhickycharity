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
    <div className="pt-[80px] sm:pt-[100px] md:pt-[120px]">
      {children}
    </div>
  )
} 