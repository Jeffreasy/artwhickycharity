'use client'

import React, { useRef } from 'react'
import { useMenu } from '@/contexts/MenuContext'
import { FullscreenMenu } from '../FullscreenMenu'
import { MdEmail } from 'react-icons/md'
import { FaInstagram, FaShoppingCart, FaStore } from 'react-icons/fa'
import { CldImage } from 'next-cloudinary'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'

export function Navigation() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()
  const { totalItems } = useCart()
  const router = useRouter()
  const circleRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black z-[999]">
        <div className="container mx-auto">
          <div className="flex h-[80px] sm:h-[100px] md:h-[120px] items-center justify-between px-4 sm:px-6 md:px-8 border-b border-white/20">
            {/* Left: Contact Links */}
            <div className="w-[100px] flex flex-col gap-1">
              <a 
                href="mailto:info@whiskyforcharity.com" 
                className="text-white/80 hover:text-white transition-colors flex items-center"
                aria-label="Send email"
              >
                <MdEmail size={24} />
              </a>
              <a 
                href="https://www.instagram.com/whiskyforcharity/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors flex items-center"
                aria-label="Visit Instagram"
              >
                <FaInstagram size={22} />
              </a>
            </div>

            {/* Center: Logo met link naar shop */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div 
                className="relative cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => router.push('/shop')}
                role="button"
                tabIndex={0}
                aria-label="Go to shop"
              >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20">
                  <div 
                    ref={circleRef}
                    className="absolute inset-0 rounded-full bg-black border border-white/20 overflow-hidden"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CldImage
                      src="66fbc7d32c54ed89b3c8945b_test_pgrla9"
                      alt="Whisky4Charity Logo"
                      width={800}
                      height={900}
                      className="object-cover w-full h-full scale-150"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Shop, Cart en Menu buttons */}
            <div className="w-[100px] flex items-center justify-end gap-4">
              <button
                onClick={() => router.push('/shop')}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Go to shop"
              >
                <FaStore size={20} />
              </button>

              <button
                onClick={() => router.push('/shop/cart')}
                className="text-white/80 hover:text-white transition-colors relative"
                aria-label="View cart"
              >
                <FaShoppingCart size={20} />
                {totalItems > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </div>
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-white/80 transition-colors text-base sm:text-lg md:text-xl"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      </nav>

      <FullscreenMenu />
    </>
  )
} 