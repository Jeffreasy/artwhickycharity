'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import { CircleHeroImage } from '@/types/circle-hero'
import Image from 'next/image'

interface CircleHeroCompProps {
  images: CircleHeroImage[]
  words: string[]
}

export function CircleHeroComp({ images, words }: CircleHeroCompProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section className="w-full pt-32">
      <div className="relative w-full max-w-[500px] mx-auto">
        {/* Aspect ratio container */}
        <div className="pb-[100%]" />
        
        {/* Rotating image wrapper */}
        <div className="absolute inset-0">
          <div 
            className={cn(
              "relative w-full h-full overflow-hidden rounded-full",
              "border-4 cursor-pointer",
              "animate-hueGlow"
            )}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  "absolute inset-0 rounded-full overflow-hidden",
                  "transition-opacity duration-500",
                  index === currentIndex ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover rounded-full"
                    priority={index === 0}
                    sizes="(max-width: 500px) 100vw, 500px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Text container */}
      <div className="text-center mt-5">
        <h2 
          className={cn(
            "inline-block text-[64px] font-bold uppercase tracking-[2px]",
            "cursor-pointer text-white",
            "animate-textGlow",
            "md:text-[48px] sm:text-[36px]"
          )}
        >
          {words[currentIndex]}
        </h2>
      </div>
    </section>
  )
}