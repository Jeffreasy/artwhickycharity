'use client'

import React, { useEffect, useState } from 'react'
import { CldImage } from 'next-cloudinary'
import { CharityImage } from '@/types/charity-section'
import { supabase } from '@/lib/supabase'

interface CharityAfbeeldingProps {
  initialImages: CharityImage[]
}

export function CharityAfbeelding({ initialImages }: CharityAfbeeldingProps) {
  const [images, setImages] = useState<CharityImage[]>(initialImages || [])

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('charity_images')
        .select('*')
        .order('order_number', { ascending: true })
      
      if (error) {
        console.error('Polling error:', error)
        return
      }
      
      if (data) {
        const newImages = data as CharityImage[]
        if (JSON.stringify(newImages) !== JSON.stringify(images)) {
          setImages(newImages)
        }
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [images])

  return (
    <section className="bg-black pt-0 pb-24 -mt-24">
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
