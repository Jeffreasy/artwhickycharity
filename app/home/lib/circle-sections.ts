import { CircleSection, createCircleSection } from '@/types/circle-sections'
import { supabase } from '@/lib/supabase'

export async function getCircleSections(): Promise<CircleSection[]> {
  const { data, error } = await supabase
    .from('circle_sections')
    .select('*')
    .eq('is_active', true)
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching circle sections:', error)
    throw new Error('Failed to fetch circle sections')
  }

  return data.map(section => createCircleSection(section))
}

function getGlowColor(text: string) {
  // Match de exacte woorden uit de database
  switch (text) {
    case 'Ar':
      return {
        background: 'rainbow',
        shadow: 'rainbow'
      }
    case 'Whisk':
      return {
        background: 'rgba(218,165,32,0.1)',
        shadow: '0 0 40px 0px rgba(218,165,32,0.4)'
      }
    case 'Charit':
      return {
        background: 'rgba(3,117,255,0.1)',
        shadow: '0 0 40px 0px rgba(3,117,255,0.4)'
      }
    default:
      return {
        background: 'rgba(255,255,255,0.1)',
        shadow: '0 0 40px 0px rgba(255,255,255,0.4)'
      }
  }
} 