'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { cn } from '@/utils/cn'
import { useRouter, usePathname } from 'next/navigation'
import { useMenu } from '@/contexts/MenuContext'
import { FullscreenMenu } from '../FullscreenMenu'
import { MenuBar } from '../MenuBar'

// Types
interface NavIconProps {
  icon: React.ReactNode
  label?: string
  href?: string
}

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

// Reusable Components
const NavIcon = ({ icon, label, href }: NavIconProps) => {
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = iconRef.current
    if (!element) return

    gsap.to(element, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    })

    element.addEventListener('mouseenter', () => {
      gsap.to(element, {
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out"
      })
    })

    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: "power2.in"
      })
    })
  }, [])

  const content = (
    <div ref={iconRef} className="flex items-center space-x-2">
      {label && <div className="text-white text-sm font-medium">{label}</div>}
      <div className="text-white">{icon}</div>
    </div>
  )

  return href ? (
    <a href={href} className="flex items-center justify-center w-12 h-12">
      {content}
    </a>
  ) : content
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, children, className }, ref) => {
    const router = useRouter()
    const localRef = useRef<HTMLAnchorElement>(null)
    const actualRef = (ref || localRef) as React.RefObject<HTMLAnchorElement>

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      
      const element = actualRef.current
      if (element) {
        gsap.to(element.querySelector('.nav-text'), {
          scale: 0.95,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            router.push(href)
            window.dispatchEvent(new CustomEvent('closeMenu'))
          }
        })
      }
    }

    useEffect(() => {
      const element = actualRef.current
      if (!element) return

      element.addEventListener('mouseenter', () => {
        gsap.to(element, {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          duration: 0.3,
          ease: "power2.out"
        })
        
        const textElement = element.querySelector('.nav-text')
        if (textElement) {
          gsap.to(textElement, {
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out"
          })
        }
      })

      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          backgroundColor: 'rgba(255, 255, 255, 0)',
          duration: 0.3,
          ease: "power2.in"
        })
        
        const textElement = element.querySelector('.nav-text')
        if (textElement) {
          gsap.to(textElement, {
            scale: 1,
            duration: 0.3,
            ease: "power2.in"
          })
        }
      })
    }, [])

    return (
      <a 
        ref={actualRef}
        href={href} 
        onClick={handleClick}
        className={cn(
          "flex items-center justify-center text-white text-4xl font-medium",
          "relative overflow-hidden",
          "border-r border-b border-white/20",
          className
        )}
      >
        <span className="nav-text relative z-10">{children}</span>
      </a>
    )
  }
)

NavLink.displayName = 'NavLink'

// Icons
const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19V7H20L18 15H6M4 19H6M4 19H4.5M6 19H9M17 17C17 17.5523 16.5523 18 16 18C15.4477 18 15 17.5523 15 17C15 16.4477 15.4477 16 16 16C16.5523 16 17 16.4477 17 17ZM11 17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17C9 16.4477 9.44772 16 10 16C10.5523 16 11 16.4477 11 17Z" />
  </svg>
)

// Menu Button vereenvoudigd
const MenuButton = React.forwardRef<HTMLButtonElement, { isOpen: boolean; onClick: () => void }>(
  ({ isOpen, onClick }, ref) => {
    useEffect(() => {
      const element = ref as React.RefObject<HTMLButtonElement>
      if (!element.current) return

      element.current.addEventListener('mouseenter', () => {
        gsap.to(element.current, {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          duration: 0.3,
          ease: "power2.out"
        })
      })

      element.current.addEventListener('mouseleave', () => {
        gsap.to(element.current, {
          backgroundColor: 'rgba(255, 255, 255, 0)',
          duration: 0.3,
          ease: "power2.in"
        })
      })
    }, [])

    return (
      <button 
        ref={ref}
        onClick={onClick}
        className="w-full h-full flex items-center justify-center text-white text-lg font-medium"
      >
        {isOpen ? 'CLOSE' : 'MENU'}
      </button>
    )
  }
)

MenuButton.displayName = 'MenuButton'

// Cart Item component vereenvoudigd
const CartItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex items-center space-x-3 group">
    <span className="text-white text-sm font-medium">{label}</span>
    <div className="text-white transform transition-all duration-300 group-hover:scale-110">
      {icon}
    </div>
  </div>
)

// Divider component vereenvoudigd
const Divider = () => (
  <div className="h-[50px] w-[1px] bg-white/20 mx-8" />
)

// Main Component
export function Navigation() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()
  const menuRef = useRef<HTMLDivElement>(null)
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // Sluit menu bij route verandering
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname, setIsMenuOpen])

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return

    // Kill alle lopende animaties bij unmount
    const ctx = gsap.context(() => {
      if (isMenuOpen) {
        // ... animaties
      } else {
        // ... animaties
      }
    }, menu)

    return () => {
      ctx.kill() // Cleanup alle animaties
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (isMenuOpen) {
      // Focus eerste menu item
      firstMenuItemRef.current?.focus()
    } else {
      // Focus terug naar menu knop
      menuButtonRef.current?.focus()
    }
  }, [isMenuOpen])

  const menuItems = useMemo(() => [
    { href: '/art', label: 'ART', className: 'border-r border-b border-white/20' },
    { href: '/whisky', label: 'WHISKY', className: 'border-b border-white/20' },
    { href: '/charity', label: 'CHARITY', className: 'border-r border-b border-white/20' },
    { href: '/about', label: 'ABOUT', className: 'border-b border-white/20' },
    { href: '/', label: 'HOME', className: 'col-span-2 border-b border-white/20' }
  ], [])

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-black z-[51]">
        <div className="flex h-[125px] border-b border-white/20">
          {/* Left Section - Social Links */}
          <div className="flex-none w-[200px] border-r border-white/20">
            <div className="flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center border-b border-white/20 hover:bg-white/5 transition-colors">
                <NavIcon 
                  icon={<EmailIcon />} 
                  href="mailto:info@whiskyforcharity.com" 
                />
              </div>
              <div className="flex-1 flex items-center justify-center hover:bg-white/5 transition-colors">
                <NavIcon 
                  icon={<InstagramIcon />} 
                  href="https://www.instagram.com/whiskyforcharity/" 
                />
              </div>
            </div>
          </div>

          {/* Center Section - Empty */}
          <div className="flex-1" />

          {/* Right Section - Menu Button */}
          <div className="flex-none w-[200px] border-l border-white/20">
            <MenuButton 
              ref={menuButtonRef}
              isOpen={isMenuOpen} 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
            />
          </div>
        </div>
      </nav>

      {/* Fullscreen Menu */}
      <div 
        ref={menuRef}
        className={cn(
          "fixed inset-0 bg-black z-50 transition-all duration-300",
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <div className="h-full w-full relative pt-[125px]">
          <div className="grid grid-cols-2 grid-rows-[1fr_1fr_0.8fr] h-full border-l border-white/20">
            {menuItems.map((item, index) => (
              <NavLink 
                key={item.href}
                href={item.href} 
                className={cn(
                  "flex items-center justify-center text-white text-4xl font-medium",
                  "relative overflow-hidden border-b border-white/20",
                  "hover:bg-white/5 transition-colors",
                  item.className
                )}
                ref={index === 0 ? firstMenuItemRef : undefined}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </>
  )
} 