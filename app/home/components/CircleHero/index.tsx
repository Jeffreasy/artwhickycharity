'use client'

import { useEffect, useState } from 'react'
import { CircleHero } from './circleherocomp'
import { CircleHeroItem } from '@/types/circle-hero'
import { supabase } from '@/lib/supabase'

export function CircleHeroWrapper() {
  const [items, setItems] = useState<CircleHeroItem[]>([])

  const fetchItems = async () => {
    console.log('Fetching circle hero items...')
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
      console.log('Received new items:', data)
      setItems(data)
    }
  }

  useEffect(() => {
    console.log('Setting up circle hero subscription...')
    void fetchItems()

    const channel = supabase.channel('circle_hero_changes')
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'circle_hero_items'
        },
        (payload) => {
          console.log('Received change event:', payload)
          void fetchItems()
        }
      )
      .subscribe((status, err) => {
        console.log('Subscription status:', status)
        if (err) console.error('Subscription error:', err)
      })

    return () => {
      console.log('Cleaning up circle hero subscription')
      channel.unsubscribe()
    }
  }, [])

  return <CircleHero initialItems={items} />
}

export { CircleHero } 