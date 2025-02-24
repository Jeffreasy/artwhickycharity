'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaInstagram, FaTiktok } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { debounce } from 'lodash'

// Instagram post IDs
const INSTAGRAM_POSTS = [
  'DGP2kIkI2-P',
  'DGN6JqkRF0w',
  'DFe_3uII9Eg'
]

interface SocialSectionState {
  isLoading: boolean
  error: string | null
  scriptLoaded: boolean
}

export function SocialSection() {
  const [activeTab, setActiveTab] = useState<'instagram' | 'tiktok'>('instagram')
  const [state, setState] = useState<SocialSectionState>({
    isLoading: true,
    error: null,
    scriptLoaded: false
  })

  // Geoptimaliseerde script loading
  const loadInstagramScript = useCallback(async () => {
    try {
      const script = document.createElement('script')
      script.src = '//www.instagram.com/embed.js'
      script.async = true
      
      const loadPromise = new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
      })
      
      document.body.appendChild(script)
      await loadPromise
      
      setState(prev => ({ ...prev, scriptLoaded: true, isLoading: false }))
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load social media content',
        isLoading: false 
      }))
    }
  }, [])

  // Geoptimaliseerde embed refresh
  const processEmbeds = useCallback(
    debounce(() => {
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
    }, 100),
    []
  )

  useEffect(() => {
    loadInstagramScript()
    return () => {
      const script = document.querySelector('script[src*="instagram.com/embed.js"]')
      if (script) {
        document.body.removeChild(script)
      }
    }
  }, [loadInstagramScript])

  useEffect(() => {
    if (state.scriptLoaded) {
      processEmbeds()
    }
  }, [activeTab, state.scriptLoaded, processEmbeds])

  // Animatie varianten
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  // Loading Fallback
  const FallbackPost = () => (
    <motion.div 
      variants={itemVariants}
      className="bg-[#1C1C1C] rounded-lg p-4 aspect-[4/5]"
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20" />
      </div>
    </motion.div>
  )

  // Error Fallback
  const ErrorMessage = () => (
    <div className="text-center text-red-400 py-8">
      <p>{state.error}</p>
      <button 
        onClick={() => loadInstagramScript()}
        className="mt-4 text-white/60 hover:text-white underline"
      >
        Try again
      </button>
    </div>
  )

  return (
    <section className="w-full bg-black py-24 relative z-10">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header met animatie */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className={cn(
            "text-[2.5rem] font-bold mb-4",
            "bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent",
            "animate-textGlow"
          )}>
            Follow Our Journey
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Stay updated with our latest events, charity work, and whisky adventures
          </p>
        </motion.div>

        {/* Tab Switcher met glow effect */}
        <div className="flex justify-center gap-4 mb-16">
          {['instagram', 'tiktok'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab as 'instagram' | 'tiktok')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-8 py-2 rounded-full",
                "flex items-center gap-2",
                "transition-all duration-300",
                activeTab === tab
                  ? "bg-[#2C2C2C] text-white shadow-[0_0_20px_rgba(255,255,0,0.2)] animate-hueGlow"
                  : "bg-black text-white/60 border border-white/20"
              )}
            >
              {tab === 'instagram' ? <FaInstagram size={20} /> : <FaTiktok size={18} />}
              <span className="capitalize">{tab}</span>
            </motion.button>
          ))}
        </div>

        {/* Content Grid met Error Handling */}
        <AnimatePresence mode="wait">
          {state.error ? (
            <ErrorMessage />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
            >
              {activeTab === 'instagram' && INSTAGRAM_POSTS.map((postId) => (
                <motion.div 
                  key={postId}
                  variants={itemVariants}
                  className={cn(
                    "bg-[#1C1C1C] rounded-lg overflow-hidden",
                    "transition-all duration-300 hover:scale-[1.02]",
                    "hover:shadow-[0_0_30px_rgba(255,255,0,0.1)]"
                  )}
                >
                  {state.isLoading ? (
                    <FallbackPost />
                  ) : (
                    <blockquote
                      className="instagram-media w-full !m-0 !min-w-0"
                      data-instgrm-captioned
                      data-instgrm-permalink={`https://www.instagram.com/reel/${postId}/?utm_source=ig_embed&utm_campaign=loading`}
                      data-instgrm-version="14"
                      style={{
                        background: '#1C1C1C',
                        borderRadius: '8px',
                        maxWidth: '100%',
                        width: '100%',
                        minWidth: '100% !important',
                        margin: '0 !important'
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Follow Button met glow effect */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <a
            href="https://instagram.com/whiskyforcharity"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 px-8 py-3",
              "rounded-full text-white",
              "bg-[#2C2C2C]",
              "shadow-[0_0_20px_rgba(255,255,0,0.2)]",
              "transition-all duration-300 hover:scale-105",
              "animate-hueGlow"
            )}
          >
            <FaInstagram size={20} />
            <span>Follow Us on Instagram</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// Type definitions
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process(): void
      }
    }
  }
}
