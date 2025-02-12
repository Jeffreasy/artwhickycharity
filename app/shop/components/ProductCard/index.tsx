'use client'

import { Product } from '@/types/product'
import { CldImage } from 'next-cloudinary'
import { useCart } from '@/contexts/CartContext'
import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/globalComponents/ui/Modal'
import gsap from 'gsap'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    const imageContainer = imageContainerRef.current

    if (!card || !imageContainer) return

    const handleMouseEnter = () => {
      gsap.to(imageContainer, {
        scale: 1.1,
        duration: 0.5,
        ease: 'power2.out'
      })
    }

    const handleMouseLeave = () => {
      gsap.to(imageContainer, {
        scale: 1,
        duration: 0.5,
        ease: 'power2.out'
      })
    }

    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
      gsap.killTweensOf(imageContainer)
    }
  }, [])

  return (
    <>
      <div 
        ref={cardRef}
        className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative pt-[100%]">
          <div 
            ref={imageContainerRef}
            className="absolute inset-0 overflow-hidden bg-black/20"
          >
            <CldImage
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
        
        <div className="p-6 bg-white/5 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-2 text-white">{product.name}</h3>
          <p className="text-white/90 mb-4">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-white">€{product.price}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
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
            <div className="relative pt-[100%]"> {/* Modal image container */}
              <div className="absolute inset-0">
                <CldImage
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

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