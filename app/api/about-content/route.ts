import { NextResponse } from 'next/server'
import { getAboutSections } from '@/app/about/lib/about-content'

export async function GET() {
  try {
    const sections = await getAboutSections()
    return NextResponse.json(sections)
  } catch (error) {
    console.error('Failed to fetch about content:', error)
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    )
  }
} 