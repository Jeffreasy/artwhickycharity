import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function verifyImages(imageIds: string[]) {
  for (const id of imageIds) {
    try {
      const result = await cloudinary.api.resource(id)
      console.log(`Image ${id} exists:`, result.secure_url)
    } catch (error) {
      console.error(`Image ${id} not found:`, error)
    }
  }
}