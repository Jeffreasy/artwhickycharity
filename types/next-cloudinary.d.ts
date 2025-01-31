declare module 'next-cloudinary' {
  import { FC } from 'react'

  interface CldImageProps {
    src: string
    width?: number
    height?: number
    alt: string
    className?: string
    priority?: boolean
    sizes?: string
    loading?: 'lazy' | 'eager'
    preserveTransformations?: boolean
    format?: string
    quality?: string
  }

  export const CldImage: FC<CldImageProps>
} 