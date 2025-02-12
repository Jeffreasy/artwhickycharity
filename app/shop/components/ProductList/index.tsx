'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Product } from '@/types/product'
import { ProductCard } from '../ProductCard'

export function ProductList({ initialProducts }: { initialProducts: Product[] }) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      const products = listRef.current.children
      
      gsap.from(products, {
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
    <section className="bg-black text-white pt-4 min-h-[75vh] flex items-center">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div ref={listRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {initialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
} 