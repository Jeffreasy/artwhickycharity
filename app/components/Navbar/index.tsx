import { SHOP_CONFIG } from '../../config/shopConfig'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="...">
      {/* Bestaande nav items */}
      
      {SHOP_CONFIG.isEnabled ? (
        <>
          <Link href="/shop" className="...">
            Shop
          </Link>
          <Link href="/shop/cart" className="...">
            <ShoppingCartIcon className="h-6 w-6" />
          </Link>
        </>
      ) : (
        <>
          <button 
            className="opacity-50 cursor-not-allowed px-4 py-2" 
            disabled
            title={SHOP_CONFIG.maintenanceMessage.title}
          >
            Shop
          </button>
          <button 
            className="opacity-50 cursor-not-allowed p-2" 
            disabled
            title={SHOP_CONFIG.maintenanceMessage.title}
          >
            <ShoppingCartIcon className="h-6 w-6" />
          </button>
        </>
      )}
    </nav>
  )
} 