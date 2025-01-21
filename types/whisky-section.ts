export interface WhiskySection {
  id: string
  created_at: string
  updated_at: string
  section_key: string
  content: string
  order_number: number
  style_type: 'title' | 'paragraph' | 'link'
}

export interface WhiskyImage {
  id: string
  created_at: string
  updated_at: string
  cloudinary_id: string
  alt_text: string
  width: number
  height: number
  priority: boolean
  order_number: number
} 