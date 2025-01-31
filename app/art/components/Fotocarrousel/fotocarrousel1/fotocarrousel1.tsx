'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { CldImage } from 'next-cloudinary'
import { useCarouselSync } from '../../../hooks/useCarouselSync'
import { ArtCarouselImage } from '@/types/art-section'
import { supabase } from '@/lib/supabase'
import 'swiper/css'

interface Fotocarrousel1Props {
  initialImages: ArtCarouselImage[]
}

export function Fotocarrousel1({ initialImages }: Fotocarrousel1Props) {
  const [images, setImages] = useState<ArtCarouselImage[]>(initialImages || [])
  const { onSwiper, autoplayConfig, onSlideChange, onTouchStart } = useCarouselSync('art-carousel')

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('art_carousel_images')
        .select('*')
        .eq('carousel_number', 1)
        .order('order_number', { ascending: true })
      
      if (error) {
        console.error('Polling error:', error)
        return
      }
      
      if (data) {
        const newImages = data as ArtCarouselImage[]
        if (JSON.stringify(newImages) !== JSON.stringify(images)) {
          setImages(newImages)
        }
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [images])
  
  return (
    <div className="w-full bg-black">
      <div className="pt-16">
        <div className="w-full h-[2px] bg-white"></div>
      </div>
      
      <div className="py-4">
        <div className="container mx-auto px-4">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={32}
            slidesPerView={2}
            speed={1000}
            autoplay={autoplayConfig}
            loop={true}
            onSwiper={onSwiper}
            onSlideChange={onSlideChange}
            onTouchStart={onTouchStart}
            className="w-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.id}>
                <div className="relative w-full h-[600px] border-2 border-black">
                  <div className="absolute inset-0 p-1">
                    <CldImage
                      src={image.cloudinary_id}
                      width={800}
                      height={600}
                      alt={image.alt_text || ""}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={image.priority}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}
