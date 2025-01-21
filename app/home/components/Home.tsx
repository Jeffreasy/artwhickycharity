import { CircleHero } from '@/app/home/components/CircleHero'
import { TextSection } from '@/app/home/components/Textsection/Textsection'
import { getCircleHeroImages, getCircleHeroWords } from '@/app/home/lib/circle-hero'
import { getTextSections } from '@/app/home/lib/text-section'

export const revalidate = 0 // 0 voor ontwikkeling, gebruik een hoger getal in productie

export async function Home() {
  try {
    const [images, words, textSections] = await Promise.all([
      getCircleHeroImages(),
      getCircleHeroWords(),
      getTextSections()
    ])

    return (
      <div>
        <CircleHero images={images} words={words} />
        <TextSection initialSections={textSections} />
      </div>
    )
  } catch (error) {
    console.error('Error loading data:', error)
    // Geef lege arrays door als fallback
    return (
      <div>
        <CircleHero images={[]} words={[]} />
        <TextSection initialSections={[]} />
      </div>
    )
  }
} 