export interface ArtHeroSection {
  id: string
  created_at: string
  updated_at: string
  section_key: string
  content: string
  order_number: number
  style_type: 'image' | 'title' | 'subtitle' | 'paragraph'
}

export interface ArtCarouselImage {
  id: string
  created_at: string
  updated_at: string
  carousel_number: number
  cloudinary_id: string
  alt_text: string
  order_number: number
  priority: boolean
}

export interface ArtVideo {
  id: string
  created_at: string
  updated_at: string
  cloudinary_id: string
  title: string | null
  description: string | null
  order_number: number
} 