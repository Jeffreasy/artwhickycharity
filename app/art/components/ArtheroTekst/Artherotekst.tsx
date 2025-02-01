'use client'

import React, { useEffect, useState } from 'react'
import { CldImage } from 'next-cloudinary'
import { ArtHeroSection } from '@/types/art-section'
import { supabase } from '@/lib/supabase'
import { getCloudinaryId } from '@/lib/cloudinary'

interface ArtheroTekstProps {
  initialSections: ArtHeroSection[]
}

const ArtheroTekst = ({ initialSections }: ArtheroTekstProps) => {
  const [sections, setSections] = useState<ArtHeroSection[]>(initialSections || [])

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('art_hero_sections')
        .select('*')
        .order('order_number', { ascending: true })
      
      if (error) {
        console.error('Polling error:', error)
        return
      }
      
      if (data) {
        const newSections = data as ArtHeroSection[]
        if (JSON.stringify(newSections) !== JSON.stringify(sections)) {
          setSections(newSections)
        }
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [sections])

  const getContentByType = (type: string) => {
    return sections.find(section => section.style_type === type)?.content || ''
  }

  return (
    <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] w-full mt-[80px] sm:mt-[100px] md:mt-[120px]">
      {/* Background Image */}
      <CldImage
        src={getCloudinaryId(getContentByType('image'))}
        width={1920}
        height={1080}
        alt={getContentByType('image_alt') || "Art background"}
        className="object-cover absolute inset-0 w-full h-full"
        priority
        sizes="100vw"
      />
      
      {/* Content Block - verbeterde responsiviteit */}
      <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 md:px-8">
        <div className="bg-black/70 p-6 sm:p-8 md:p-12 lg:p-16 w-full max-w-[90vw] md:max-w-4xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
              {getContentByType('title')}
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl mb-3 md:mb-4">
              {getContentByType('subtitle')}
            </h2>
            <div className="space-y-4 md:space-y-6">
              {sections
                .filter(section => section.style_type === 'paragraph')
                .map(section => (
                  <p key={section.id} className="text-base sm:text-lg">
                    {section.content}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ArtheroTekst
