import { NextResponse } from 'next/server'
import { getCircleHeroItems } from '@/app/home/lib/circle-hero'
import { supabase } from '@/lib/supabase'
import { CircleHeroItem } from '@/types/circle-hero'

export async function GET() {
  try {
    const items = await getCircleHeroItems()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error in circle-hero API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch circle hero items' },
      { status: 500 }
    )
  }
}

interface CircleHeroImageUpdate {
  id: string
  url: string
  alt: string
  cloudinary_id: string
  cloudinary_version: string
}

export async function PUT(request: Request) {
  try {
    const images = await request.json() as CircleHeroImageUpdate[]
    
    const { error } = await supabase
      .from('circle_hero_items')
      .upsert(
        images.map(img => ({
          id: img.id,
          image_src: img.url,
          image_alt: img.alt,
          cloudinary_id: img.cloudinary_id,
          version: img.cloudinary_version,
          order_number: parseInt(img.id, 10)
        }))
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating circle hero images:', error)
    return NextResponse.json(
      { error: 'Failed to update circle hero images' },
      { status: 500 }
    )
  }
} 