import ArtheroTekst from './components/ArtheroTekst/Artherotekst'
import { Fotocarrousel1 } from './components/Fotocarrousel/fotocarrousel1/fotocarrousel1'
import Fotocarrousel2 from './components/Fotocarrousel/fotocarrousel2/fotocarrousel2'
import { Fotocarrousel3 } from './components/Fotocarrousel/fotocarrousel3/fotocarrousel3'
import VideoSection from './components/Videosection/videosection'
import { getArtHeroSections, getArtCarouselImages, getArtVideos } from './lib/art-content'

export const revalidate = 0 // 0 voor ontwikkeling, hoger voor productie

export default async function ArtPage() {
  try {
    const [heroSections, carousel1Images, carousel2Images, carousel3Images, videos] = 
      await Promise.all([
        getArtHeroSections(),
        getArtCarouselImages(1),
        getArtCarouselImages(2),
        getArtCarouselImages(3),
        getArtVideos()
      ])

    return (
      <main>
        <ArtheroTekst initialSections={heroSections} />
        <Fotocarrousel1 initialImages={carousel1Images} />
        <Fotocarrousel2 initialImages={carousel2Images} />
        <Fotocarrousel3 initialImages={carousel3Images} />
        <VideoSection initialVideo={videos[0]} />
      </main>
    )
  } catch (error) {
    console.error('Error loading art content:', error)
    return (
      <main>
        <ArtheroTekst initialSections={[]} />
        <Fotocarrousel1 initialImages={[]} />
        <Fotocarrousel2 initialImages={[]} />
        <Fotocarrousel3 initialImages={[]} />
        <VideoSection initialVideo={null} />
      </main>
    )
  }
}
