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
  const containerRef = useRef<HTMLDivElement>(null)
  const textRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Realtime updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('text_sections')
        .select('*')
        .order('order_number', { ascending: true })
      
      if (error) {
        console.error('Polling error:', error)
        return
      }
      
      if (data) {
        const newSections = data as TextSectionType[]
        if (JSON.stringify(newSections) !== JSON.stringify(sections)) {
          setSections(newSections)
        }
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [sections])

  // GSAP animaties (rest van je bestaande animatie code)
  useEffect(() => {
    // Registreer ScrollTrigger alleen aan de client-side
    gsap.registerPlugin(ScrollTrigger)
    
    const container = containerRef.current
    if (!container) return

    // Verfijnde scroll animaties
    const animateTextIn = (elements: NodeListOf<Element>, delay: number = 0) => {
      gsap.set(elements, { 
        opacity: 0,
        y: 15,
        rotateX: 20
      })

      gsap.to(elements, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1,
        stagger: 0.01,
        ease: "power3.out",
        delay,
        scrollTrigger: {
          trigger: container,
          start: "top 60%",
          end: "bottom 80%",
        }
      })
    }

    // Nog verfijndere hover effecten per letter
    const addLetterHoverEffects = (element: HTMLDivElement, isLargeText: boolean) => {
      const letters = element.querySelectorAll('span')
      
      letters.forEach((letter) => {
        letter.addEventListener('mouseenter', () => {
          gsap.to(letter, {
            scale: isLargeText ? 1.05 : 1.08,
            textShadow: isLargeText 
              ? '0 0 15px rgba(255,255,255,0.3)'
              : '0 0 8px rgba(255,255,255,0.2)',
            duration: 0.2,
            ease: "power2.out"
          })

          // Subtiel effect op direct aangrenzende letters
          const prev = letter.previousElementSibling
          const next = letter.nextElementSibling
          
          if (prev) {
            gsap.to(prev, {
              scale: isLargeText ? 1.02 : 1.04,
              textShadow: isLargeText 
                ? '0 0 10px rgba(255,255,255,0.15)'
                : '0 0 5px rgba(255,255,255,0.1)',
              duration: 0.2
            })
          }
          
          if (next) {
            gsap.to(next, {
              scale: isLargeText ? 1.02 : 1.04,
              textShadow: isLargeText 
                ? '0 0 10px rgba(255,255,255,0.15)'
                : '0 0 5px rgba(255,255,255,0.1)',
              duration: 0.2
            })
          }
        })

        letter.addEventListener('mouseleave', () => {
          gsap.to(letter, {
            scale: 1,
            textShadow: 'none',
            duration: 0.2,
            ease: "power2.inOut"
          })

          const prev = letter.previousElementSibling
          const next = letter.nextElementSibling
          
          if (prev) {
            gsap.to(prev, {
              scale: 1,
              textShadow: 'none',
              duration: 0.15
            })
          }
          
          if (next) {
            gsap.to(next, {
              scale: 1,
              textShadow: 'none',
              duration: 0.15
            })
          }
        })
      })
    }

    // Toepassen van alle animaties
    const letters = {
      main: container.querySelectorAll('.main-letter'),
      impact: container.querySelectorAll('.impact-letter'),
      purpose: container.querySelectorAll('.purpose-letter'),
      sip: container.querySelectorAll('.sip-letter')
    }

    // Scroll animaties met verschillende delays
    animateTextIn(letters.main, 0)
    animateTextIn(letters.impact, 0.3)
    animateTextIn(letters.purpose, 0.6)
    animateTextIn(letters.sip, 0.9)

    // Hover effecten
    const elements = {
      main: textRefs.current['main_text'],
      impact: textRefs.current['impact_text'],
      purpose: textRefs.current['purpose_text'],
      sip: textRefs.current['sip_text']
    }

    if (elements.main) addLetterHoverEffects(elements.main, true)
    if (elements.impact) addLetterHoverEffects(elements.impact, false)
    if (elements.purpose) addLetterHoverEffects(elements.purpose, true)
    if (elements.sip) addLetterHoverEffects(elements.sip, false)

    // Cleanup
    return () => {
      // Cleanup ScrollTrigger bij unmount
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      Object.values(letters).forEach(letterGroup => {
        letterGroup.forEach(letter => {
          gsap.killTweensOf(letter)
          gsap.set(letter, { clearProps: "all" })
        })
      })
    }
  }, [sections])

  return (
    <section ref={containerRef} className="min-h-screen bg-black relative py-24">
      <div className="container mx-auto relative">
        {sections?.map((section) => (
          <div 
            key={section.id}
            className={`mb-32 ${
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
                  ? 'max-w-xl ml-24'
                  : 'max-w-md mr-24 text-right'
                } cursor-default
              `}
            >
              {section.content.split('').map((char, index) => (
                <span 
                  key={index} 
                  className={`
                    ${section.style_type}-letter 
                    inline-block 
                    ${section.style_type === 'main' || section.style_type === 'purpose'
                      ? 'text-white text-[2.75rem] font-bold'
                      : 'text-white/80 text-xl font-serif'
                    } 
                    tracking-wide
                    ${char === '\n' ? 'block h-10' : ''}
                    ${char === ' ' ? 'w-3' : ''}
                    ${char === '-' ? 'text-gray-500 block h-6' : ''}
                    ${char === ':' ? 'block h-6' : ''}
                  `}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
