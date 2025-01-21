import { AboutSection } from '@/types/about-section'
import { supabase } from '@/lib/supabase'

export async function getAboutSections(): Promise<AboutSection[]> {
  const { data: sections, error } = await supabase
    .from('about_sections')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching about sections:', error)
    throw new Error('Failed to fetch about sections')
  }

  return sections as AboutSection[]
} 