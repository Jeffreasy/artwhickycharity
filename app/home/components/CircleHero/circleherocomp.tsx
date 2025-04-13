'use client'

import React, { useEffect, useState, useRef } from 'react'
import { cn } from '@/utils/cn'
import { CircleHeroItem } from '@/types/circle-hero'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export function CircleHero({ initialItems }: { initialItems: CircleHeroItem[] }) {
  const [items, setItems] = useState<CircleHeroItem[]>(initialItems || [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const rotationTimeoutRef = useRef<NodeJS.Timeout>()

  const fetchItems = async () => {
    const { data } = await supabase
      .from('circle_hero_items')
      .select('*')
      .eq('is_active', true)
      .order('order_number', { ascending: true })
    
    if (data) {
      setItems(data)
    }
  }

  const rotateToNext = () => {
    setCurrentIndex(nextIndex)
    setNextIndex((nextIndex + 1) % items.length)
  }

  useEffect(() => {
    void fetchItems()
    const channel = supabase
      .channel('circle_hero_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circle_hero_items',
        },
        async (payload) => {
          await fetchItems()
        }
      )
      .subscribe((status) => {
      })

    return () => {
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current)
      }
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, []) // Leeg dependency array

  useEffect(() => {
    if (items.length > 1) {
      rotationTimeoutRef.current = setTimeout(rotateToNext, 3000)
    }
    return () => {
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current)
      }
    }
  }, [currentIndex, items.length])

  if (!items?.length) return null

  return (
    <section className="w-full pt-32 relative z-10">
      <div className="relative w-full max-w-[500px] mx-auto">
        <div className="pb-[100%]" />
        
        <div className="absolute inset-0">
          <Link 
            href={items[currentIndex]?.url || '#'}
            className={cn(
              "block relative w-full h-full overflow-hidden rounded-full",
              "border-4 border-white/20 cursor-pointer",
              "animate-hueGlow",
              "hover:scale-105 transition-transform duration-300"
            )}
          >
            <div 
              key={items[currentIndex].id}
              className="absolute inset-0 rounded-full overflow-hidden"
            >
              <Image
                src={items[currentIndex].image_src}
                alt={items[currentIndex].image_alt}
                fill
                className="object-cover rounded-full"
                priority
                sizes="(max-width: 500px) 100vw, 500px"
              />
            </div>
            {/* Preload next image */}
            <div className="hidden">
              {items[nextIndex] && (
                <Image
                  src={items[nextIndex].image_src}
                  alt={items[nextIndex].image_alt}
                  width={1}
                  height={1}
                  priority
                />
              )}
            </div>
          </Link>
        </div>
      </div>

      <div className="text-center mt-5">
        <h2 className={cn(
          "inline-block text-[64px] font-bold uppercase tracking-[2px]",
          "cursor-pointer text-white",
          "animate-textGlow",
          "md:text-[48px] sm:text-[36px]"
        )}>
          {items[currentIndex]?.word}
        </h2>
      </div>
    </section>
  )
}