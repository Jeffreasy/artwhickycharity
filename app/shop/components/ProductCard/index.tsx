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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  // Auto-rotate images in card view
  useEffect(() => {
    if (!product.images?.length) return
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }, 3000) // Rotate every 3 seconds

    return () => clearInterval(interval)
  }, [product.images])

  // Reset indices when product changes
  useEffect(() => {
    setCurrentImageIndex(0)
    setModalImageIndex(0)
  }, [product.id])

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

  // Get the current images to display
  const cardImage = product.images?.[currentImageIndex] || product.image
  const modalImage = product.images?.[modalImageIndex] || product.image

  return (
    <>
      <div ref={cardRef} className="bg-black/50 rounded-lg overflow-hidden border border-white/10 flex flex-col h-full">
        <div ref={imageContainerRef} className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden" onClick={() => setIsModalOpen(true)}>
          <CldImage
            src={cardImage}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="p-4 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-white/70 mb-4 line-clamp-3">{product.description}</p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-xl font-bold">€{product.price.toFixed(2)}</span>
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
        <div className="text-white max-h-[90vh] overflow-y-auto px-4 py-6 w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-black/50">
                <CldImage
                  src={modalImage}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Thumbnail Gallery - Only show if there are multiple images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image}
                      onClick={() => setModalImageIndex(index)}
                      className={`relative w-20 h-24 flex-shrink-0 rounded-md overflow-hidden bg-black/50
                               ${modalImageIndex === index ? 'ring-2 ring-white' : 'opacity-70'}`}
                    >
                      <CldImage
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl md:text-3xl font-bold">{product.name}</h2>
              <div className="text-xl md:text-2xl font-bold">€{product.price.toFixed(2)}</div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-white/70 text-sm md:text-base">{product.description}</p>
              </div>
              
              {product.stock > 0 ? (
                <div className="text-green-400 text-sm">
                  In Stock ({product.stock} available)
                </div>
              ) : (
                <div className="text-red-400 text-sm">Out of Stock</div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-3 mt-auto">
                <button
                  onClick={() => {
                    addToCart(product)
                    setIsModalOpen(false)
                  }}
                  className="w-full bg-white text-black py-3 rounded-lg font-medium
                           hover:bg-white/90 transition-colors"
                >
                  Add to Cart
                </button>
                
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-transparent border border-white/20 text-white py-3 
                           rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
} 