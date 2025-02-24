import { fetchAndCacheInstagramPosts } from '@/lib/social-media'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const posts = await fetchAndCacheInstagramPosts()
    return NextResponse.json({ success: true, posts })
  } catch (error) {
    console.error('Error in social API route:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 })
  }
} 