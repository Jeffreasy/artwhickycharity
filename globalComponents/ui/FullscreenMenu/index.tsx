'use client'

import { cn } from '@/utils/cn'
import { useMenu } from '@/contexts/MenuContext'
import Link from 'next/link'

export function FullscreenMenu() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()

  return (
    <div 
      aria-hidden={!isMenuOpen}
      className={cn(
        "fixed top-0 left-0 right-0 bottom-0",
        "z-[998]",
        "bg-black",
        "transition-all duration-500 ease-in-out",
        isMenuOpen 
          ? "opacity-100 visible pointer-events-auto" 
          : "opacity-0 invisible pointer-events-none"
      )}
    >
      <div className="h-full w-full flex items-center justify-center">
        <nav className="relative w-full mx-auto">
          {/* Grid Container */}
          <div className="grid grid-cols-2 grid-rows-2 gap-0 relative">
            {/* Vertical Border - Stops at HOME border */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2" />
            
            {/* Horizontal Border - Full screen width */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20 -translate-y-1/2" />

            {/* Menu Items */}
            <div className="flex items-center justify-center p-16">
              <Link 
                href="/art" 
                className="text-[32px] font-bold text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ART
              </Link>
            </div>

            <div className="flex items-center justify-center p-16">
              <Link 
                href="/whisky" 
                className="text-[32px] font-bold text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                WHISKY
              </Link>
            </div>

            <div className="flex items-center justify-center p-16">
              <Link 
                href="/charity" 
                className="text-[32px] font-bold text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                CHARITY
              </Link>
            </div>

            <div className="flex items-center justify-center p-16">
              <Link 
                href="/about" 
                className="text-[32px] font-bold text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ABOUT
              </Link>
            </div>
          </div>

          {/* HOME section with its own border */}
          <div className="relative pt-20">
            {/* Horizontal Border above HOME - Full width */}
            <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
            
            <div className="text-center">
              <Link 
                href="/" 
                className="text-[32px] font-bold text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                HOME
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
} 