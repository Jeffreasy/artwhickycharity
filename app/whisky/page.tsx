import { WhiskyTekst } from './components/WhiskyTekst/Whiskytekst'
import { WhiskyAfbeelding } from './components/WhiskyAfbeelding/WhiskyAfbeelding'
import { getWhiskySections, getWhiskyImages } from './lib/whisky-content'

export const revalidate = 0 // 0 voor ontwikkeling, hoger voor productie

export default async function WhiskyPage() {
  try {
    const [sections, images] = await Promise.all([
      getWhiskySections(),
      getWhiskyImages()
    ])

    return (
      <main>
        <WhiskyTekst initialSections={sections} />
        <WhiskyAfbeelding initialImages={images} />
      </main>
    )
  } catch (error) {
    console.error('Error loading whisky content:', error)
    return (
      <main>
        <WhiskyTekst initialSections={[]} />
        <WhiskyAfbeelding initialImages={[]} />
      </main>
    )
  }
}
