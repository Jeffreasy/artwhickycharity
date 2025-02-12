'use client'

import { Product } from '@/types/product'
import { CldImage } from 'next-cloudinary'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import { Modal } from '@/globalComponents/ui/Modal'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div 
        className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative aspect-square">
          <CldImage
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover w-full h-full"
          />
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{product.name}</h3>
          <p className="text-white/70 mb-4">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg">€{product.price}</span>
            <button
              onClick={(e) => {
                e.stopPropagation() // Voorkom dat de modal opent bij klikken op de button
                addToCart(product)
              }}
              className="bg-white text-black px-4 py-2 rounded hover:bg-white/90 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative aspect-square">
              <CldImage
                src={product.image}
                alt={product.name}
                width={600}
                height={600}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">{product.name}</h2>
              
              <div className="text-2xl font-bold">€{product.price}</div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Description</h3>
                <p className="text-white/70">{product.description}</p>
              </div>

              {product.stock > 0 ? (
                <div className="text-green-400">
                  In Stock ({product.stock} available)
                </div>
              ) : (
                <div className="text-red-400">Out of Stock</div>
              )}

              <button
                onClick={() => {
                  addToCart(product)
                  setIsModalOpen(false)
                }}
                className="w-full bg-white text-black py-3 rounded hover:bg-white/90 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
} 