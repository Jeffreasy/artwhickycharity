// C:\Users\JJALa\Desktop\W4CWebsite\artwhickycharity\app\shop\page.tsx
import { ShopHero } from './components/ShopHero'
import { ProductList } from './components/ProductList'
import { getProducts } from './lib/products'
import { Suspense } from 'react'
import { ShopSkeleton } from './components/ShopSkeleton'
import * as Sentry from "@sentry/nextjs"

export const revalidate = 3600 // revalidate elke uur

export default async function ShopPage() {
  try {
    const [products, heroContent] = await Promise.all([
      getProducts(),
      getShopHeroContent()
    ])

    return (
      <main className="min-h-screen">
        <ShopHero />
        <Suspense fallback={<ShopSkeleton />}>
          <ProductList products={products} />
        </Suspense>
      </main>
    )
  } catch (error) {
    Sentry.captureException(error)
    console.error('Error loading shop content:', error)
    return (
      <main className="min-h-screen">
        <ShopHero />
        <Suspense fallback={<ShopSkeleton />}>
          <ProductList products={[]} />
        </Suspense>
      </main>
    )
  }
}
