import { TextSection, TextSectionUpdate } from '@/types/text-section'
import { supabase } from '@/lib/supabase'

export async function getTextSections(): Promise<TextSection[]> {
  const { data: sections, error } = await supabase
    .from('text_sections')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching text sections:', error)
    throw new Error('Failed to fetch text sections')
  }

  return sections as TextSection[]
}

export async function updateTextSection(id: string, update: TextSectionUpdate): Promise<TextSection> {
  const { data, error } = await supabase
    .from('text_sections')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating text section:', error)
    throw new Error('Failed to update text section')
  }

  return data as TextSection
}

export async function getTextSectionByKey(key: string): Promise<TextSection | null> {
  const { data, error } = await supabase
    .from('text_sections')
    .select('*')
    .eq('section_key', key)
    .single()

  if (error) {
    if (error.code === 'PGRST116') { // not found
      return null
    }
    console.error('Error fetching text section:', error)
    throw new Error('Failed to fetch text section')
  }

  return data as TextSection
} 