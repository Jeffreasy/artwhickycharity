'use client'

import React from 'react'
import { CldImage } from 'next-cloudinary'

export function CharityAfbeelding() {
  return (
    <section className="bg-black pt-0 pb-24 -mt-24">
      <div className="container mx-auto px-6">
        <div className="relative w-full max-w-md mx-auto">
          <CldImage
            src="6706c7cb903877eaafea1ad6_output-onlinejpgtools_cxh3k4"
            alt="Stichting Vluchteling Logo"
            width={400}
            height={300}
            className="w-full h-auto"
            priority
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      </div>
    </section>
  )
}
