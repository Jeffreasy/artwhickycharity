import { CharitySection, CharityImage } from '@/types/charity-section'
import { supabase } from '@/lib/supabase'

export async function getCharitySections(): Promise<CharitySection[]> {
  const { data: sections, error } = await supabase
    .from('charity_sections')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching charity sections:', error)
    throw new Error('Failed to fetch charity sections')
  }

  return sections as CharitySection[]
}

export async function getCharityImages(): Promise<CharityImage[]> {
  const { data: images, error } = await supabase
    .from('charity_images')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching charity images:', error)
    throw new Error('Failed to fetch charity images')
  }

  return images as CharityImage[]
} 