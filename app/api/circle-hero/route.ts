import { NextResponse } from 'next/server'
import { getCircleHeroImages, updateCircleHeroImages } from '@/app/home/lib/circle-hero'

export async function GET() {
  const images = await getCircleHeroImages()
  return NextResponse.json(images)
}

export async function PUT(request: Request) {
  const images = await request.json()
  await updateCircleHeroImages(images)
  return NextResponse.json(images)
} 