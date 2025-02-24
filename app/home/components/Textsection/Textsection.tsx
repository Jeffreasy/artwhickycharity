'use client'

import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '@/lib/supabase'
import { TextSection as TextSectionType } from '@/types/text-section'
import { cn } from '@/lib/utils'

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
      rotateX: 20
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
        duration: 1,
        stagger: 0.05, // Verhoogd voor betere leesbaarheid tussen woorden
        ease: "power3.out",
        delay,
        scrollTrigger: {
          trigger: container,
          start: "top 60%",
          end: "bottom 80%",
        }
      })
    }

    const addWordHoverEffects = (element: HTMLDivElement, isLargeText: boolean) => {
      const words = element.querySelectorAll('span.word-wrapper')
      
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
      animateTextIn(words.impact, 0.3),
      animateTextIn(words.purpose, 0.6),
      animateTextIn(words.sip, 0.9)
    ]

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

  // Helper functie om tekst in woorden te splitsen
  const splitIntoWords = (text: string) => {
    return text.split(/(\s+)/).map(part => {
      if (part.trim() === '') return part // Return spaces as-is
      return part // Return words
    })
  }

  return (
    <section ref={containerRef} className="min-h-screen bg-black relative py-12 sm:py-16 md:py-24">
      <div className="container mx-auto relative px-4 sm:px-6 md:px-8" style={{ opacity: isAnimationInitialized ? 1 : 0 }}>
        {sections?.map((section) => (
          <div 
            key={section.id}
            className={`mb-16 sm:mb-24 md:mb-32 ${
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
                  ? 'max-w-[600px] sm:max-w-2xl md:max-w-3xl mx-4 sm:ml-12 md:ml-24'
                  : 'max-w-[500px] sm:max-w-xl md:max-w-2xl mx-4 sm:mr-12 md:mr-24 text-right'
                } 
                cursor-default 
                whitespace-pre-wrap
                break-words 
              `}
            >
              {splitIntoWords(section.content).map((word, index) => (
                <span 
                  key={index}
                  className={cn(
                    "word-wrapper inline-block",
                    word.trim() === '' ? 'whitespace-pre' : `${section.style_type}-word`,
                    section.style_type === 'main' || section.style_type === 'purpose'
                      ? 'text-white text-xl sm:text-2xl md:text-[2.75rem] font-bold'
                      : 'text-white/80 text-base sm:text-lg md:text-xl font-serif',
                    'tracking-wide'
                  )}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
