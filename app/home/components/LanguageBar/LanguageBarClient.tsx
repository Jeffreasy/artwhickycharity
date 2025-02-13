'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/utils/cn'
import { LanguagePhrase } from '@/types/language-bar'
import { useLanguageBar } from './useLanguageBar' // We maken een custom hook
import { useMenu } from '@/contexts/MenuContext' // Import MenuContext

interface LanguageBarProps {
  initialPhrases: LanguagePhrase[]
}

export function LanguageBarClient({ initialPhrases }: LanguageBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const { phrases } = useLanguageBar(initialPhrases)
  const { isMenuOpen } = useMenu() // Get menu state

  // Setup animaties
  useEffect(() => {
    const track = trackRef.current
    if (!track || !phrases.length) return

    // Cleanup vorige animaties
    gsap.killTweensOf(track)
    track.innerHTML = ''

    // Setup nieuwe items
    const setupItems = () => {
      const screenWidth = window.innerWidth
      const repeats = Math.ceil((screenWidth * 2) / (screenWidth / phrases.length)) + 2
      const allPhrases = Array(repeats).fill(phrases).flat()

      return allPhrases.map((phrase, index) => {
        const item = document.createElement('div')
        item.className = cn(
          "flex-shrink-0 px-6 font-bold text-white whitespace-nowrap",
          "drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]",
          "sm:text-base md:text-lg lg:text-xl",
          "sm:px-4 md:px-5 lg:px-6"
        )
        item.textContent = `${phrase.emoji} ${phrase.phrase}`
        item.setAttribute('lang', phrase.language_code)
        track.appendChild(item)
        return item
      })
    }

    const items = setupItems()
    const trackWidth = track.scrollWidth
    const singleLoopWidth = trackWidth / (trackWidth / window.innerWidth)

    // Animatie timeline
    const tl = gsap.timeline()

    // Fade in animatie
    tl.fromTo(items, 
      { opacity: 0, y: 10 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.3,
        stagger: 0.02,
        ease: "power2.out"
      }
    )

    // Scroll animatie setup
    const handleRepeat = () => {
      gsap.set(track, { x: 0 })
    }

    gsap.to(track, {
      x: -singleLoopWidth,
      duration: 20,
      ease: "none",
      repeat: -1,
      onRepeat: handleRepeat
    })

    // Hover effecten
    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        gsap.to(item, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        })
      })

      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          scale: 1,
          duration: 0.3,
          ease: "power2.in"
        })
      })
    })

    // Cleanup
    return () => {
      gsap.killTweensOf([track, ...items])
    }
  }, [phrases])

  return (
    <div 
      className={cn(
        "fixed top-[80px] sm:top-[100px] md:top-[120px] left-0 right-0 bg-black z-[998]",
        "transition-opacity duration-300",
        isMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="container mx-auto">
        <div className="border-t border-white/10">
          <div className="overflow-hidden">
            <div 
              ref={trackRef}
              className="flex relative will-change-transform py-4 sm:py-5 md:py-6"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 