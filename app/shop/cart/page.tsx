// C:\Users\JJALa\Desktop\W4CWebsite\artwhickycharity\app\shop\cart\page.tsx
'use client';

import { useCart } from '@/contexts/CartContext';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

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
    <div className="min-h-[60vh] bg-black text-white pt-[120px] pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Your Cart</h1>
          
          <div className="space-y-6">
            {items.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10"
              >
                <div className="w-24 h-24 flex-shrink-0">
                  <CldImage
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="object-cover rounded w-full h-full"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-white/70 text-sm">{item.description}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white/10 rounded hover:bg-white/20"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white/10 rounded hover:bg-white/20"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="w-24 text-right">
                    €{(item.price * item.quantity).toFixed(2)}
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
            <div className="flex justify-between mb-4">
              <span>Total Items:</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>€{totalPrice.toFixed(2)}</span>
            </div>
            <button 
              className="w-full mt-6 bg-white text-black py-3 rounded hover:bg-white/90 transition-colors"
              onClick={() => {
                // TODO: Implement checkout later
                console.log('Checkout clicked')
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
