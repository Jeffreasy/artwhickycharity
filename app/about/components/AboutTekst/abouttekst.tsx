'use client'

import React, { useEffect, useRef, useState } from 'react'
import { HiOutlineMail } from 'react-icons/hi'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AboutSection } from '@/types/about-section'
import { supabase } from '@/lib/supabase'

interface AboutTekstProps {
  initialSections: AboutSection[]
}

const renderText = (content: string, isTitle: boolean = false) => {
  return content.split('').map((char, index) => (
    <span 
      key={index} 
      className={`
        animate-letter 
        inline-block
        ${char === ' ' ? 'w-2' : ''} 
        ${char === '\n' ? 'block h-6' : ''}
      `}
    >
      {char}
    </span>
  ))
}

export function AboutTekst({ initialSections }: AboutTekstProps) {
  const [sections, setSections] = useState<AboutSection[]>(initialSections || [])
  const containerRef = useRef<HTMLDivElement>(null)
  const textRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  const setTextRef = (el: HTMLElement | null, key: string) => {
    if (textRefs.current) {
      textRefs.current[key] = el
    }
  }

  // Realtime updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('about_sections')
        .select('*')
        .order('order_number', { ascending: true })
      
      if (error) {
        console.error('Polling error:', error)
        return
      }
      
      if (data) {
        const newSections = data as AboutSection[]
        if (JSON.stringify(newSections) !== JSON.stringify(sections)) {
          setSections(newSections)
        }
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [sections])

  // GSAP animaties
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    
    const container = containerRef.current
    if (!container) return

    // Scroll animaties
    const animateTextIn = (elements: NodeListOf<Element>, delay: number = 0) => {
      gsap.set(elements, { 
        opacity: 0,
        y: 10,
        rotateX: 15
      })

      gsap.to(elements, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.005,
        ease: "power2.out",
        delay,
        scrollTrigger: {
          trigger: container,
          start: "top 70%",
          end: "bottom 80%",
        }
      })
    }

    // Hover effecten per letter
    const addLetterHoverEffects = (element: HTMLDivElement, isLargeText: boolean) => {
      const letters = element.querySelectorAll('span')
      
      letters.forEach((letter) => {
        letter.addEventListener('mouseenter', () => {
          gsap.to(letter, {
            scale: isLargeText ? 1.05 : 1.08,
            textShadow: isLargeText 
              ? '0 0 15px rgba(255,255,255,0.3)'
              : '0 0 8px rgba(255,255,255,0.2)',
            duration: 0.15,
            ease: "power1.out"
          })
        })

        letter.addEventListener('mouseleave', () => {
          gsap.to(letter, {
            scale: 1,
            textShadow: 'none',
            duration: 0.1,
            ease: "power1.inOut"
          })
        })
      })
    }

    // Toepassen van animaties
    const letters = container.querySelectorAll('.animate-letter')
    animateTextIn(letters, 0.3)

    // Hover effecten toevoegen aan alle tekst elementen
    Object.values(textRefs.current).forEach((ref) => {
      if (ref) addLetterHoverEffects(ref as HTMLDivElement, false)
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [sections])

  return (
    <section ref={containerRef} className="min-h-screen bg-black text-white py-24">
      <div className="container mx-auto px-6">
        {sections
          .filter(section => section.style_type === 'title')
          .map(section => (
            <h1 
              key={section.id} 
              ref={(el) => setTextRef(el, section.section_key)}
              className="text-5xl font-bold text-center mb-16"
            >
              {renderText(section.content, true)}
            </h1>
          ))}

        <div className="max-w-4xl mx-auto space-y-8 text-center">
          {sections
            .filter(section => section.style_type === 'paragraph')
            .map(section => (
              <p 
                key={section.id} 
                ref={(el) => setTextRef(el, section.section_key)}
                className="text-lg leading-relaxed"
              >
                {renderText(section.content)}
              </p>
            ))}

          <div className="mt-16">
            {sections
              .filter(section => section.style_type === 'email')
              .map(section => (
                <Link 
                  key={section.id}
                  href={`mailto:${section.content}`}
                  className="inline-flex items-center justify-center gap-2 text-xl hover:text-blue-400 transition-colors"
                >
                  <HiOutlineMail className="w-8 h-8" />
                  <span className="sr-only">Email us</span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
