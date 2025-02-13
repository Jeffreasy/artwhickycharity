// C:\Users\JJALa\Desktop\W4CWebsite\artwhickycharity\app\shop\cart\page.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { CheckoutModal } from '../components/CheckoutModal';
import { redirect } from 'next/navigation'
import { SHOP_CONFIG } from '../../config/shopConfig'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-black text-white pt-[120px] pb-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6">Your Cart</h1>
            <p className="text-white/70 mb-8">Your cart is empty</p>
            <Link 
              href="/shop"
              className="inline-block bg-white text-black px-6 py-3 rounded hover:bg-white/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Shopping Cart</h1>
        
        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.id} className="bg-white/5 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Image */}
                <div className="relative w-full sm:w-32 h-32 flex-shrink-0">
                  <CldImage
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="font-bold">€{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="bg-white/10 text-white p-2 rounded hover:bg-white/20"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-white/10 text-white p-2 rounded hover:bg-white/20"
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Section */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-xl font-bold">€{totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-white text-black py-3 rounded-lg font-medium
                     hover:bg-white/90 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </main>
  );
}
