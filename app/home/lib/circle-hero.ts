import { 
  CircleHeroImage, 
  CircleHeroImageRow,
  CircleHeroWordRow 
} from '@/types/circle-hero'
import { supabase } from '@/lib/supabase'

export async function getCircleHeroImages(): Promise<CircleHeroImage[]> {
  const { data: images, error } = await supabase
    .from('circle_hero_images')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching circle hero images:', error)
    throw new Error('Failed to fetch circle hero images')
  }

  return (images as CircleHeroImageRow[]).map(img => ({
    id: parseInt(img.id),
    url: img.src,
    alt: img.alt,
    cloudinary_id: img.cloudinary_id,
    cloudinary_version: img.cloudinary_version
  }))
}

export async function getCircleHeroWords(): Promise<string[]> {
  const { data: words, error } = await supabase
    .from('circle_hero_words')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching circle hero words:', error)
    throw new Error('Failed to fetch circle hero words')
  }

  return (words as CircleHeroWordRow[]).map(word => word.word)
}

export async function updateCircleHeroImages(images: CircleHeroImage[]) {
  const { error } = await supabase
    .from('circle_hero_images')
    .upsert(
      images.map(img => ({
        id: img.id.toString(),
        src: img.url,
        alt: img.alt,
        cloudinary_id: img.cloudinary_id,
        cloudinary_version: img.cloudinary_version,
        order_number: img.id
      }))
    )

  if (error) {
    console.error('Error updating circle hero images:', error)
    throw new Error('Failed to update circle hero images')
  }
} 