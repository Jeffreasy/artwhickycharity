declare module 'next-cloudinary' {
  import { FC, ImgHTMLAttributes } from 'react'

  export interface CldImageProps extends ImgHTMLAttributes<HTMLImageElement> {
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
    fill?: boolean
  }

  export const CldImage: FC<CldImageProps>
}
