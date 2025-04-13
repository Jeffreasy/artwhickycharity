'use client'

import { useEffect, useState } from 'react'
import { CircleHero } from './circleherocomp'
import { CircleHeroItem } from '@/types/circle-hero'
import { supabase } from '@/lib/supabase'

export function CircleHeroWrapper() {
  const [items, setItems] = useState<CircleHeroItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('circle_hero_items')
      .select('*')
      .eq('is_active', true)
      .order('order_number', { ascending: true })
    
    if (error) {
      console.error('Error fetching items:', error)
      return
    }
    
    if (data) {
      setItems(data as CircleHeroItem[])
    }
  }

  useEffect(() => {
    void fetchItems()

    const channel = supabase
      .channel('realtime-circle-hero-items')
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'circle_hero_items'
        },
        (payload: any) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            void fetchItems()
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setLoading(false)
        }
      })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return <CircleHero initialItems={items} />
}

export { CircleHero } 