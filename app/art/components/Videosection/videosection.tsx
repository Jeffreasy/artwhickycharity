'use client'

import React, { useEffect, useRef, useState } from 'react'

const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isInView, setIsInView] = useState(false)

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
              src="https://res.cloudinary.com/dgfuv7wif/video/upload/q_auto,f_auto/v1735057306/acbmac_nxb3gx.mp4"
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
