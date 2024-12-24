'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { CldImage } from 'next-cloudinary'
import { useCarouselSync } from '../../../hooks/useCarouselSync'

// Import Swiper styles
import 'swiper/css'

const images = [
  {
    src: "670d74cb55fbc64490710ff9_Portret2_1_dsonl1",
    alt: "Portrait art piece"
  },
  {
    src: "670e9a107edb16c387d15ee8_CURRENTexpoView2_1_nu6fxp",
    alt: "Current exhibition view"
  },
  {
    src: "670d751abadde10190a95011_Tunneling1_3_xgvhtg",
    alt: "Tunneling artwork 1"
  },
  {
    src: "670d751ab3a896f2201e9ad4_Tunneling2_3_rnhgc9",
    alt: "Tunneling artwork 2"
  }
]

export default function Fotocarrousel2() {
  const { onSwiper, autoplayConfig, onSlideChange, onTouchStart } = useCarouselSync('art-carousel')
  
  return (
    <div className="bg-black text-white">
      <div className="w-full h-[2px] bg-white"></div>
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
      <div className="w-full h-[2px] bg-white"></div>
    </div>
  )
}
