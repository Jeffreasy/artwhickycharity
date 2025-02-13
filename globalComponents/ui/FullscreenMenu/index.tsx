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
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const menu = menuRef.current
    const menuItems = menuItemsRef.current?.children
    const home = homeRef.current
    const closeButton = closeButtonRef.current

    if (!menu || !menuItems || !home || !closeButton) return

    // Timeline voor gecoördineerde animaties
    const tl = gsap.timeline({ paused: true })

    // Menu backdrop animation
    tl.to(menu, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut"
    })

    // Close button animation
    .fromTo(closeButton, {
      opacity: 0,
      rotate: -180,
      scale: 0.8
    }, {
      opacity: 1,
      rotate: 0,
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)"
    }, "-=0.3")

    // Menu items staggered animation
    .fromTo(menuItems, {
      y: 20,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.2")

    // Home button animation
    .fromTo(home, {
      y: 20,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.3")

    // Play/reverse timeline based on menu state
    if (isMenuOpen) {
      tl.play()
    } else {
      tl.reverse()
    }

    return () => {
      tl.kill()
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

  // Nieuwe hover animation voor close button
  const handleCloseHover = (isEntering: boolean) => {
    if (!closeButtonRef.current) return

    gsap.to(closeButtonRef.current, {
      scale: isEntering ? 1.1 : 1,
      rotate: isEntering ? 90 : 0,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  return (
    <div 
      ref={menuRef}
      aria-hidden={!isMenuOpen}
      className={cn(
        "fixed top-[80px] sm:top-[100px] md:top-[120px] left-0 right-0 bottom-0",
        "z-[998]",
        "bg-black",
        "border-t border-white/10",
        "transition-all duration-500 ease-in-out",
        isMenuOpen 
          ? "visible pointer-events-auto opacity-0" // Start met opacity 0 voor GSAP
          : "invisible pointer-events-none opacity-0"
      )}
    >
      <div className="h-full w-full">
        <nav className="relative w-full mx-auto">
          <div ref={menuItemsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-0 relative">
            <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-px bg-white/10" />

            {/* Menu Items */}
            {[
              { href: "/art", text: "ART" },
              { href: "/whisky", text: "WHISKY" },
              { href: "/charity", text: "CHARITY" },
              { href: "/about", text: "ABOUT" }
            ].map((item) => (
              <div key={item.href} className="flex items-center justify-center py-8 sm:py-12 md:py-20 px-4 sm:px-8 md:px-16">
                <Link 
                  href={item.href}
                  className="text-2xl sm:text-3xl md:text-[32px] font-bold text-white/80 hover:text-white 
                           transition-all duration-300 tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.text}
                </Link>
              </div>
            ))}
          </div>

          {/* HOME section met Close button */}
          <div className="relative pt-8 sm:pt-12 md:pt-20">
            <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
            
            <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16">
              <div ref={homeRef} className="text-center">
                <Link 
                  href="/"
                  className="text-2xl sm:text-3xl md:text-[32px] font-bold text-white/80 hover:text-white 
                           transition-all duration-300 tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  HOME
                </Link>
              </div>

              <div className="h-8 sm:h-10 md:h-12 w-px bg-white/10" /> {/* Verticale separator */}

              <button
                ref={closeButtonRef}
                onClick={() => setIsMenuOpen(false)}
                onMouseEnter={() => handleCloseHover(true)}
                onMouseLeave={() => handleCloseHover(false)}
                className="text-2xl sm:text-3xl md:text-[32px] font-bold text-white/80 hover:text-white 
                         transition-all duration-300 tracking-wide"
                aria-label="Close menu"
              >
                CLOSE
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
} 