export interface AboutSection {
  id: string
  created_at: string
  updated_at: string
  section_key: string
  content: string
  order_number: number
  style_type: 'title' | 'paragraph' | 'email'
} 