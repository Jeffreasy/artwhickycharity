'use client'

import { useEffect, useState } from 'react'
import { ThreeCirclesSection } from './3circlesection'
import { CircleSection } from '@/types/circle-sections'
import { supabase } from '@/lib/supabase'

export function ThreeCirclesWrapper() {
  const [sections, setSections] = useState<CircleSection[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSections = async () => {
    setLoading(true)
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
      setSections(data)
    }
  }

  useEffect(() => {
    void fetchSections()

    const channel = supabase.channel('realtime-circle-sections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circle_sections'
        },
        (payload: any) => {
          if (payload.eventType === 'UPDATE') {
            setSections((prevSections) =>
              prevSections.map((section) =>
                payload.new.id === section.id ? payload.new : section
              )
            )
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

  return <ThreeCirclesSection initialSections={sections} />
} 