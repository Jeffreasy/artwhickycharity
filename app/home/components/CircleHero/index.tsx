'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { cn } from '@/utils/cn'
import { CircleHeroImage, CircleHeroWord } from '@/types/circle-hero'
import { supabase } from '@/lib/supabase'
import { CloudinaryImage } from '@/globalComponents/ui/CloudinaryImage'

// Registreer GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(TextPlugin)
}

const defaultImages: CircleHeroImage[] = [
  {
    id: 'rotating-art',
    cloudinary_id: '673effe1014d200884a17816_2-minTEST_y71lxe',
    alt: 'Art',
    url: '/art',
    order: 0
  },
  {
    id: 'rotating-whisky',
    cloudinary_id: '673efda82a5312b08ffd8f3c_Fles.Doos_ps066d',
    alt: 'Whisky',
    url: '/whisky',
    order: 1
  },
  {
    id: 'rotating-charity',
    cloudinary_id: '67193123a81afd0f845b81b6_charity_uvkgyg',
    alt: 'Charity',
    url: '/charity',
    order: 2
  }
]

const defaultWords: CircleHeroWord[] = [
  {
    id: 'rotating-art',
    word: 'Art',
    order: 0
  },
  {
    id: 'rotating-whisky',
    word: 'Whisky',
    order: 1
  },
  {
    id: 'rotating-charity',
    word: 'Charity',
    order: 2
  }
]

interface CircleHeroProps {
  images?: CircleHeroImage[]
  words?: CircleHeroWord[]
}

