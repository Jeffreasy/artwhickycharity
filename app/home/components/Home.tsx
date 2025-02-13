import { CircleHeroWrapper } from './CircleHero'
import { ThreeCirclesWrapper } from './3circlessection'
import { TextSection } from './Textsection/Textsection'
import { getTextSections } from '@/app/home/lib/text-section'
import { Suspense } from 'react'
import { LanguageBarServer } from './LanguageBar/LanguageBarServer'

export const revalidate = 0

export async function Home() {
  const sections = await getTextSections()

  return (
    <div className="min-h-screen pt-[80px] sm:pt-[100px] md:pt-[120px]">
      <Suspense 
        fallback={
          <div className="h-[52px] bg-black flex items-center justify-center">
            <span className="text-white/50">Loading...</span>
          </div>
        }
      >
        <LanguageBarServer />
      </Suspense>

      <CircleHeroWrapper />
      <ThreeCirclesWrapper />
      <TextSection initialSections={sections} />
    </div>
  )
}