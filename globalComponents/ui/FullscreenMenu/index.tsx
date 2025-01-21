'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'
import { useMenu } from '@/contexts/MenuContext'
import Link from 'next/link'
import { gsap } from 'gsap'

export function FullscreenMenu() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()
  const menuRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<HTMLDivElement>(null)
  const homeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const menu = menuRef.current
    const menuItems = menuItemsRef.current?.children
    const home = homeRef.current

    if (!menu || !menuItems || !home) return

    // Menu opening/closing animation
    gsap.to(menu, {
      opacity: isMenuOpen ? 1 : 0,
      duration: 0.5,
      ease: "power2.inOut"
    })

    // Menu items staggered animation
    if (isMenuOpen) {
      gsap.fromTo(menuItems,
        {
          y: 20,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2
        }
      )

      // Home button animation
      gsap.fromTo(home,
        {
          y: 20,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.6
        }
      )
    }
  }, [isMenuOpen])

  // Hover animations for menu items
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.1,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.3,
      ease: "power2.in"
    })
  }

  return (
    <div 
      ref={menuRef}
      aria-hidden={!isMenuOpen}
      className={cn(
        "fixed top-[80px] left-0 right-0 bottom-0",
        "z-[998]",
        "bg-black",
        "border-t border-white/20",
        "transition-all duration-500 ease-in-out",
        isMenuOpen 
          ? "visible pointer-events-auto" 
          : "invisible pointer-events-none"
      )}
    >
      <div className="h-full w-full">
        <nav className="relative w-full mx-auto">
          <div ref={menuItemsRef} className="grid grid-cols-2 grid-rows-2 gap-0 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20 -translate-y-1/2" />

            {/* Menu Items */}
            {[
              { href: "/art", text: "ART" },
              { href: "/whisky", text: "WHISKY" },
              { href: "/charity", text: "CHARITY" },
              { href: "/about", text: "ABOUT" }
            ].map((item) => (
              <div key={item.href} className="flex items-center justify-center py-20 px-16">
                <Link 
                  href={item.href}
                  className="text-[32px] font-bold text-white hover:text-gray-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.text}
                </Link>
              </div>
            ))}
          </div>

          {/* HOME section */}
          <div className="relative pt-20">
            <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
            
            <div ref={homeRef} className="text-center">
              <Link 
                href="/"
                className="text-[32px] font-bold text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
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