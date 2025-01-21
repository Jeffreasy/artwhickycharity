'use client'

import { CldImage } from 'next-cloudinary'
import { motion } from 'framer-motion'

export function WhiskyDetails() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
      className="text-center border-[3px] border-yellow-400 rounded-2xl p-12 max-w-2xl mx-auto"
    >
      <div className="space-y-8">
        <h1 className="text-2xl font-medium">
          Thank you for your interest in the<br />
          Limited Art Edition Whisky for Charity 2024
        </h1>
        
        <div className="space-y-8">
          <h2 className="text-xl uppercase tracking-wide">Details</h2>
          
          <div className="space-y-8">
            <p className="text-lg">Titel &apos;Hope&apos;</p>
            
            <p className="text-center">
              Single Malt Scotch Whisky, Annandale Distillery,<br />
              Unpeated, Ex-Sherry Cask, Distilled 2019-Bottled<br />
              2024, Non-Chill Filtered, Alc. 61,3%
            </p>

            <div className="space-y-4">
              <p className="text-lg">Edition</p>
              <p>50 pieces.</p>
              <p>Price € 299 (Excluding shipping costs)</p>
              <p>Delivery January/February 2025</p>
            </div>
          </div>

          {/* Logo Section - Exact copy van Navigation styling */}
          <div className="flex items-center justify-center">
            <div className="relative flex items-center">
              <span className="text-white text-xl mr-6">PRE</span>
              <div className="relative w-24 h-24">
                {/* Witte cirkel border met zwarte achtergrond */}
                <div 
                  className="absolute inset-0 rounded-full bg-black border border-white/20 overflow-hidden transition-transform"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CldImage
                    src="66fbc7d32c54ed89b3c8945b_test_pgrla9"
                    alt="Whisky4Charity Logo"
                    width={800}
                    height={900}
                    className="object-cover w-full h-full scale-150"
                    priority
                  />
                </div>
              </div>
              <span className="text-white text-xl ml-6">ORDER</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 