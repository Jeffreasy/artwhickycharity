'use client'

import { Product } from '@/types/product'
import { ProductCard } from '../ProductCard'

interface ProductListProps {
  initialProducts: Product[]
}

export function ProductList({ initialProducts }: ProductListProps) {
  return (
    <section className="bg-black text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {initialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
} 