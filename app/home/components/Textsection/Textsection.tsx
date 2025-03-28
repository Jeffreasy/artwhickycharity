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
    
    return lines.map((line, lineIndex) => {
      // Als de lijn leeg is of alleen whitespace bevat, voeg een regelovergang toe
      if (!line.trim()) {
        return (
          <div 
            key={`line-${lineIndex}`} 
            className={`w-full ${
              styleType === 'main' || styleType === 'purpose'
                ? 'h-10 sm:h-12 md:h-16'
                : 'h-6 sm:h-8 md:h-10'
            }`}
          />
        )
      }
      
      // Split de lijn in woorden
      const words = line.split(' ')
      
      return (
        <div 
          key={`line-${lineIndex}`} 
          className={`
            flex flex-wrap 
            ${styleType === 'main' || styleType === 'purpose'
              ? 'mb-2 sm:mb-3 md:mb-5 leading-[1.15] sm:leading-[1.2] md:leading-[1.25]'
              : 'mb-1 sm:mb-2 md:mb-3 leading-[1.3] sm:leading-[1.4] md:leading-[1.5]'
            }
          `}
        >
          {words.map((word, wordIndex) => {
            // Skip lege woorden
            if (!word) return null
            
            // Check voor speciale karakters
            if (word === '-') {
              return (
                <span 
                  key={`word-${lineIndex}-${wordIndex}`}
                  className={`
                    text-gray-500 block w-full 
                    ${styleType === 'main' || styleType === 'purpose'
                      ? 'my-6 sm:my-7 md:my-8 h-[2px] sm:h-[3px] md:h-[4px]'
                      : 'my-4 sm:my-5 md:my-6 h-[1px] sm:h-[2px] md:h-[3px]'
                    }
                  `}
                >
                  <div className="w-full h-full bg-gray-500 opacity-40"></div>
                </span>
              )
            }
            
            // Regular word
            return (
              <React.Fragment key={`word-${lineIndex}-${wordIndex}`}>
                <span 
                  className={`
                    ${styleType}-word 
                    word-span
                    inline-flex 
                    items-center
                    ${styleType === 'main' || styleType === 'purpose'
                      ? 'text-white text-xl sm:text-2xl md:text-[2.75rem] font-bold'
                      : 'text-white/80 text-base sm:text-lg md:text-xl font-serif'
                    } 
                    tracking-wide
                    cursor-default
                  `}
                >
                  {word}
                </span>
                {/* Voeg spatie toe tussen woorden, maar niet na het laatste woord */}
                {wordIndex < words.length - 1 && (
                  <span 
                    className={`
                      inline-block
                      ${styleType === 'main' || styleType === 'purpose'
                        ? 'w-2 sm:w-2.5 md:w-3'
                        : 'w-1.5 sm:w-2 md:w-2.5'
                      }
                    `}
                    aria-hidden="true"
                  ></span>
                )}
              </React.Fragment>
            )
          })}
        </div>
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
                ${section.style_type === 'main' || section.style_type === 'purpose'
                  ? 'max-w-[300px] sm:max-w-md md:max-w-2xl mx-4 sm:ml-12 md:ml-24'
                  : 'max-w-[260px] sm:max-w-sm md:max-w-lg mx-4 sm:mr-12 md:mr-24 text-right'
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
