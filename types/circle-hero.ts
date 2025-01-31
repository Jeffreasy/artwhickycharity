export interface CircleHeroItem {
  id: string
  created_at: string
  updated_at: string
  image_src: string
  image_alt: string
  word: string
  url: string // URL voor de link
  order_number: number
  is_active: boolean
  status: 'draft' | 'published' | 'archived'
  cloudinary_id?: string
  version?: string
}

export const defaultCircleHeroItem: Partial<CircleHeroItem> = {
  is_active: true,
  status: 'published',
  order_number: 0
}

export function createCircleHeroItem(data: Partial<CircleHeroItem>): CircleHeroItem {
  return {
    ...defaultCircleHeroItem,
    ...data
  } as CircleHeroItem
} 