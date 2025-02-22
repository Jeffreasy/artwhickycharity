'use client'

import React, { useEffect, useRef, useState } from 'react'
import { HiOutlineMail } from 'react-icons/hi'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AboutSection } from '@/types/about-section'
import { motion } from 'framer-motion'

interface AboutTekstProps {
  initialSections: AboutSection[]
}

const renderText = (content: string, isTitle: boolean = false) => {
  // Split into words instead of characters
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
      {/* Add space between words, except for the last word */}
      {index < array.length - 1 && (
        <span className="inline-block w-2 sm:w-2.5">&nbsp;</span>
      )}
    </React.Fragment>
  ))
}

export function AboutTekst({ initialSections }: AboutTekstProps) {
  const [sections, setSections] = useState<AboutSection[]>(initialSections)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  const setTextRef = (el: HTMLElement | null, key: string) => {
    if (textRefs.current) {
      textRefs.current[key] = el
    }
  }

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/about-content')
        const data = await response.json()
        if (Array.isArray(data)) {
          setSections(data)
        }
      } catch (error) {
        console.error('Failed to load content:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadContent()
  }, [])

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

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 h-[400px] w-full" />
  }

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white pt-[120px] pb-24"
    >
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

          {/* Contact */}
          <div className="mt-16 text-center">
            {sections
              .filter(section => section.style_type === 'email')
              .map(section => (
                <Link 
                  key={section.id}
                  href={`mailto:${section.content}`}
                  className="inline-flex items-center justify-center gap-2 text-xl hover:text-blue-400 transition-colors"
                >
                  <span>{section.content}</span>
                  <HiOutlineMail className="w-6 h-6" />
                </Link>
              ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
