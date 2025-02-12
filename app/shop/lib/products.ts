// C:\Users\JJALa\Desktop\W4CWebsite\artwhickycharity\app\shop\lib\products.ts
import { Product } from '@/types/product';
import { supabase } from '@/lib/supabase';

// Tijdelijke dummy data
const DUMMY_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Limited Edition Whisky 2024',
    description: 'Single Malt Scotch Whisky, Annandale Distillery, Unpeated, Ex-Sherry Cask, Distilled 2019',
    price: 299,
    image: '66fbdbc67df6e09ea5001030_HOPEnecklabelDEF2HiRes_kl7pnt',
    cloudinary_id: '66fbdbc67df6e09ea5001030_HOPEnecklabelDEF2HiRes_kl7pnt',
    stock: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Art Print - Hope',
    description: 'Limited edition art print, signed and numbered by the artist',
    price: 149,
    image: '66fbc7d32c54ed89b3c8945b_test_pgrla9',
    cloudinary_id: '66fbc7d32c54ed89b3c8945b_test_pgrla9',
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export async function getProducts(): Promise<Product[]> {
  // TODO: Uncomment when Supabase table is ready
  // const { data: products, error } = await supabase
  //   .from('products')
  //   .select('*')
  //   .eq('is_active', true)
  //   .order('created_at', { ascending: false })

  // if (error) {
  //   console.error('Error fetching products:', error)
  //   throw new Error('Failed to fetch products')
  // }

  // return products as Product[]

  // Temporarily return dummy data
  return DUMMY_PRODUCTS
}

export async function getProductById(id: string): Promise<Product | null> {
  // TODO: Uncomment when Supabase table is ready
  // const { data: product, error } = await supabase
  //   .from('products')
  //   .select('*')
  //   .eq('id', id)
  //   .single()

  // if (error) {
  //   if (error.code === 'PGRST116') return null
  //   console.error('Error fetching product:', error)
  //   throw new Error('Failed to fetch product')
  // }

  // return product as Product

  // Temporarily return dummy data
  return DUMMY_PRODUCTS.find(p => p.id === id) || null
}
