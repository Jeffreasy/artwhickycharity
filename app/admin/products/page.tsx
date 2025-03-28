'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CldImage } from 'next-cloudinary'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ProductsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [products, setProducts] = useState<Product[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setDataLoading(true)
        
        let query = supabase
          .from('products')
          .select('*')
          .order('name')
        
        // Apply status filter
        if (statusFilter === 'active') {
          query = query.eq('is_active', true)
        } else if (statusFilter === 'inactive') {
          query = query.eq('is_active', false)
        }
        
        const { data, error: fetchError } = await query
        
        if (fetchError) throw fetchError
        setProducts(data || [])
      } catch (err: any) {
        console.error('Error fetching products:', err)
        setError(err.message || 'Failed to load products')
      } finally {
        setDataLoading(false)
      }
    }
    
    if (user) {
      fetchProducts()
    }
  }, [user, supabase, statusFilter])
  
  async function updateProductStatus(productId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', productId)
      
      if (error) throw error
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId ? { ...product, is_active: isActive, updated_at: new Date().toISOString() } : product
      ))
    } catch (err: any) {
      console.error('Error updating product status:', err)
      alert('Failed to update product status: ' + err.message)
    }
  }
  
  async function updateProductStock(productId: string, stock: number) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock, updated_at: new Date().toISOString() })
        .eq('id', productId)
      
      if (error) throw error
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId ? { ...product, stock, updated_at: new Date().toISOString() } : product
      ))
    } catch (err: any) {
      console.error('Error updating product stock:', err)
      alert('Failed to update product stock: ' + err.message)
    }
  }
  
  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-xl">Loading products...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/admin/products/new')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white text-sm transition-colors"
          >
            Add New Product
          </button>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400">
          {error}
        </div>
      )}
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium mb-1 text-gray-400">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
          >
            <option value="all">All Products</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-gray-400">No products found</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
              <div className="relative mb-4 pt-[100%]">
                {product.image ? (
                  <CldImage
                    src={product.image}
                    alt={product.name}
                    fill
                    className="absolute top-0 left-0 w-full h-full object-contain rounded"
                  />
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-700 flex items-center justify-center rounded">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold mb-2">{product.name}</h2>
              
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex justify-between items-center mt-auto">
                <p className="font-bold text-lg">€{Number(product.price).toFixed(2)}</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.is_active 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center mt-3">
                <span className="text-sm text-gray-400 mr-2">Stock:</span>
                <input
                  type="number"
                  min="0"
                  value={product.stock}
                  onChange={(e) => updateProductStock(product.id, parseInt(e.target.value))}
                  className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-center text-sm focus:outline-none"
                />
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => router.push(`/admin/products/${product.id}`)}
                  className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => updateProductStatus(product.id, !product.is_active)}
                  className={`flex-1 px-3 py-2 rounded text-white text-sm transition-colors ${
                    product.is_active 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {product.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 