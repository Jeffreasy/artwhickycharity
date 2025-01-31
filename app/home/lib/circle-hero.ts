import { CircleHeroItem, createCircleHeroItem } from '@/types/circle-hero'
import { supabase } from '@/lib/supabase'

export async function getCircleHeroItems(): Promise<CircleHeroItem[]> {
  const { data, error } = await supabase
    .from('circle_hero_items')
    .select('*')
    .eq('is_active', true)
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching circle hero items:', error)
    throw new Error('Failed to fetch circle hero items')
  }

  return data.map(item => createCircleHeroItem(item))
}