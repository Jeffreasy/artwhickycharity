import { 
  CircleHeroImage,
  CircleHeroWord
} from '@/types/circle-hero'
import { supabase } from '@/lib/supabase'

// Voeg Cloudinary URL helper toe
function getCloudinaryUrl(publicId: string, version?: number): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  // Verwijder de folder prefix als die al in de publicId zit
  const cleanPublicId = publicId.replace('artwhickycharity/', '')
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`
  const versionStr = version ? `/v${version}` : ''
  
  // Log de URL voor debugging
  const url = `${baseUrl}${versionStr}/${cleanPublicId}`
  console.log('Generated Cloudinary URL:', url)
  
  return url
}

export async function getCircleHeroImages(): Promise<CircleHeroImage[]> {
  const { data: images, error } = await supabase
    .from('circle_hero_images')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching circle hero images:', error)
    throw new Error('Failed to fetch circle hero images')
  }

  return images as CircleHeroImage[]  // De data komt al in het juiste formaat
}

export async function getCircleHeroWords(): Promise<string[]> {
  const { data: words, error } = await supabase
    .from('circle_hero_words')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching circle hero words:', error)
    return ['Error', 'Loading', 'Words']
  }

  if (!words || words.length === 0) {
    return ['No', 'Words', 'Found']
  }

  return words.map(word => word.word)
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