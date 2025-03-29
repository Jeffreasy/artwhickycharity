'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CldImage } from 'next-cloudinary'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  images: string[]
  cloudinary_id: string
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ProductEdit({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [image, setImage] = useState('')
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  
  // Fetch product details
  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setDataLoading(true)
        
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // Product not found
            throw new Error('Product not found')
          }
          throw fetchError
        }
        
        setProduct(data)
        
        // Initialize form fields
        setName(data.name || '')
        setDescription(data.description || '')
        setPrice(data.price ? data.price.toString() : '')
        setStock(data.stock ? data.stock.toString() : '')
        setIsActive(!!data.is_active)
        setImage(data.image || '')
        setAdditionalImages(Array.isArray(data.images) ? data.images.filter((img: string) => img !== data.image) : [])
      } catch (err: any) {
        console.error('Error fetching product details:', err)
        setError(err.message || 'Failed to load product details')
      } finally {
        setDataLoading(false)
      }
    }
    
    if (user && params.id) {
      fetchProductDetails()
    }
  }, [user, params.id, supabase])
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)
      
      const updatedProduct = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        is_active: isActive,
        image,
        images: [image, ...additionalImages],
        updated_at: new Date().toISOString()
      }
      
      const { error: updateError } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', params.id)
      
      if (updateError) throw updateError
      
      setSuccessMessage('Product updated successfully')
      
      // Update local state
      setProduct({
        ...product!,
        ...updatedProduct
      })
      
      // Short delay before allowing another submission
      setTimeout(() => {
        setIsSubmitting(false)
      }, 1000)
    } catch (err: any) {
      console.error('Error updating product:', err)
      setError(err.message || 'Failed to update product')
      setIsSubmitting(false)
    }
  }
  
  const removeImage = (imageToRemove: string) => {
    setAdditionalImages(additionalImages.filter(img => img !== imageToRemove))
  }
  
  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-xl">Loading product details...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/admin/login')
    return null
  }
  
  if (!product && !dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
          >
            Back to Products
          </button>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400">
          {error || 'Product not found or you do not have permission to view it.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <button
          onClick={() => router.push('/admin/products')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
        >
          Back to Products
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg text-green-400">
          {successMessage}
        </div>
      )}
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none min-h-[150px]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:outline-none"
                  />
                  <span>Active (visible in shop)</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Main Image ID</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
                  placeholder="Cloudinary ID (e.g. 'product_image_1')"
                  required
                />
              </div>
              
              {image && (
                <div className="relative h-40 mt-2">
                  <CldImage
                    src={image}
                    alt="Main product image"
                    fill
                    className="object-contain rounded"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Additional Images (comma-separated IDs)</label>
                <input
                  type="text"
                  value={additionalImages.join(',')}
                  onChange={(e) => setAdditionalImages(e.target.value.split(',').map(img => img.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
                  placeholder="image1, image2, image3"
                />
              </div>
              
              {additionalImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {additionalImages.map((img, index) => (
                    <div key={index} className="relative h-20 group">
                      <CldImage
                        src={img}
                        alt={`Additional image ${index + 1}`}
                        fill
                        className="object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-2">
                Note: Images should be uploaded to Cloudinary first. Enter the Cloudinary ID for each image.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}