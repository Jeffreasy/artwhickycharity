import { CharityTekst } from './components/CharityTekst/charitytekst'
import { CharityAfbeelding } from './components/CharityAfbeelding/charityafbeelding'
import { getCharitySections, getCharityImages } from './lib/charity-content'

export const revalidate = 0 // 0 voor ontwikkeling, hoger voor productie

export default async function CharityPage() {
  try {
    const [sections, images] = await Promise.all([
      getCharitySections(),
      getCharityImages()
    ])

    return (
      <main>
        <CharityTekst initialSections={sections} />
        <CharityAfbeelding initialImages={images} />
      </main>
    )
  } catch (error) {
    console.error('Error loading charity content:', error)
    return (
      <main>
        <CharityTekst initialSections={[]} />
        <CharityAfbeelding initialImages={[]} />
      </main>
    )
  }
}
