import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
})

export async function GET() {
  try {
    // Retrieve available resources from your Cloudinary account
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 10
    })

    // Return the result
    return NextResponse.json({
      success: true,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      resources: result.resources.map((res: any) => ({
        publicId: res.public_id,
        url: res.secure_url,
        format: res.format,
        createdAt: res.created_at
      }))
    })
  } catch (error: any) {
    console.error('Cloudinary error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to connect to Cloudinary',
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    }, { status: 500 })
  }
} 