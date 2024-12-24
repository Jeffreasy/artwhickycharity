'use client'

import React from 'react'
import { CldImage } from 'next-cloudinary'

export function WhiskyAfbeelding() {
  return (
    <section className="bg-black py-24">
      <div className="container mx-auto px-6">
        <div className="relative w-full max-w-md mx-auto">
          <CldImage
            src="673f0082162ae4c34630870d_Fles.DoosTEST_olznsb"
            alt="Whisky4Charity limited edition whisky bottle with colorful packaging"
            width={400}
            height={533}
            className="w-full h-auto"
            priority
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      </div>
    </section>
  )
}
