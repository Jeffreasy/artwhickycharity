'use client'

import React from 'react'

export function LuukBodeSection() {
  return (
    <section className="bg-black py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {/* Mobile: Stacked layout (text-video-text) */}
        <div className="md:hidden space-y-4">
          <h2 className="text-4xl font-bold text-white text-center">
            Luuk
          </h2>
          
          <div className="relative w-full pt-[56.25%]">
            <iframe
              src="https://streamable.com/e/q1heqn"
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              frameBorder="0"
              allowFullScreen
            />
          </div>

          <h2 className="text-4xl font-bold text-white text-center">
            Bode
          </h2>
        </div>

        {/* Desktop: Side by side layout met grotere video */}
        <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
          <h2 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white">
            Luuk
          </h2>

          <div className="relative w-[60vw] max-w-[1000px]"> {/* Grotere video container */}
            <div className="relative pt-[56.25%]">
              <iframe
                src="https://streamable.com/e/q1heqn"
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>

          <h2 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white">
            Bode
          </h2>
        </div>
      </div>
    </section>
  )
} 