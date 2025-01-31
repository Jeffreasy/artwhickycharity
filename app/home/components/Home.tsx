import { CircleHeroWrapper } from './CircleHero'
import { ThreeCirclesWrapper } from './3circlessection'
import { TextSection } from './Textsection/Textsection'
import { getTextSections } from '@/app/home/lib/text-section'

export const revalidate = 0

export async function Home() {
  const sections = await getTextSections()

  return (
    <div>
      <CircleHeroWrapper />
      <ThreeCirclesWrapper />
      <TextSection initialSections={sections} />
    </div>
  )
}