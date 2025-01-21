export interface CircleHeroImage {
  id: string          // uuid
  created_at: string  // timestamptz
  src: string         // text
  alt: string         // text
  url: string         // text
  order_number: number // int4
  cloudinary_id: string // text
  cloudinary_version: number // int4
}

export interface CircleHeroWord {
  id: string
  created_at: string
  word: string
  order_number: number
} 