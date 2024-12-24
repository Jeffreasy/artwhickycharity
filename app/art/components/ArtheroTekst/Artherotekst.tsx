'use client'

import React from 'react'
import { CldImage } from 'next-cloudinary'

const ArtheroTekst = () => {
  return (
    <section className="relative h-[80vh] w-full">
      {/* Background Image */}
      <CldImage
        src="670e9cf1f9fe2264baa85f61_background_a1nrcr"
        alt="Art background"
        width={1920}
        height={1080}
        className="object-cover absolute inset-0 w-full h-full"
        priority
        sizes="100vw"
      />
      
      {/* Content Block */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/70 p-12 md:p-16 max-w-4xl mx-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              ART
            </h1>
            <h2 className="text-xl md:text-2xl mb-4">
              Art meets Whisky: Luuk Bode's Symphony of Colors on every bottle
            </h2>
            <div className="space-y-6">
              <p className="text-lg">
                In this exclusive collaboration, the vibrant world of Luuk Bode's art meets the distinguished realm of fine whisky. Luuk Bode, a celebrated artist known for his dynamic and expressive style, brings a burst of creativity to each bottle.
              </p>
              <p className="text-lg">
                Every stroke of Bode's brush tells a story, transforming these limited edition bottles into unique works of art. His use of vivid colors and bold patterns reflects a spirit of innovation and passion, mirroring the meticulous craft of whisky-making.
              </p>
              <p className="text-lg">
                This collaboration is not just about adorning a bottle; it's about creating a narrative that resonates with each holder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ArtheroTekst
