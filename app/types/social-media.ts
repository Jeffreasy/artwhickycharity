export interface InstagramPost {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  permalink: string
  caption: string
  timestamp: string
  thumbnail_url?: string
  children?: {
    data: Array<{
      id: string
      media_type: string
      media_url: string
    }>
  }
}

export interface CachedSocialPost {
  id: string
  platform: 'instagram' | 'tiktok'
  post_id: string
  media_type: string
  media_url: string
  thumbnail_url?: string
  caption: string
  permalink: string
  timestamp: string
  cached_at: string
} 