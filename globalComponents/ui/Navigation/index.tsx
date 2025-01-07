'use client'

import React from 'react'
import { useMenu } from '@/contexts/MenuContext'
import { FullscreenMenu } from '../FullscreenMenu'
import { MdEmail } from 'react-icons/md'
import { FaInstagram } from 'react-icons/fa'

export function Navigation() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black z-[999]">
        <div className="flex h-[80px] items-center px-8 border-b border-white/20">
          {/* Contact Links - Stacked */}
          <div className="flex flex-col gap-1">
            <a 
              href="mailto:info@whisky4charity.com" 
              className="text-white/80 hover:text-white transition-colors flex items-center"
              aria-label="Send email"
            >
              <MdEmail size={24} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors flex items-center"
              aria-label="Visit Instagram"
            >
              <FaInstagram size={22} />
            </a>
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-white/80 transition-colors"
          >
            MENU
          </button>
        </div>
      </nav>

      <FullscreenMenu />
    </>
  )
} 