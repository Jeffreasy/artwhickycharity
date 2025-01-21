export interface TextSection {
  id: string
  created_at: string
  updated_at: string
  section_key: string
  content: string
  order_number: number
  style_type: 'main' | 'impact' | 'purpose' | 'sip'
}

// Helper type voor updates
export type TextSectionUpdate = Partial<Omit<TextSection, 'id' | 'created_at' | 'updated_at'>> 