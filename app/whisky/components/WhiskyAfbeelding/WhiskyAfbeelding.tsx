'use client'

import React, { useEffect, useState } from 'react'
import { CldImage } from 'next-cloudinary'
import { WhiskyImage } from '@/types/whisky-section'
import { supabase } from '@/lib/supabase'

interface WhiskyAfbeeldingProps {
  initialImages: WhiskyImage[]
}

export function WhiskyAfbeelding({ initialImages }: WhiskyAfbeeldingProps) {
  const [images, setImages] = useState<WhiskyImage[]>(initialImages || [])

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('whisky_images')
        .select('*')
        .order('order_number', { ascending: true })
      
      if (error) {
        console.error('Polling error:', error)
        return
      }
      
      if (data) {
        const newImages = data as WhiskyImage[]
        if (JSON.stringify(newImages) !== JSON.stringify(images)) {
          setImages(newImages)
        }
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [images])

  return (
    <section className="bg-black py-24">
      <div className="container mx-auto px-6">
        {images.map((image) => (
          <div key={image.id} className="relative w-full max-w-md mx-auto">
            <CldImage
              src={image.cloudinary_id}
              alt={image.alt_text}
              width={image.width}
              height={image.height}
              className="w-full h-auto"
              priority={image.priority}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
