import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { CircleHeroImage } from '@/types/circle-hero'
import { getCircleHeroImages } from '@/app/home/lib/circle-hero'

export async function GET() {
  const images = await getCircleHeroImages()
  return NextResponse.json(images)
}

export async function PUT(request: Request) {
  try {
    const images = await request.json() as CircleHeroImage[]
    
    const { error } = await supabase
      .from('circle_hero_images')
      .upsert(
        images.map(img => ({
          id: img.id.toString(),
          src: img.url,
          alt: img.alt,
          cloudinary_id: img.cloudinary_id,
          cloudinary_version: img.cloudinary_version,
          order_number: img.id
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