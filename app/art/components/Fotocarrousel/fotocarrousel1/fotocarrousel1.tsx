'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { CldImage } from 'next-cloudinary'
import { useCarouselSync } from '../../../hooks/useCarouselSync'
import 'swiper/css'

const images = [
  {
    src: "670e5cf0c39accaae7d03237_Eindje1MAIN_ev82y2",
    alt: "Art project image 1"
  },
  {
    src: "670e5d6099aff96b3c142b69_Eindje3MAIN_zjhlq8",
    alt: "Art project image 2"
  },
  {
    src: "670e5df33b3c0c865013548a_Eindje2MAIN_vksjv4",
    alt: "Art project image 3"
  },
  {
    src: "670e5e2f377e95ea46536c67_Eindje4MAIN_e5ov4x",
    alt: "Art project image 4"
  }
]

export function Fotocarrousel1() {
  const { onSwiper, autoplayConfig, onSlideChange, onTouchStart } = useCarouselSync('art-carousel')
  
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
              <SwiperSlide key={index}>
                <div className="relative w-full h-[600px] border-2 border-black">
                  <div className="absolute inset-0 p-1">
                    <CldImage
                      src={image.src}
                      alt={image.alt}
                      width={800}
                      height={600}
                      className="object-cover w-full h-full"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index < 2}
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
