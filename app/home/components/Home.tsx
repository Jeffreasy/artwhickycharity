import { CircleHero } from '@/app/home/components/CircleHero'
import { getCircleHeroImages } from '@/app/home/lib/circle-hero'

export async function Home() {
  const images = await getCircleHeroImages()

  return (
    <div>
      <CircleHero images={images} />
    </div>
  )
} 