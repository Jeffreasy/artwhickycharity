'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { FaHome } from 'react-icons/fa'

export function HomeButton() {
  const router = useRouter()

  return (
    <div className="w-full bg-black py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 flex justify-center">
        <button
          onClick={() => router.push('/')}
          className="group relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full 
                   bg-white/5 border border-white/20 hover:border-white/40 
                   transition-all duration-300 ease-out
                   hover:scale-105"
          aria-label="Go to homepage"
        >
          <FaHome className="w-8 h-8 md:w-10 md:h-10 text-white/80 group-hover:text-white 
                          transition-all duration-300 ease-out" />
          
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 rounded-full bg-white/5 
                        opacity-0 group-hover:opacity-100 
                        blur-xl transition-opacity duration-300" />
        </button>
      </div>
    </div>
  )
} 