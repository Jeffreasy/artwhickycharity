export interface CircleHeroImage {
  id: string
  cloudinary_id: string
  alt: string
  url: string
  order: number
}

export interface CircleHeroWord {
  id: string
  word: string
  order: number
}

// Database types voor type safety
export interface CircleHeroImageRow {
  id: string
  created_at: string
  cloudinary_id: string
  cloudinary_version?: number
  alt: string
  url: string
  order_number: number
}

export interface CircleHeroWordRow {
  id: string
  created_at: string
  word: string
  order_number: number
} 