'use client'

import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { FaShoppingCart, FaStore } from 'react-icons/fa'

export function CartButton() {
  const { totalItems } = useCart()
  const router = useRouter()

  return (
    <div className="fixed bottom-8 right-8 flex gap-4 z-50">
      {/* Shop Button */}
      <button
        onClick={() => router.push('/shop')}
        className="bg-white text-black w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-white/90 transition-colors"
        aria-label="Go to shop"
      >
        <FaStore size={24} />
      </button>

      {/* Cart Button */}
      <button
        onClick={() => router.push('/shop/cart')}
        className="bg-white text-black w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-white/90 transition-colors"
        aria-label="View cart"
      >
        <div className="relative">
          <FaShoppingCart size={24} />
          {totalItems > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </div>
          )}
        </div>
      </button>
    </div>
  )
} 