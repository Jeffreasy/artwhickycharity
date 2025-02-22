'use client'

import { useEffect, useState, useRef } from 'react'
import { CldImage } from 'next-cloudinary'
import { motion, AnimatePresence } from 'framer-motion'

export function Loading() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    const showTimer = setTimeout(() => {
      if (mountedRef.current) {
        setIsVisible(true)
      }
    }, 150)

    return () => {
      mountedRef.current = false
      clearTimeout(showTimer)
      setIsExiting(true)
    }
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={() => {
          if (isExiting && mountedRef.current) {
            setIsVisible(false)
          }
        }}
        className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-32 h-32 mb-6"
        >
          <CldImage
            src="1310abf0742f86450898c6fceaaa1eb4"
            alt="Loading"
            width={128}
            height={128}
            className="w-full h-full object-contain"
            priority
          />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-white text-xl font-medium tracking-wide"
        >
          Loading...
        </motion.p>
      </motion.div>
    </AnimatePresence>
  )
} 