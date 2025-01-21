'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ArtVideo } from '@/types/art-section'
import { supabase } from '@/lib/supabase'

interface VideoSectionProps {
  initialVideo: ArtVideo | null
}

const VideoSection = ({ initialVideo }: VideoSectionProps) => {
  const [video, setVideo] = useState<ArtVideo | null>(initialVideo)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('art_videos')
        .select('*')
        .order('order_number', { ascending: true })
        .limit(1)
      
      if (error) {
        console.error('Polling error:', error)
        return
      }
      
      if (data && data[0]) {
        const newVideo = data[0] as ArtVideo
        if (JSON.stringify(newVideo) !== JSON.stringify(video)) {
          setVideo(newVideo)
        }
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [video])

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (videoRef.current) {
            videoRef.current.load()
          }
        }
      })
    }, options)

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  if (!video) return null

  return (
    <div className="bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            controls
            autoPlay={isInView}
            loop
            muted
            playsInline
            preload="none"
          >
            <source 
              src={`https://res.cloudinary.com/dgfuv7wif/video/upload/q_auto,f_auto/v1735057306/${video.cloudinary_id}`}
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  )
}

export default VideoSection
