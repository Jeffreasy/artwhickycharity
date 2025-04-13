import { Cloudinary } from '@cloudinary/url-gen'

// Gebruik environment variable voor cloud name
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgfuv7wif',
  folder: ''
}

export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: cloudinaryConfig.cloudName
  },
  url: {
    secure: true
  }
})

export const getCloudinaryImageUrl = (publicId: string) => {
  if (!publicId) return '';
  
  // Verwijder extensies en potentiele "versie" prefix (vXXXXXXXXXX/)
  const cleanedId = publicId.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
  
  return cleanedId;
}
