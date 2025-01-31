'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'
import { CircleSection, createCircleSection } from '@/types/circle-sections'
import { supabase } from '@/lib/supabase'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface CircleProps {
  href: string
  text: string
  glowColor: {
    background: string
    shadow: string
  }
  styling: {
    // Circle styling
    circleSizeDesktop: number
    circleSizeTablet: number
    circleSizeMobile: number
    borderWidth: number
    borderColor: string
    borderStyle: string
    
    // Text styling
    fontSizeDesktop: number
    fontSizeTablet: number
    fontSizeMobile: number
    fontWeight: string
    textColor: string
    
    // Animation
    rotationDuration: number
    hoverScale: number
    animationEase: string
    
    // Glow
    glowIntensity: number
    glowDuration: number
  }
}

const Circle = ({ href, text, glowColor, styling }: CircleProps) => {
  const circleRef = useRef<HTMLAnchorElement>(null)
  const rotationRef = useRef<gsap.core.Tween | null>(null)
  const glowRef = useRef<gsap.core.Timeline | null>(null)
  
  useEffect(() => {
    const circle = circleRef.current
    if (!circle) return

    // Rotatie animatie met aangepaste duration
    rotationRef.current = gsap.to(circle, {
      rotation: 360,
      duration: styling.rotationDuration,
      repeat: -1,
      ease: "none"
    })

    // Aangepaste glow animatie
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
          backgroundColor: glowColor.background,
          boxShadow: glowColor.shadow,
          duration: styling.glowDuration / 2,
          ease: styling.animationEase
        })
        .to(circle, {
          backgroundColor: glowColor.background.replace(/[\d.]+\)$/, `${styling.glowIntensity * 0.5})`),
          boxShadow: glowColor.shadow.replace(/[\d.]+\)$/, `${styling.glowIntensity * 0.3})`),
          duration: styling.glowDuration / 2,
          ease: styling.animationEase
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
          scale: styling.hoverScale,
          duration: 0.3,
          ease: styling.animationEase
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
  }, [href, glowColor, styling])
  
  return (
    <Link
      href={href}
      ref={circleRef}
      style={{
        '--circle-size-desktop': `${styling.circleSizeDesktop}px`,
        '--circle-size-tablet': `${styling.circleSizeTablet}px`,
        '--circle-size-mobile': `${styling.circleSizeMobile}px`,
        '--font-size-desktop': `${styling.fontSizeDesktop}px`,
        '--font-size-tablet': `${styling.fontSizeTablet}px`,
        '--font-size-mobile': `${styling.fontSizeMobile}px`,
        borderWidth: styling.borderWidth,
        borderColor: styling.borderColor,
        borderStyle: styling.borderStyle,
        color: styling.textColor,
        fontWeight: styling.fontWeight,
      } as React.CSSProperties}
      className={cn(
        "w-[var(--circle-size-desktop)] h-[var(--circle-size-desktop)]",
        "md:w-[var(--circle-size-tablet)] md:h-[var(--circle-size-tablet)]",
        "sm:w-[var(--circle-size-mobile)] sm:h-[var(--circle-size-mobile)]",
        "rounded-full flex items-center justify-center cursor-pointer",
        "no-underline transform-gpu preserve-3d",
        "transition-transform duration-300 overflow-hidden"
      )}
    >
      <span 
        className={cn(
          "text-center select-none drop-shadow-md z-10",
          "text-[var(--font-size-desktop)]",
          "md:text-[var(--font-size-tablet)]",
          "sm:text-[var(--font-size-mobile)]"
        )}
      >
        {text}
      </span>
    </Link>
  )
}

interface ThreeCirclesSectionProps {
  initialSections?: CircleSection[]
}

export function ThreeCirclesSection({ initialSections }: ThreeCirclesSectionProps) {
  const [sections, setSections] = useState<CircleSection[]>(() => {
    if (!initialSections) return []
    return initialSections.map(section => createCircleSection(section))
  })

  // Functie om sections op te halen
  const fetchSections = async () => {
    const { data } = await supabase
      .from('circle_sections')
      .select('*')
      .eq('is_active', true)
      .order('order_number', { ascending: true })
    
    if (data) {
      setSections(data.map(section => createCircleSection(section)))
    }
  }

  useEffect(() => {
    void fetchSections()
    console.log('Setting up ThreeCircles realtime subscription...')

    const channel = supabase.channel('circle_sections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circle_sections',
        },
        async (payload) => {
          console.log('ThreeCircles change received:', payload)
          await fetchSections()
        }
      )
      .subscribe((status) => {
        console.log('ThreeCircles subscription status:', status)
      })

    return () => {
      console.log('Cleaning up ThreeCircles subscription')
      void channel.unsubscribe()
    }
  }, []) // Leeg dependency array

  if (!sections || sections.length === 0) {
    return null
  }

  return (
    <section className="flex justify-center items-center min-h-[600px] w-full relative z-0">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex justify-center items-center gap-16">
          {sections.map((section) => (
            <Circle 
              key={section.id}
              href={section.href}
              text={section.text}
              glowColor={section.glowColor}
              styling={{
                circleSizeDesktop: section.circle_size_desktop,
                circleSizeTablet: section.circle_size_tablet,
                circleSizeMobile: section.circle_size_mobile,
                borderWidth: section.border_width,
                borderColor: section.border_color,
                borderStyle: section.border_style,
                fontSizeDesktop: section.font_size_desktop,
                fontSizeTablet: section.font_size_tablet,
                fontSizeMobile: section.font_size_mobile,
                fontWeight: section.font_weight,
                textColor: section.text_color,
                rotationDuration: section.rotation_duration,
                hoverScale: section.hover_scale,
                animationEase: section.animation_ease,
                glowIntensity: section.glow_intensity,
                glowDuration: section.glow_duration,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
