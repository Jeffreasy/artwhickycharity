export type GlobeEmoji = '🌍' | '🌎' | '🌏'

export interface LanguagePhrase {
  id: string
  created_at: string
  updated_at: string
  phrase: string
  emoji: GlobeEmoji
  order_number: number
  is_active: boolean
  language_code: string
} 