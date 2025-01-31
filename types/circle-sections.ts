export interface CircleSection {
  id: string
  created_at: string
  updated_at: string
  text: string
  href: string
  glow_background: string
  glow_shadow: string
  glow_intensity: number
  glow_duration: number
  order_number: number
  is_active: boolean
  status: 'draft' | 'published' | 'archived'
  circle_size_desktop: number
  circle_size_tablet: number
  circle_size_mobile: number
  border_width: number
  border_color: string
  border_style: string
  font_size_desktop: number
  font_size_tablet: number
  font_size_mobile: number
  font_weight: string
  text_color: string
  rotation_duration: number
  hover_scale: number
  animation_ease: string
  glowColor: {
    background: string
    shadow: string
  }
}

export const defaultCircleSection: Partial<CircleSection> = {
  circle_size_desktop: 150,
  circle_size_tablet: 120,
  circle_size_mobile: 100,
  border_width: 2,
  border_color: 'rgba(255,255,255,0.1)',
  border_style: 'solid',
  font_size_desktop: 18,
  font_size_tablet: 16,
  font_size_mobile: 14,
  font_weight: 'normal',
  text_color: '#FFFFFF',
  rotation_duration: 10,
  hover_scale: 1.1,
  animation_ease: 'power2.out',
  glow_intensity: 1.0,
  glow_duration: 2.5,
  is_active: true,
  status: 'published'
}

export function createCircleSection(data: Partial<CircleSection>): CircleSection {
  return {
    ...defaultCircleSection,
    ...data,
    glowColor: {
      background: data.glow_background || defaultCircleSection.glow_background || '',
      shadow: data.glow_shadow || defaultCircleSection.glow_shadow || ''
    }
  } as CircleSection
} 