'use client'

import React from 'react'
import { CldImage } from 'next-cloudinary'
import type { CircleHeroImage, CircleHeroWord } from '@/types/circle-hero'

interface CircleHeroProps {
  images: CircleHeroImage[]
  words: CircleHeroWord[]
}

export function CircleHero({ images, words }: CircleHeroProps) {
  return (
    <section className="relative h-screen">
      {images.map((image) => (
        <div key={image.id} className="absolute inset-0">
          <CldImage
            src={image.cloudinary_id}
            alt={image.alt}
            width={1920}
            height={1080}
            className="object-cover w-full h-full"
            sizes="100vw"
            priority
          />
        </div>
      ))}
    </section>
  )
} 