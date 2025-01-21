'use client'

import { CldImage } from 'next-cloudinary'
import { motion } from 'framer-motion'

export function WhiskyImage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl"
    >
      <CldImage
        src="66fbdbc67df6e09ea5001030_HOPEnecklabelDEF2HiRes_kl7pnt"
        alt="Whisky bottle label"
        width={4961}
        height={3508}
        className="w-full h-auto"
        priority
        sizes="(max-width: 767px) 100vw, (max-width: 1200px) 718px, 718px"
      />
    </motion.div>
  )
} 