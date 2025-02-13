// C:\Users\JJALa\Desktop\W4CWebsite\artwhickycharity\app\shop\page.tsx
'use client'

import { ShopHero } from './components/ShopHero'
import { ProductList } from './components/ProductList'
import { getProducts } from './lib/products'
import { useState, useEffect } from 'react'
import { Product } from '@/types/product'
import { ShopSkeleton } from './components/ShopSkeleton'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const fetchedProducts = await getProducts()
        setProducts(fetchedProducts)
        setTimeout(() => setIsLoading(false), 2000)
      } catch (error) {
        console.error('Error loading products:', error)
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (isLoading) return <ShopSkeleton />

  return (
    <div className="min-h-screen">
      <ShopHero />
      <ProductList initialProducts={products} />
    </div>
  )
}
