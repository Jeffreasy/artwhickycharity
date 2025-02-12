// C:\Users\JJALa\Desktop\W4CWebsite\artwhickycharity\app\shop\page.tsx
import { ShopHero } from './components/ShopHero'
import { ProductList } from './components/ProductList'
import { getProducts } from './lib/products'

export const revalidate = 0

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <main>
      <ShopHero />
      <ProductList initialProducts={products} />
    </main>
  )
}
