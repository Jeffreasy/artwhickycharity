'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Product } from '@/types/product'
import { ProductCard } from '../ProductCard'

export function ProductList({ products }: { products: Product[] }) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      const productElements = listRef.current.children
      
      gsap.from(productElements, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        clearProps: 'all'
      })
    }
  }, [])

  return (
    <section className="bg-black text-white pt-4 min-h-[75vh] flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 flex justify-center w-full">
        {products.length === 1 ? (
          // Single product layout
          <div className="w-full max-w-md mx-auto">
            <ProductCard key={products[0].id} product={products[0]} />
          </div>
        ) : (
          // Multiple products layout
          <div 
            ref={listRef} 
            className={`
              grid 
              grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
              gap-6 sm:gap-8 md:gap-10 
              w-full max-w-7xl
              ${products.length === 2 ? 'lg:grid-cols-2 max-w-4xl' : ''}
              p-4
            `}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
} 