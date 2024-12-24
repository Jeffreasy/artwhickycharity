'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function TextSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mainTextRef = useRef<HTMLDivElement>(null)
  const impactTextRef = useRef<HTMLDivElement>(null)
  const purposeTextRef = useRef<HTMLDivElement>(null)
  const sipTextRef = useRef<HTMLDivElement>(null)

  const mainText = `Raise a glass, Make a Difference:
Uniting fine whisky,
impactful art,
and meaningful change
--
all for charity.`

  const impactText = "A Limited Edition, Unlimited Impact: Experience the harmony of whisky craftsmanship and artistic expression, with every bottle supporting a worthy cause."

  const purposeText = "Where Whisky Meets Purpose: Exceptional spirits, exclusive art, and a commitment to charity, brought together in one bottle."

  const sipText = "Sip for Good, Collect for Change: Discover a unique blend of whisky and art dedicated to making a positive impact worldwide."

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
      main: mainTextRef.current,
      impact: impactTextRef.current,
      purpose: purposeTextRef.current,
      sip: sipTextRef.current
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
  }, [])

  return (
    <section ref={containerRef} className="min-h-screen bg-black relative py-24">
      <div className="container mx-auto relative">
        {/* Hoofdtekst links */}
        <div className="mb-32">
          <div 
            ref={mainTextRef} 
            className="max-w-xl ml-24 cursor-default"
          >
            {mainText.split('').map((char, index) => (
              <span 
                key={index} 
                className={`main-letter inline-block text-white text-[2.75rem] font-bold tracking-wide
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

        {/* Impact tekst rechts */}
        <div className="flex justify-end mb-32">
          <div 
            ref={impactTextRef} 
            className="max-w-md mr-24 text-right cursor-default"
          >
            {impactText.split('').map((char, index) => (
              <span 
                key={index} 
                className={`impact-letter inline-block text-white/80 text-xl font-serif tracking-wide leading-relaxed
                  ${char === ' ' ? 'w-2.5' : ''}
                `}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Purpose tekst links */}
        <div className="mb-32">
          <div 
            ref={purposeTextRef} 
            className="max-w-xl ml-24 cursor-default"
          >
            {purposeText.split('').map((char, index) => (
              <span 
                key={index} 
                className={`purpose-letter inline-block text-white text-[2.75rem] font-bold tracking-wide
                  ${char === ' ' ? 'w-3' : ''}
                  ${char === ':' ? 'block h-6' : ''}
                `}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Sip tekst rechts */}
        <div className="flex justify-end mb-24">
          <div 
            ref={sipTextRef} 
            className="max-w-md mr-24 text-right cursor-default"
          >
            {sipText.split('').map((char, index) => (
              <span 
                key={index} 
                className={`sip-letter inline-block text-white/80 text-xl font-serif tracking-wide leading-relaxed
                  ${char === ' ' ? 'w-2.5' : ''}
                `}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
