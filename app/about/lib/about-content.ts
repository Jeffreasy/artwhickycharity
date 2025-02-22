import { supabase } from '@/lib/supabase'
import { AboutSection } from '@/types/about-section'

export async function getAboutSections(): Promise<AboutSection[]> {
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching about sections:', error)
    return []
  }

  return data as AboutSection[]
} 