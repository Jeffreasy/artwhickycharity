﻿import { AboutTekst } from './components/AboutTekst/abouttekst'
import { getAboutSections } from './lib/about-content'
import * as Sentry from "@sentry/nextjs"

export const revalidate = 0 // 0 voor ontwikkeling, hoger voor productie

export default async function AboutPage() {
  try {
    const sections = await getAboutSections()

    return (
      <main className="min-h-screen">
        <AboutTekst initialSections={sections} />
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
