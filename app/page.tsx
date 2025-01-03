﻿import React from 'react'
import { CircleHero } from '@/app/home/components/CircleHero'
import { ThreeDSection } from '@/app/home/components/3dsection/3dsection'
import { ThreeCirclesSection } from '@/app/home/components/3circlessection/3circlesection'
import { getCircleHeroImages, getCircleHeroWords } from '@/app/home/lib/circle-hero'
import { TextSection } from '@/app/home/components/Textsection/Textsection'
import { BottomButton } from '@/app/home/components/bottombutton/bottombutton'

export default async function Home() {
  const [images, words] = await Promise.all([
    getCircleHeroImages(),
    getCircleHeroWords()
  ])

  return (
    <main>
      <CircleHero images={images} words={words} />
      <ThreeDSection />
      <ThreeCirclesSection />
      <TextSection />
      <BottomButton />
    </main>
  )
}
