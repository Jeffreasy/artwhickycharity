import { ArtHeroSection, ArtCarouselImage, ArtVideo } from '@/types/art-section'
import { supabase } from '@/lib/supabase'

export async function getArtHeroSections(): Promise<ArtHeroSection[]> {
  const { data: sections, error } = await supabase
    .from('art_hero_sections')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching art hero sections:', error)
    throw new Error('Failed to fetch art hero sections')
  }

  return sections as ArtHeroSection[]
}

export async function getArtCarouselImages(carouselNumber: number): Promise<ArtCarouselImage[]> {
  const { data: images, error } = await supabase
    .from('art_carousel_images')
    .select('*')
    .eq('carousel_number', carouselNumber)
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching art carousel images:', error)
    throw new Error('Failed to fetch art carousel images')
  }

  return images as ArtCarouselImage[]
}

export async function getArtVideos(): Promise<ArtVideo[]> {
  const { data: videos, error } = await supabase
    .from('art_videos')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Error fetching art videos:', error)
    throw new Error('Failed to fetch art videos')
  }

  return videos as ArtVideo[]
} 