export function CircleHero({ images = defaultImages, words = defaultWords }: CircleHeroProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const lettersRef = useRef<HTMLSpanElement[]>([])
  const imageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const currentIndexRef = useRef(0)

  // State voor real-time updates
  const [currentImages, setCurrentImages] = useState(images)
  const [currentWords, setCurrentWords] = useState(words)

  // Debug logging
  useEffect(() => {
    console.log('Current words changed:', currentWords)
  }, [currentWords])

  // Functie om tekst te updaten met animatie
  const updateTextWithAnimation = (newWord: string) => {
    const textElement = textRef.current
    if (!textElement) return

    // Eerst verwijder bestaande letters met animatie
    gsap.to(lettersRef.current, {
      opacity: 0,
      y: -20,
      stagger: 0.02,
      duration: 0.3,
      onComplete: () => {
        // Dan update de tekst en wrap letters
        textElement.textContent = newWord
        wrapLetters(textElement)
        
        // Animate nieuwe letters in
        gsap.from(lettersRef.current, {
          opacity: 0,
          y: 20,
          stagger: 0.02,
          duration: 0.3
        })
      }
    })
  }

  // Functie om afbeelding te updaten met animatie
  const updateImageWithAnimation = (oldImage: HTMLDivElement, newImage: HTMLDivElement) => {
    gsap.to(oldImage, { 
      duration: 0.5, 
      opacity: 0,
      onComplete: () => {
        gsap.to(newImage, { 
          duration: 0.5, 
          opacity: 1 
        })
      }
    })
  }

  // Update de Supabase subscription om de animatie te gebruiken
  useEffect(() => {
    console.log('Setting up Supabase subscriptions...')

    const fetchInitialData = async () => {
      const [{ data: wordsData }, { data: imagesData }] = await Promise.all([
        supabase.from('circle_hero_words').select('*').order('order_number'),
        supabase.from('circle_hero_images').select('*').order('order_number')
      ])
      
      if (wordsData) {
        const newWords = wordsData.map(word => ({
          id: word.id,
          word: word.word,
          order: word.order_number
        }))
        setCurrentWords(newWords)
        updateTextWithAnimation(newWords[currentIndexRef.current].word)
      }
      
      if (imagesData) {
        const newImages = imagesData.map(img => ({
          id: img.id,
          cloudinary_id: img.cloudinary_id,
          alt: img.alt,
          url: img.url,
          order: img.order_number
        }))
        setCurrentImages(newImages)
        
        const currentImage = imageRefs.current.get(newImages[currentIndexRef.current].id)
        if (currentImage) {
          gsap.to(currentImage, { duration: 0.5, opacity: 1 })
        }
      }
    }

    fetchInitialData()

    const channel = supabase.channel('any')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'circle_hero_words' },
        async (payload) => {
          console.log('Words change detected:', payload)
          const { data, error } = await supabase
            .from('circle_hero_words')
            .select('*')
            .order('order_number')
          
          if (data) {
            const newWords = data.map(word => ({
              id: word.id,
              word: word.word,
              order: word.order_number
            }))
            setCurrentWords(newWords)
            updateTextWithAnimation(newWords[currentIndexRef.current].word)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'circle_hero_images' },
        async (payload) => {
          console.log('Images change detected:', payload)
          const { data, error } = await supabase
            .from('circle_hero_images')
            .select('*')
            .order('order_number')
          
          if (data) {
            const newImages = data.map(img => ({
              id: img.id,
              cloudinary_id: img.cloudinary_id,
              alt: img.alt,
              url: img.url,
              order: img.order_number
            }))

            // Haal huidige en nieuwe afbeelding op
            const currentImage = imageRefs.current.get(currentImages[currentIndexRef.current].id)
            const newImage = imageRefs.current.get(newImages[currentIndexRef.current].id)

            // Update state
            setCurrentImages(newImages)

            // Animeer de overgang als beide afbeeldingen bestaan
            if (currentImage && newImage && currentImage !== newImage) {
              updateImageWithAnimation(currentImage, newImage)
            }
          }
        }
      )

    channel.subscribe(async (status) => {
      console.log(`Subscription status: ${status}`)
      if (status === 'SUBSCRIBED') {
        console.log('Testing subscription...')
        // Test de subscription door een dummy update te doen
        const { error } = await supabase
          .from('circle_hero_words')
          .update({ word: currentWords[0].word })
          .eq('id', currentWords[0].id)
        
        if (error) console.error('Test update failed:', error)
        else console.log('Test update succeeded')
      }
    })

    return () => {
      console.log('Cleaning up subscription...')
      channel.unsubscribe()
    }
  }, []) // Empty dependency array

  const wrapLetters = (element: HTMLElement) => {
    const text = element.textContent || ''
    element.innerHTML = text.split('').map((char) => 
      `<span class="letter" style="display: inline-block">${char}</span>`
    ).join('')
    
    lettersRef.current = Array.from(element.getElementsByClassName('letter')) as HTMLSpanElement[]
  }

  useEffect(() => {
    let lastTap = 0

    const scrambleText = (element: HTMLElement, newText: string) => {
      // Eerst verwijder bestaande letters
      gsap.to(lettersRef.current, {
        opacity: 0,
        y: -20,
        stagger: 0.02,
        duration: 0.3,
        onComplete: () => {
          // Dan update de tekst en wrap letters
          element.textContent = newText
          wrapLetters(element)
          
          // Animate nieuwe letters in
          gsap.from(lettersRef.current, {
            opacity: 0,
            y: 20,
            stagger: 0.02,
            duration: 0.3
          })
        }
      })
    }

    const rotateContent = () => {
      const currentImage = imageRefs.current.get(currentImages[currentIndexRef.current].id)
      const nextIndex = (currentIndexRef.current + 1) % currentImages.length
      const nextImage = imageRefs.current.get(currentImages[nextIndex].id)

      if (currentImage && nextImage) {
        gsap.to(currentImage, { duration: 0.5, opacity: 0 })
        gsap.to(nextImage, { duration: 0.5, opacity: 1, delay: 0.5 })
      }

      currentIndexRef.current = nextIndex

      const text = textRef.current
      if (text) {
        scrambleText(text, currentWords[currentIndexRef.current].word)
      }
    }

    const handleDoubleTap = () => {
      window.location.href = currentImages[currentIndexRef.current].url
    }

    const wrapper = wrapperRef.current
    if (wrapper) {
      wrapper.addEventListener('click', (e) => {
        const now = new Date().getTime()
        const timeSince = now - lastTap
        if (timeSince < 300 && timeSince > 0) {
          handleDoubleTap()
        }
        lastTap = now
      })

      // Enhanced hover effect
      gsap.set(wrapper, { scale: 1, boxShadow: 'none' })

      wrapper.addEventListener('mouseenter', () => {
        gsap.to(wrapper, { 
          duration: 0.3, 
          scale: 1.05, 
          boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
          ease: "power2.out" 
        })
      })

      wrapper.addEventListener('mouseleave', () => {
        gsap.to(wrapper, { 
          duration: 0.3, 
          scale: 1, 
          boxShadow: 'none',
          ease: "power2.in" 
        })
      })
    }

    // Start rotation animation
    const rotationInterval = gsap.to({}, {
      duration: 3,
      repeat: -1,
      onRepeat: rotateContent
    })

    // Initialize text wrapping
    const textElement = textRef.current
    if (textElement) {
      wrapLetters(textElement)
      
      // Per-letter hover effect
      textElement.addEventListener('mouseenter', () => {
        gsap.to(lettersRef.current, {
          color: '#0375ff',
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out"
        })
      })

      textElement.addEventListener('mouseleave', () => {
        gsap.to(lettersRef.current, {
          color: 'white',
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.in"
        })
      })
    }

    // Cleanup
    return () => {
      rotationInterval.kill()
      if (wrapper) {
        wrapper.removeEventListener('click', handleDoubleTap)
        wrapper.removeEventListener('mouseenter', () => {})
        wrapper.removeEventListener('mouseleave', () => {})
      }
      if (textElement) {
        textElement.removeEventListener('mouseenter', () => {})
        textElement.removeEventListener('mouseleave', () => {})
      }
    }
  }, [currentImages, currentWords])

  return (
    <div className="w-full max-w-[500px] mx-auto relative pt-16">
      <div className="relative w-full pb-[100%]">
        <div 
          ref={wrapperRef}
          className={cn(
            "absolute inset-0 overflow-hidden rounded-full",
            "border-4 border-[rgba(255,0,0,0.8)] cursor-pointer",
            "shadow-[0_0_60px_0px_rgba(255,0,0,0.5)]",
            "animate-hueGlow"
          )}
        >
          {currentImages.map((img, index) => (
            <div
              key={img.id}
              ref={(el) => {
                if (el) {
                  imageRefs.current.set(img.id, el)
                } else {
                  imageRefs.current.delete(img.id)
                }
              }}
              className={cn(
                "absolute inset-0",
                "opacity-0 transition-opacity duration-500",
                { "opacity-100": index === 0 }
              )}
            >
              {img.cloudinary_id && (
                <CloudinaryImage
                  publicId={img.cloudinary_id}
                  alt={img.alt}
                  className="w-full h-full"
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mt-5">
        <div 
          ref={textRef}
          className={cn(
            "inline-block text-[64px] font-bold uppercase tracking-[2px]",
            "text-white cursor-pointer",
            "animate-textGlow",
            "md:text-[48px] sm:text-[36px]"
          )}
        >
          {currentWords[0].word}
        </div>
      </div>
    </div>
  )
} 