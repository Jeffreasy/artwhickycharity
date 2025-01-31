'use client'

import { useEffect, useState } from 'react'
import { ThreeCirclesSection } from './3circlesection'
import { CircleSection } from '@/types/circle-sections'
import { supabase } from '@/lib/supabase'

export function ThreeCirclesWrapper() {
  const [sections, setSections] = useState<CircleSection[]>([])

  const fetchSections = async () => {
    console.log('Fetching circle sections...')
    const { data, error } = await supabase
      .from('circle_sections')
      .select('*')
      .eq('is_active', true)
      .order('order_number', { ascending: true })
    
    if (error) {
      console.error('Error fetching sections:', error)
      return
    }

    if (data) {
      console.log('Received new sections:', data)
      setSections(data)
    }
  }

  useEffect(() => {
    console.log('Setting up circle sections subscription...')
    void fetchSections()

    const channel = supabase.channel('circle_sections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circle_sections'
        },
        (payload) => {
          console.log('Received change event:', payload)
          void fetchSections()
        }
      )
      .subscribe((status, err) => {
        console.log('Subscription status:', status)
        if (err) console.error('Subscription error:', err)
      })

    return () => {
      console.log('Cleaning up circle sections subscription')
      channel.unsubscribe()
    }
  }, [])

  return <ThreeCirclesSection initialSections={sections} />
} 