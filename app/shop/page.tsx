// C:\Users\JJALa\Desktop\W4CWebsite\artwhickycharity\app\shop\page.tsx
import { ShopHero } from './components/ShopHero'
import { ProductList } from './components/ProductList'
import { getProducts } from './lib/products'
import { Suspense } from 'react'
import { ShopSkeleton } from './components/ShopSkeleton'

export const revalidate = 3600 // revalidate elke uur

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <main className="bg-black min-h-screen">
      <ShopHero />
      <Suspense fallback={<ShopSkeleton />}>
        <ProductList products={products} />
      </Suspense>
    </main>
  )
}
