'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/utils/cn'
import { LanguagePhrase } from '@/types/language-bar'
import { supabase } from '@/lib/supabase'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { getLanguagePhrases } from '../../lib/language-bar'

interface LanguageBarProps {
  initialPhrases: LanguagePhrase[]
}

export function LanguageBar({ initialPhrases }: LanguageBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [phrases, setPhrases] = useState<LanguagePhrase[]>(initialPhrases)

  useEffect(() => {
    setPhrases(initialPhrases)

    const fetchFreshData = async () => {
      const { data, error } = await supabase
        .from('language_phrases')
        .select('*')
        .eq('is_active', true)
        .order('order_number', { ascending: true })

      if (error) {
        return
      }

      if (data) {
        setPhrases(data)
      }
    }

    const channel = supabase.channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'language_phrases',
        },
        async (payload) => {
          await fetchFreshData()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void fetchFreshData()
        }
      })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const screenWidth = window.innerWidth
    const repeats = Math.ceil((screenWidth * 2) / (screenWidth / phrases.length)) + 2
    const allPhrases = Array(repeats).fill(phrases).flat()
    
    track.innerHTML = ''
    allPhrases.forEach((phrase, index) => {
      const item = document.createElement('div')
      item.className = cn(
        "flex-shrink-0 px-6 font-bold text-white whitespace-nowrap",
        "drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]",
        "sm:text-base md:text-lg lg:text-xl",
        "sm:px-4 md:px-5 lg:px-6"
      )
      item.textContent = `${phrase.emoji} ${phrase.phrase}`
      item.setAttribute('lang', phrase.language_code)

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

    const startAnimation = () => {
      const trackWidth = track.scrollWidth
      const singleLoopWidth = trackWidth / repeats

      gsap.fromTo(track,
        { x: 0 },
        {
          x: -singleLoopWidth,
          duration: 20,
          ease: "none",
          repeat: -1,
          onRepeat: () => {
            gsap.set(track, { x: 0 })
          }
        }
      )
    }

    setTimeout(startAnimation, 500)

    return () => {
      gsap.killTweensOf(track)
    }
  }, [phrases])

  return (
    <section className="relative bg-black z-[998]">
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
    </section>
  )
} 