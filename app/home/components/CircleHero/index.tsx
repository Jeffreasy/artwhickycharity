'use client'

import React from 'react'
import { CircleHeroImage } from '@/types/circle-hero'
import { CircleHeroComp } from './circleherocomp'

interface CircleHeroProps {
  images: CircleHeroImage[]
  words: string[]
}

export function CircleHero({ images, words }: CircleHeroProps) {
  return <CircleHeroComp images={images} words={words} />
} 