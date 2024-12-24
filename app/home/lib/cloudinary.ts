import { Cloudinary } from '@cloudinary/url-gen'

export const cloudinaryConfig = {
  cloudName: 'dgfuv7wif',
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
  return publicId
    .replace('artwhickycharity/', '')
    .replace('HeroCircle/', '')
} 