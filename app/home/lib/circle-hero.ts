import { 
  CircleHeroImage, 
  CircleHeroWord,
  CircleHeroImageRow,
  CircleHeroWordRow 
} from '@/types/circle-hero'
import { supabase } from '../../../lib/supabase'

export async function getCircleHeroImages(): Promise<CircleHeroImage[]> {
  const { data, error } = await supabase
    .from('circle_hero_images')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching circle hero images:', error)
    throw new Error('Failed to fetch circle hero images')
  }

  return (data as CircleHeroImageRow[]).map(img => ({
    id: img.id,
    cloudinary_id: img.cloudinary_id,
    alt: img.alt,
    url: img.url,
    order: img.order_number
  }))
}

export async function getCircleHeroWords(): Promise<CircleHeroWord[]> {
  const { data, error } = await supabase
    .from('circle_hero_words')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching circle hero words:', error)
    throw new Error('Failed to fetch circle hero words')
  }

  return (data as CircleHeroWordRow[]).map(word => ({
    id: word.id,
    word: word.word,
    order: word.order_number
  }))
}

export async function updateCircleHeroWords(words: CircleHeroWord[]) {
  const { error } = await supabase
    .from('circle_hero_words')
    .upsert(
      words.map(word => ({
        id: word.id,
        word: word.word,
        order_number: word.order
      }))
    )

  if (error) {
    console.error('Error updating circle hero words:', error)
    throw new Error('Failed to update circle hero words')
  }
}

export async function updateCircleHeroImages(images: CircleHeroImage[]) {
  const { error } = await supabase
    .from('circle_hero_images')
    .upsert(
      images.map(img => ({
        id: img.id,
        cloudinary_id: img.cloudinary_id,
        alt: img.alt,
        url: img.url,
        order_number: img.order
      }))
    )

  if (error) {
    console.error('Error updating circle hero images:', error)
    throw new Error('Failed to update circle hero images')
  }
} 