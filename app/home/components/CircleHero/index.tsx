'use client'

import React, { useEffect, useState } from 'react'
import { CircleHeroImage } from '@/types/circle-hero'
import { CircleHeroComp } from './circleherocomp'
import { supabase } from '@/lib/supabase'

interface CircleHeroProps {
  images: CircleHeroImage[]
  words: string[]
}

export function CircleHero({ images: initialImages, words: initialWords }: CircleHeroProps) {
  const [words, setWords] = useState(initialWords)

  useEffect(() => {
    console.log('Setting up polling...')
    
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('circle_hero_words')
        .select('*')
        .order('order_number', { ascending: true })
      
      if (error) {
        console.error('Polling error:', error)
        return
      }
      
      if (data) {
        const newWords = data.map(w => w.word)
        // Alleen updaten als de woorden daadwerkelijk zijn veranderd
        if (JSON.stringify(newWords) !== JSON.stringify(words)) {
          console.log('New words found:', newWords)
          setWords(newWords)
        }
      }
    }, 1000) // Check elke seconde voor updates

    return () => {
      console.log('Cleaning up polling')
      clearInterval(pollInterval)
    }
  }, [words])

  return <CircleHeroComp images={initialImages} words={words} />
} 