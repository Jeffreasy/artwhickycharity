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
  
  // Log voor debugging
  console.log('Processing Cloudinary URL for:', publicId);
  
  const cleanedId = publicId
    .replace('artwhickycharity/', '')
    .replace('HeroCircle/', '');
    
  // Log cleaned ID
  console.log('Cleaned Cloudinary ID:', cleanedId);
  
  return cleanedId;
}
