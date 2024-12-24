'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { CldImage } from 'next-cloudinary'
import { useCarouselSync } from '../../../hooks/useCarouselSync'
import 'swiper/css'

const images = [
  {
    src: "670e5eccdb7101a323d540ce_Portret1MAIN_lujhfv",
    alt: "Portrait artwork"
  },
  {
    src: "670e5f223570550072137cea_HaarlemMuurMAIN_pqqmom",
    alt: "Haarlem wall mural"
  },
  {
    src: "670e5f696a868cdfd970d3f3_MarleenMural1MAIN_kopie_2_p0vqjy",
    alt: "Marleen mural 1"
  },
  {
    src: "670e5fc0cd140baf2571de54_MarleenMural4MAIN_pdwsn7",
    alt: "Marleen mural 4"
  }
]

export function Fotocarrousel3() {
  const { onSwiper, autoplayConfig, onSlideChange, onTouchStart } = useCarouselSync('art-carousel')
  
  return (
    <div className="bg-black text-white">
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
      <div className="w-full h-[2px] bg-white"></div>
    </div>
  )
}
