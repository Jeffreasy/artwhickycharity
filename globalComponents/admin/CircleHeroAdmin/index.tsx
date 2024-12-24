'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CircleHeroImage } from '@/types/circle-hero'
import { getCloudinaryImageUrl } from '@/app/home/lib/cloudinary'

interface CircleHeroAdminProps {
  images: CircleHeroImage[]
  onUpdate: (images: CircleHeroImage[]) => Promise<void>
}

export function CircleHeroAdmin({ images: initialImages, onUpdate }: CircleHeroAdminProps) {
  const [images, setImages] = useState(initialImages)
  const [loading, setLoading] = useState(false)

  const handleImageUpdate = async (index: number, updates: Partial<CircleHeroImage>) => {
    const updatedImages = [...images]
    updatedImages[index] = { ...updatedImages[index], ...updates }
    
    try {
      setLoading(true)
      await onUpdate(updatedImages)
      setImages(updatedImages)
    } catch (error) {
      console.error('Failed to update images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (image: CircleHeroImage, newImage: File) => {
    try {
      const formData = new FormData()
      formData.append('file', newImage)
      formData.append('upload_preset', 'circle_hero_preset')
      
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData
        }
      )
      
      const data = await res.json()
      
      await supabase
        .from('circle_hero_images')
        .update({ 
          cloudinary_id: data.public_id,
          cloudinary_version: data.version
        })
        .eq('id', image.id)
        
    } catch (error) {
      console.error('Error updating image:', error)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Circle Hero Images</h2>
      <div className="space-y-6">
        {images.map((image, index) => (
          <div 
            key={image.id}
            className="p-4 border rounded-lg space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 relative">
                <img
                  src={getCloudinaryImageUrl(image.cloudinary_id)}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => handleImageUpdate(index, { alt: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Alt text"
                />
                <input
                  type="text"
                  value={image.url}
                  onChange={(e) => handleImageUpdate(index, { url: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="URL"
                />
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageChange(image, file)
                  }}
                  className="w-full"
                  accept="image/*"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 