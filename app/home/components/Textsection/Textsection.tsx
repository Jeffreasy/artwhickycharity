'use client'

import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '@/lib/supabase'
import { TextSection as TextSectionType } from '@/types/text-section'

interface TextSectionProps {
  initialSections: TextSectionType[]
}

export function TextSection({ initialSections }: TextSectionProps) {
  const [sections, setSections] = useState<TextSectionType[]>(initialSections || [])
  const [isAnimationInitialized, setIsAnimationInitialized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Realtime updates via Supabase
  useEffect(() => {
    const channel = supabase
      .channel('text_sections_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'text_sections'
      }, async (payload) => {
        const { data, error } = await supabase
          .from('text_sections')
          .select('*')
          .order('order_number', { ascending: true })

        if (error) {
          console.error('Error fetching updated sections:', error)
          return
        }

        if (data) {
          setSections(data as TextSectionType[])
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  // GSAP setup en initiële animatie
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    
    // Zet alle woorden eerst op opacity 0
    gsap.set(['.main-word', '.impact-word', '.purpose-word', '.sip-word'], {
      opacity: 0,
      y: 15,
      rotateX: 10
    })

    setIsAnimationInitialized(true)

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  // Scroll en hover animaties
  useEffect(() => {
    if (!isAnimationInitialized) return

    const container = containerRef.current
    if (!container) return

    const animateTextIn = (elements: NodeListOf<Element>, delay: number = 0) => {
      return gsap.to(elements, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.03,
        ease: "power3.out",
        delay,
        scrollTrigger: {
          trigger: container,
          start: "top 60%",
          end: "bottom 80%",
        }
      })
    }

    // Woord hover effecten
    const addWordHoverEffects = (element: HTMLDivElement, isLargeText: boolean) => {
      const words = element.querySelectorAll('span.word-span')
      
      words.forEach((word) => {
        word.addEventListener('mouseenter', () => {
          gsap.to(word, {
            scale: isLargeText ? 1.05 : 1.08,
            textShadow: isLargeText 
              ? '0 0 15px rgba(255,255,255,0.3)'
              : '0 0 8px rgba(255,255,255,0.2)',
            duration: 0.2,
            ease: "power2.out"
          })
        })

        word.addEventListener('mouseleave', () => {
          gsap.to(word, {
            scale: 1,
            textShadow: 'none',
            duration: 0.2,
            ease: "power2.inOut"
          })
        })
      })
    }

    const words = {
      main: container.querySelectorAll('.main-word'),
      impact: container.querySelectorAll('.impact-word'),
      purpose: container.querySelectorAll('.purpose-word'),
      sip: container.querySelectorAll('.sip-word')
    }

    const animations = [
      animateTextIn(words.main, 0),
      animateTextIn(words.impact, 0.2),
      animateTextIn(words.purpose, 0.4),
      animateTextIn(words.sip, 0.6)
    ]

    // Hover effecten
    const elements = {
      main: textRefs.current['main_text'],
      impact: textRefs.current['impact_text'],
      purpose: textRefs.current['purpose_text'],
      sip: textRefs.current['sip_text']
    }

    if (elements.main) addWordHoverEffects(elements.main, true)
    if (elements.impact) addWordHoverEffects(elements.impact, false)
    if (elements.purpose) addWordHoverEffects(elements.purpose, true)
    if (elements.sip) addWordHoverEffects(elements.sip, false)

    return () => {
      animations.forEach(anim => anim.kill())
    }
  }, [sections, isAnimationInitialized])

  // Helper om tekst op te splitsen in woorden met behoud van formatting
  const processContent = (content: string, styleType: string) => {
    // Split de content op newlines
    const lines = content.split('\n')
    
    // Bepaal de basis lettertypes voor dit type
    const textClasses = styleType === 'main' || styleType === 'purpose'
      ? 'text-white text-xl sm:text-2xl md:text-[2.75rem] font-bold'
      : 'text-white/80 text-base sm:text-lg md:text-xl font-serif'
    
    return lines.map((line, lineIndex) => {
      // Als de lijn leeg is of alleen whitespace bevat, voeg een regelovergang toe
      if (!line.trim()) {
        return (
          <div 
            key={`line-${lineIndex}`} 
            className={`w-full ${
              styleType === 'main' || styleType === 'purpose'
                ? 'h-8 sm:h-10 md:h-14'
                : 'h-5 sm:h-7 md:h-9'
            }`}
          />
        )
      }
      
      // Markeer de volledige regel als een paragraaf
      return (
        <p 
          key={`line-${lineIndex}`} 
          className={`
            mb-2 sm:mb-3 md:mb-4
            ${textClasses}
            ${styleType === 'impact' || styleType === 'sip' ? 'text-right' : ''}
            tracking-wide
          `}
          style={{
            lineHeight: styleType === 'main' || styleType === 'purpose' ? 1.2 : 1.4,
            wordSpacing: styleType === 'main' || styleType === 'purpose' ? '0.05em' : '0.03em',
          }}
        >
          {line === '-' ? (
            <span 
              className={`
                block w-full 
                ${styleType === 'main' || styleType === 'purpose'
                  ? 'my-5 sm:my-6 md:my-8'
                  : 'my-3 sm:my-4 md:my-6'
                }
              `}
            >
              <hr className="border-gray-500 opacity-30" />
            </span>
          ) : (
            line.split(' ').map((word, wordIndex, arr) => (
              <span 
                key={`word-${lineIndex}-${wordIndex}`}
                className={`
                  ${styleType}-word 
                  word-span
                  inline-block
                  cursor-default
                  whitespace-normal
                `}
              >
                {word}
                {wordIndex < arr.length - 1 && (
                  <span 
                    className="inline-block" 
                    aria-hidden="true"
                    style={{ width: '0.25em' }}
                  >&nbsp;</span>
                )}
              </span>
            ))
          )}
        </p>
      )
    })
  }

  return (
    <section ref={containerRef} className="min-h-screen bg-black relative py-12 sm:py-16 md:py-24">
      <div className="container mx-auto relative px-4 sm:px-6 md:px-8" style={{ opacity: isAnimationInitialized ? 1 : 0 }}>
        {sections?.map((section) => (
          <div 
            key={section.id}
            className={`mb-24 sm:mb-32 md:mb-40 ${
              section.style_type === 'impact' || section.style_type === 'sip' 
                ? 'flex justify-end' 
                : ''
            }`}
          >
            <div 
              ref={(el: HTMLDivElement | null) => {
                textRefs.current[section.section_key] = el
              }}
              className={`
                overflow-hidden whitespace-normal
                ${section.style_type === 'main' || section.style_type === 'purpose'
                  ? 'w-full max-w-[300px] sm:max-w-[420px] md:max-w-[600px] mx-4 sm:ml-12 md:ml-24'
                  : 'w-full max-w-[260px] sm:max-w-[340px] md:max-w-[480px] mx-4 sm:mr-12 md:mr-24'
                }
              `}
            >
              {processContent(section.content, section.style_type)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
