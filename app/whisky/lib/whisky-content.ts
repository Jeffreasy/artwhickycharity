import { WhiskySection, WhiskyImage } from '@/types/whisky-section'
import { supabase } from '@/lib/supabase'

export async function getWhiskySections(): Promise<WhiskySection[]> {
  const { data: sections, error } = await supabase
    .from('whisky_sections')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching whisky sections:', error)
    throw new Error('Failed to fetch whisky sections')
  }

  return sections as WhiskySection[]
}

export async function getWhiskyImages(): Promise<WhiskyImage[]> {
  const { data: images, error } = await supabase
    .from('whisky_images')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching whisky images:', error)
    throw new Error('Failed to fetch whisky images')
  }

  // Log de IDs voor debugging
  console.log('Fetched image IDs:', images?.map(img => img.cloudinary_id))

  return images as WhiskyImage[]
} 
