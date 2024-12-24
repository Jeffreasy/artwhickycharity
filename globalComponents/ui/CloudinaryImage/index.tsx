'use client'

import { CldImage } from 'next-cloudinary'
import { cn } from '@/utils/cn'
import { cloudinaryConfig, getCloudinaryImageUrl } from '@/app/home/lib/cloudinary'

interface CloudinaryImageProps {
  publicId: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function CloudinaryImage({
  publicId,
  alt,
  width = 1200,
  height = 1200,
  className
}: CloudinaryImageProps) {
  if (!publicId) {
    console.warn('CloudinaryImage: publicId is required')
    return null
  }

  const processedPublicId = getCloudinaryImageUrl(publicId)

  // Log voor debugging
  console.log('CloudinaryImage render:', {
    input: publicId,
    processed: processedPublicId,
    cloudName: cloudinaryConfig.cloudName
  })

  return (
    <CldImage
      src={processedPublicId}
      width={width}
      height={height}
      alt={alt}
      className={cn(
        "object-cover w-full h-full",
        className
      )}
      priority={true}
      sizes="(max-width: 768px) 100vw, 50vw"
      loading="eager"
      preserveTransformations={false}
    />
  )
} 