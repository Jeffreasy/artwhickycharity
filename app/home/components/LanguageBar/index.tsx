'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/utils/cn'
import { LanguagePhrase } from '@/types/language-bar'
import { supabase } from '@/lib/supabase'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface LanguageBarProps {
  initialPhrases: LanguagePhrase[]
}

export function LanguageBar({ initialPhrases }: LanguageBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [phrases, setPhrases] = useState<LanguagePhrase[]>(initialPhrases)

  // Debug log voor initial render
  useEffect(() => {
    console.log('LanguageBar mounted with phrases:', initialPhrases)
  }, [initialPhrases])

  // Realtime subscription setup
  useEffect(() => {
    console.log('Setting up realtime subscription...')

    const handleDatabaseChange = async () => {
      console.log('Fetching fresh data...')
      const { data, error } = await supabase
        .from('language_phrases')
        .select('*')
        .eq('is_active', true)
        .order('order_number', { ascending: true })

      if (error) {
        console.error('Error fetching updated data:', error)
        return
      }

      if (data) {
        console.log('Received fresh data:', data)
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
        async (payload: RealtimePostgresChangesPayload<LanguagePhrase>) => {
          console.log('Change detected:', payload)
          await handleDatabaseChange()
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          // Haal direct verse data op bij succesvolle subscription
          void handleDatabaseChange()
        }
      })

    return () => {
      console.log('Cleaning up subscription')
      channel.unsubscribe()
    }
  }, []) // Empty dependency array

  // Aparte useEffect voor carousel initialisatie
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    console.log('Initializing carousel with phrases:', phrases)
    
    const screenWidth = window.innerWidth
    const repeats = Math.ceil((screenWidth * 3) / (screenWidth / phrases.length)) + 1
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

    requestAnimationFrame(() => {
      const trackWidth = track.scrollWidth
      const singleLoopWidth = trackWidth / repeats
      
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
  }, [phrases]) // Deze useEffect reageert op phrases wijzigingen

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