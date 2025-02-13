import ArtheroTekst from './components/ArtheroTekst/Artherotekst'
import { Fotocarrousel1 } from './components/Fotocarrousel/fotocarrousel1/fotocarrousel1'
import Fotocarrousel2 from './components/Fotocarrousel/fotocarrousel2/fotocarrousel2'
import { Fotocarrousel3 } from './components/Fotocarrousel/fotocarrousel3/fotocarrousel3'
import VideoSection from './components/Videosection/videosection'
import { getArtHeroSections, getArtCarouselImages, getArtVideos } from './lib/art-content'
import { LuukBodeSection } from './components/LuukBodeSection'
import { Suspense } from 'react'
import * as Sentry from "@sentry/nextjs"

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
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="mb-12 sm:mb-16 md:mb-20">
          <ArtheroTekst initialSections={heroSections} />
        </section>

        {/* Carousel Sections */}
        <Suspense fallback={<div className="h-[400px] bg-black/20" />}>
          <section className="mb-12 sm:mb-16 md:mb-20">
            <Fotocarrousel1 initialImages={carousel1Images} />
          </section>

          <section className="mb-12 sm:mb-16 md:mb-20">
            <Fotocarrousel2 initialImages={carousel2Images} />
          </section>

          <section className="mb-12 sm:mb-16 md:mb-20">
            <Fotocarrousel3 initialImages={carousel3Images} />
          </section>
        </Suspense>

        {/* Video & Artist Sections */}
        <section className="mb-12 sm:mb-16 md:mb-20">
          <VideoSection initialVideo={videos[0]} />
        </section>

        <section>
          <LuukBodeSection />
        </section>
      </main>
    )
  } catch (error) {
    Sentry.captureException(error)
    console.error('Error loading art content:', error)
    return (
      <main className="min-h-screen">
        <section className="mb-12 sm:mb-16 md:mb-20">
          <ArtheroTekst initialSections={[]} />
        </section>

        <Suspense fallback={<div className="h-[400px] bg-black/20" />}>
          <section className="mb-12 sm:mb-16 md:mb-20">
            <Fotocarrousel1 initialImages={[]} />
          </section>
          <section className="mb-12 sm:mb-16 md:mb-20">
            <Fotocarrousel2 initialImages={[]} />
          </section>
          <section className="mb-12 sm:mb-16 md:mb-20">
            <Fotocarrousel3 initialImages={[]} />
          </section>
        </Suspense>

        <section className="mb-12 sm:mb-16 md:mb-20">
          <VideoSection initialVideo={null} />
        </section>

        <section>
          <LuukBodeSection />
        </section>
      </main>
    )
  }
}
