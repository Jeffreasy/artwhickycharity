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
    <section className="relative h-[80vh] w-full mt-[120px]">
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
      
      {/* Content Block */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/70 p-12 md:p-16 max-w-4xl mx-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {getContentByType('title')}
            </h1>
            <h2 className="text-xl md:text-2xl mb-4">
              {getContentByType('subtitle')}
            </h2>
            <div className="space-y-6">
              {sections
                .filter(section => section.style_type === 'paragraph')
                .map(section => (
                  <p key={section.id} className="text-lg">
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
