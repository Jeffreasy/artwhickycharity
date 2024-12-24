'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'

interface CircleProps {
  href: string
  text: string
  glowColor: {
    background: string
    shadow: string
  }
}

const Circle = ({ href, text, glowColor }: CircleProps) => {
  const circleRef = useRef<HTMLAnchorElement>(null)
  const rotationRef = useRef<gsap.core.Tween | null>(null)
  const glowRef = useRef<gsap.core.Timeline | null>(null)
  
  useEffect(() => {
    const circle = circleRef.current
    if (!circle) return

    // Rotatie animatie
    rotationRef.current = gsap.to(circle, {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: "none"
    })

    // Aangepaste glow animatie met subtielere waardes
    glowRef.current = gsap.timeline({ repeat: -1 })

    if (glowColor.background === 'rainbow') {
      const colors = [
        { bg: 'rgba(255,0,0,0.1)', shadow: '0 0 40px 0px rgba(255,0,0,0.4)' },
        { bg: 'rgba(255,165,0,0.1)', shadow: '0 0 40px 0px rgba(255,165,0,0.4)' },
        { bg: 'rgba(255,255,0,0.1)', shadow: '0 0 40px 0px rgba(255,255,0,0.4)' },
        { bg: 'rgba(0,255,0,0.1)', shadow: '0 0 40px 0px rgba(0,255,0,0.4)' },
        { bg: 'rgba(0,0,255,0.1)', shadow: '0 0 40px 0px rgba(0,0,255,0.4)' },
        { bg: 'rgba(238,130,238,0.1)', shadow: '0 0 40px 0px rgba(238,130,238,0.4)' },
        { bg: 'rgba(255,0,0,0.1)', shadow: '0 0 40px 0px rgba(255,0,0,0.4)' }
      ]

      colors.forEach((color) => {
        glowRef.current?.to(circle, {
          backgroundColor: color.bg,
          boxShadow: color.shadow,
          duration: 5/7,
          ease: "none"
        })
      })
    } else {
      glowRef.current
        .to(circle, {
          backgroundColor: glowColor.background.replace('0.2', '0.15'),
          boxShadow: glowColor.shadow.replace('60px', '40px').replace('0.8', '0.4'),
          duration: 1.25,
          ease: "none"
        })
        .to(circle, {
          backgroundColor: glowColor.background.replace('0.2', '0.1'),
          boxShadow: glowColor.shadow.replace('60px', '40px').replace('0.8', '0.3'),
          duration: 1.25,
          ease: "none"
        })
    }

    let isActive = false
    let touchStartTime: number
    let touchStartX: number
    let touchStartY: number
    
    const activate = () => {
      if (!isActive) {
        isActive = true
        rotationRef.current?.pause()
        gsap.to(circle, {
          scale: 1.1,
          duration: 0.3,
          ease: "power2.out"
        })
      }
    }
    
    const deactivate = () => {
      if (isActive) {
        isActive = false
        rotationRef.current?.play()
        gsap.to(circle, {
          scale: 1,
          duration: 0.3,
          ease: "power2.in"
        })
      }
    }
    
    circle.addEventListener('mouseenter', activate)
    circle.addEventListener('mouseleave', deactivate)
    circle.addEventListener('touchstart', (e) => {
      touchStartTime = new Date().getTime()
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      activate()
    })
    
    circle.addEventListener('touchend', (e) => {
      const touchEndTime = new Date().getTime()
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const dx = touchEndX - touchStartX
      const dy = touchEndY - touchStartY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 10 && touchEndTime - touchStartTime < 200) {
        window.location.href = href
      } else {
        deactivate()
      }
    })
    
    return () => {
      rotationRef.current?.kill()
      glowRef.current?.kill()
      circle.removeEventListener('mouseenter', activate)
      circle.removeEventListener('mouseleave', deactivate)
    }
  }, [href, glowColor])
  
  return (
    <Link
      href={href}
      ref={circleRef}
      className={cn(
        "w-[150px] h-[150px] rounded-full flex items-center justify-center cursor-pointer",
        "border-2 border-white/10 no-underline transform-gpu preserve-3d",
        "transition-transform duration-300 ease-in-out overflow-hidden",
        "md:w-[120px] md:h-[120px] sm:w-[100px] sm:h-[100px]"
      )}
    >
      <span className="text-white text-lg font-sans text-center select-none 
        drop-shadow-md z-10 md:text-base sm:text-sm">
        {text}
      </span>
    </Link>
  )
}

export function ThreeCirclesSection() {
  return (
    <section className="flex justify-center items-center min-h-[600px] w-full 
      [perspective:1000px] bg-black">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex justify-center items-center gap-16">
          <Circle 
            href="/art" 
            text="Art" 
            glowColor={{
              background: 'rainbow',
              shadow: 'rainbow'
            }}
          />
          <Circle 
            href="/whisky" 
            text="Whisky" 
            glowColor={{
              background: 'rgba(218,165,32,0.1)',
              shadow: '0 0 40px 0px rgba(218,165,32,0.4)'
            }}
          />
          <Circle 
            href="/charity" 
            text="Charity" 
            glowColor={{
              background: 'rgba(3,117,255,0.1)',
              shadow: '0 0 40px 0px rgba(3,117,255,0.4)'
            }}
          />
        </div>
      </div>
    </section>
  )
}
