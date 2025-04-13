// C:\Users\JJALa\Desktop\W4CWebsite\artwhickycharity\app\shop\page.tsx
import { ShopHero } from './components/ShopHero'
import { ProductList } from './components/ProductList'
import { getProducts } from './lib/products'
import { Suspense } from 'react'
import { ShopSkeleton } from './components/ShopSkeleton'
import * as Sentry from "@sentry/nextjs"
import { redirect } from 'next/navigation'
import { SHOP_CONFIG } from '../config/shopConfig'
import { Product } from '@/types/product'; // Import Product type

export const revalidate = 3600 // revalidate elke uur

export const metadata = {
  title: 'Shop Coming Soon | Whisky For Charity',
  description: 'Our webshop is currently under construction. Check back soon for an amazing selection of whiskies for charity.',
}

export default async function ShopPage() {
  let products: Product[] = []
  let hopeProduct: Product | null = null

  try {
    products = await getProducts()
    
    // Find the specific HOPE product
    const hopeProductName = "Limited Edition Whisky HOPE"; 
    hopeProduct = products.find(p => p.name === hopeProductName) || null;

  } catch (error) {
    Sentry.captureException(error)
    console.error('Error loading shop content:', error)
    // Keep products as [] and hopeProduct as null
  }

  return (
    <main className="min-h-screen">
      <ShopHero hopeProduct={hopeProduct} />
      <Suspense fallback={<ShopSkeleton />}>
        <ProductList products={products} />
      </Suspense>
    </main>
  )
}
