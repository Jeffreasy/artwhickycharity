'use client'

import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WhiskySection } from '@/types/whisky-section'
import { supabase } from '@/lib/supabase'

interface WhiskyTekstProps {
  initialSections: WhiskySection[]
}

const renderText = (content: string, isTitle: boolean = false) => {
  return content.split(' ').map((word, index, array) => (
    <React.Fragment key={index}>
      <span 
        className={`
          inline-block
          animate-letter
          ${isTitle ? 'text-4xl sm:text-5xl md:text-6xl font-bold' : 'text-lg sm:text-xl'}
        `}
      >
        {word}
      </span>
      {index < array.length - 1 && (
        <span className="inline-block w-2 sm:w-2.5">&nbsp;</span>
      )}
    </React.Fragment>
  ))
}

export function WhiskyTekst({ initialSections }: WhiskyTekstProps) {
  const [sections, setSections] = useState<WhiskySection[]>(initialSections || [])
  const containerRef = useRef<HTMLDivElement>(null)
  const textRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  // Realtime updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('whisky_sections')
        .select('*')
        .order('order_number', { ascending: true })
      
      if (error) {
        console.error('Polling error:', error)
        return
      }
      
      if (data) {
        const newSections = data as WhiskySection[]
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

  const setTextRef = (el: HTMLElement | null, key: string) => {
    if (textRefs.current) {
      textRefs.current[key] = el
    }
  }

  return (
    <section ref={containerRef} className="min-h-screen bg-black text-white pt-[120px] pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {/* Title */}
        {sections
          .filter(section => section.style_type === 'title')
          .map(section => (
            <h1 
              key={section.id} 
              ref={(el) => setTextRef(el, section.section_key)}
              className="text-center mb-16"
            >
              {renderText(section.content, true)}
            </h1>
          ))}

        {/* Content */}
        <div className="max-w-3xl mx-auto space-y-8">
          {sections
            .filter(section => section.style_type === 'paragraph')
            .map(section => (
              <p 
                key={section.id} 
                ref={(el) => setTextRef(el, section.section_key)}
                className="leading-relaxed text-white/90 text-center"
              >
                {renderText(section.content)}
              </p>
            ))}

          {/* Links Section */}
          <div className="mt-12 text-center">
            {sections
              .filter(section => section.section_key === 'more_info_text')
              .map(section => (
                <p 
                  key={section.id} 
                  ref={(el) => setTextRef(el, section.section_key)}
                  className="text-lg sm:text-xl font-semibold mb-4"
                >
                  {renderText(section.content)}
                </p>
              ))}
            
            {sections
              .filter(section => section.style_type === 'link')
              .map(section => (
                <a 
                  key={section.id}
                  ref={(el) => setTextRef(el, section.section_key)}
                  href={`https://${section.content}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {renderText(section.content)}
                </a>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
