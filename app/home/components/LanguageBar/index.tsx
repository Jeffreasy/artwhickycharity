'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/utils/cn'

const phrases = [
  "🌏 让世界变得更美好",
  "🌎 Haz del mundo un lugar mejor",
  "🌍 Make the world a better place",
  "🌏 दुनिया को एक बेहतर जगह बनाओ",
  "🌍 اجعل العالم مكانًا أفضل",
  "🌏 পৃথিবীকে একটি আরও ভালো জায়গা কর",
  "🌎 Faça do mundo um lugar melhor",
  "🌍 Сделай мир лучше",
  "🌏 世界をより良い場所にしよう",
  "🌏 ਦੁਨਿਆ ਨੂੰ ਇੱਕ ਬਿਹਤਰ ਥਾਂ ਬਣਾਓ",
  "🌍 Fais du monde un endroit meilleur",
  "🌍 Mach die Welt zu einem besseren Ort",
  "🌍 Rendi il mondo un posto migliore",
  "🌍 Dünyayı daha iyi bir yer yap",
  "🌏 세상을 더 나은 곳으로 만들자",
  "🌏 Hãy làm cho thế giới trở nên tốt đẹp hơn",
  "🌍 Fanya dunia kuwa mahali pazuri zaidi",
  "🌍 دنیا را به جای بهتری تبدیل كن",
  "🌍 Maak de wereld een betere plek"
]

export function LanguageBar() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const initCarousel = () => {
      const screenWidth = window.innerWidth
      const repeats = Math.ceil((screenWidth * 3) / (screenWidth / phrases.length)) + 1
      const allPhrases = Array(repeats).fill(phrases).flat()
      
      // Update DOM met GSAP
      track.innerHTML = ''
      allPhrases.forEach((phrase, index) => {
        const item = document.createElement('div')
        item.className = cn(
          "flex-shrink-0 px-6 font-bold text-white whitespace-nowrap",
          "drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]",
          "sm:text-base md:text-lg lg:text-xl",
          "sm:px-4 md:px-5 lg:px-6"
        )
        item.textContent = phrase

        // Fade in animatie voor elk item
        gsap.fromTo(item, 
          { opacity: 0, y: 10 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.3,
            delay: index * 0.02,
            ease: "power2.out"
          }
        )

        // Hover effect
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

        track.appendChild(item)
      })

      // Calculate animation
      requestAnimationFrame(() => {
        const trackWidth = track.scrollWidth
        const singleLoopWidth = trackWidth / repeats
        
        // Smooth transition met GSAP
        gsap.set(track, {
          x: 0,
          onComplete: () => {
            gsap.to(track, {
              x: -singleLoopWidth,
              duration: singleLoopWidth / 100,
              ease: "none",
              repeat: -1
            })
          }
        })
      })
    }

    initCarousel()

    let resizeTimer: NodeJS.Timeout
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        // Fade out huidige items
        gsap.to(track.children, {
          opacity: 0,
          duration: 0.3,
          stagger: 0.02,
          onComplete: initCarousel
        })
      }, 250)
    })

    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', initCarousel)
      gsap.killTweensOf(track)
      gsap.killTweensOf(track.children)
    }
  }, [])

  return (
    <div className="relative w-full overflow-hidden">
      <div className="w-full overflow-hidden bg-transparent py-6 relative">
        <div 
          ref={trackRef}
          className="flex relative will-change-transform"
        />
      </div>
    </div>
  )
} 