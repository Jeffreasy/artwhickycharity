'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { SHOP_CONFIG } from '../../../config/shopConfig'
import Link from 'next/link'
import { gsap } from 'gsap'

export default function ShopClosed() {
  const homeRef = useRef<HTMLAnchorElement>(null)

  // Hover animations voor de home button
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.1,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.3,
      ease: "power2.in"
    })
  }

  return (
    <div className="fixed top-[80px] sm:top-[100px] md:top-[120px] left-0 right-0 bottom-0 
                    bg-black border-t border-white/10 z-[998]">
      <div className="h-full w-full flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl px-4"
        >
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-[32px] font-bold text-white/80 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {SHOP_CONFIG.maintenanceMessage.title}
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl text-white/60 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {SHOP_CONFIG.maintenanceMessage.description}
          </motion.p>
          
          <motion.p 
            className="text-base sm:text-lg text-white/40 italic mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {SHOP_CONFIG.maintenanceMessage.subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              href="/"
              ref={homeRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="text-2xl sm:text-3xl md:text-[32px] font-bold text-white/80 hover:text-white 
                       transition-all duration-300 tracking-wide"
            >
              HOME
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 