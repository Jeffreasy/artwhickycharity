import { CharityTekst } from './components/CharityTekst/charitytekst'
import { CharityAfbeelding } from './components/CharityAfbeelding/charityafbeelding'
import { getCharitySections, getCharityImages } from './lib/charity-content'
import { Suspense } from 'react'

export const revalidate = 0 // 0 voor ontwikkeling, hoger voor productie

export default async function CharityPage() {
  try {
    const [sections, images] = await Promise.all([
      getCharitySections(),
      getCharityImages()
    ])

    return (
      <main className="min-h-screen">
        {/* Text Section */}
        <section className="mb-12 sm:mb-16 md:mb-20">
          <CharityTekst initialSections={sections} />
        </section>

        {/* Images Section */}
        <Suspense fallback={<div className="h-[400px] bg-black/20" />}>
          <section>
            <CharityAfbeelding initialImages={images} />
          </section>
        </Suspense>
      </main>
    )
  } catch (error) {
    console.error('Error loading charity content:', error)
    return (
      <main className="min-h-screen">
        <section className="mb-12 sm:mb-16 md:mb-20">
          <CharityTekst initialSections={[]} />
        </section>

        <Suspense fallback={<div className="h-[400px] bg-black/20" />}>
          <section>
            <CharityAfbeelding initialImages={[]} />
          </section>
        </Suspense>
      </main>
    )
  }
}
