export interface CircleHeroImage {
  id: number
  url: string
  alt: string
  cloudinary_id: string
  cloudinary_version?: number
}

export interface CircleHeroImageRow {
  id: string
  created_at: string
  src: string
  alt: string
  url: string
  order_number: number
  cloudinary_id: string
  cloudinary_version?: number
}

export interface CircleHeroWordRow {
  id: string
  created_at: string
  word: string
  order_number: number
} 