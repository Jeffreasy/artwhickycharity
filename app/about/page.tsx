import { Suspense } from 'react'
import { AboutTekst } from './components/AboutTekst/abouttekst'
import { getAboutSections } from './lib/about-content'
import * as Sentry from "@sentry/nextjs"

export const revalidate = 0 // 0 voor ontwikkeling, hoger voor productie

export default async function AboutPage() {
  try {
    return (
      <main className="min-h-screen">
        <Suspense 
          fallback={
            <div className="animate-pulse bg-gray-800 h-[400px] w-full" />
          }
        >
          <AboutTekst initialSections={await getAboutSections()} />
        </Suspense>
      </main>
    )
  } catch (error) {
    Sentry.captureException(error)
    console.error('Error loading about content:', error)
    return (
      <main className="min-h-screen">
        <AboutTekst initialSections={[]} />
      </main>
    )
  }
}
