'use client'

import React from 'react'
import Link from 'next/link'
import { useMenu } from '@/contexts/MenuContext'

export function Navigation() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-black z-[999]">
        <div className="flex h-[80px] border-b border-white/20">
          {/* Logo/Home Link */}
          <div className="flex-none w-[200px] border-r border-white/20">
            <Link href="/" className="flex items-center justify-center h-full text-white hover:bg-white/5">
              W4C
            </Link>
          </div>

          {/* Center Space */}
          <div className="flex-1" />

          {/* Menu Button */}
          <div className="flex-none w-[200px] border-l border-white/20">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-full h-full flex items-center justify-center text-white hover:bg-white/5"
            >
              {isMenuOpen ? 'CLOSE' : 'MENU'}
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Menu */}
      <div className={`fixed inset-0 bg-black z-[998] transition-opacity duration-300 ${
        isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="h-full w-full pt-[80px]">
          <div className="container mx-auto px-4 py-12">
            <nav className="text-center">
              <ul className="space-y-8">
                <li>
                  <Link 
                    href="/" 
                    className="text-4xl font-bold text-white hover:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    HOME
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/art" 
                    className="text-4xl font-bold text-white hover:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ART
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/whisky" 
                    className="text-4xl font-bold text-white hover:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    WHISKY
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/charity" 
                    className="text-4xl font-bold text-white hover:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    CHARITY
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="text-4xl font-bold text-white hover:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ABOUT
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
} 