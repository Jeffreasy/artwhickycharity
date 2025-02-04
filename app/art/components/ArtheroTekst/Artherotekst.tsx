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
    <section className="relative min-h-[500px] h-[60vh] sm:h-[70vh] md:h-[80vh] w-full mt-[60px] sm:mt-[80px] md:mt-[120px]">
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
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:px-6 md:px-8">
        <div className="bg-black/70 p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-6">
              {getContentByType('title')}
            </h1>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 md:mb-4">
              {getContentByType('subtitle')}
            </h2>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {sections
                .filter(section => section.style_type === 'paragraph')
                .map(section => (
                  <p key={section.id} className="text-sm sm:text-base md:text-lg">
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
