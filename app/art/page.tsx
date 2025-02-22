import ArtheroTekst from './components/ArtheroTekst/Artherotekst'
import { Fotocarrousel1 } from './components/Fotocarrousel/fotocarrousel1/fotocarrousel1'
import Fotocarrousel2 from './components/Fotocarrousel/fotocarrousel2/fotocarrousel2'
import { Fotocarrousel3 } from './components/Fotocarrousel/fotocarrousel3/fotocarrousel3'
import VideoSection from './components/Videosection/videosection'
import { getArtHeroSections, getArtCarouselImages, getArtVideos } from './lib/art-content'
import { LuukBodeSection } from './components/LuukBodeSection'
import { Suspense } from 'react'
import * as Sentry from "@sentry/nextjs"
import { Loading } from '@/globalComponents/ui/Loading'

export const revalidate = 0 // 0 voor ontwikkeling, hoger voor productie

export default async function ArtPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Suspense fallback={<div className="h-[400px] bg-black/20" />}>
        <section className="mb-12 sm:mb-16 md:mb-20">
          <ArtheroTekst initialSections={await getArtHeroSections()} />
        </section>
      </Suspense>

      {/* Carousel Sections */}
      <Suspense fallback={<div className="h-[400px] bg-black/20" />}>
        <section className="mb-12 sm:mb-16 md:mb-20">
          <Fotocarrousel1 initialImages={await getArtCarouselImages(1)} />
        </section>
      </Suspense>

      <Suspense fallback={<div className="h-[400px] bg-black/20" />}>
        <section className="mb-12 sm:mb-16 md:mb-20">
          <Fotocarrousel2 initialImages={await getArtCarouselImages(2)} />
        </section>
      </Suspense>

      <Suspense fallback={<div className="h-[400px] bg-black/20" />}>
        <section className="mb-12 sm:mb-16 md:mb-20">
          <Fotocarrousel3 initialImages={await getArtCarouselImages(3)} />
        </section>
      </Suspense>

      {/* Video Section */}
      <Suspense fallback={<div className="h-[400px] bg-black/20" />}>
        <section className="mb-12 sm:mb-16 md:mb-20">
          <VideoSection initialVideo={(await getArtVideos())[0]} />
        </section>
      </Suspense>

      {/* Artist Section */}
      <section>
        <LuukBodeSection />
      </section>
    </main>
  )
}
