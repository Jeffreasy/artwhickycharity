'use client'

import React, { useRef, useEffect, useState, FormEvent } from 'react'
import { useMenu } from '@/contexts/MenuContext'
import { FullscreenMenu } from '../FullscreenMenu'
import { MdEmail } from 'react-icons/md'
import { FaInstagram } from 'react-icons/fa'
import { CldImage } from 'next-cloudinary'
import gsap from 'gsap'
import { Modal } from '../Modal'
import { useRouter } from 'next/navigation'

export function Navigation() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const preTextRef = useRef<HTMLSpanElement>(null)
  const orderTextRef = useRef<HTMLSpanElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const circleContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Hover animaties voor de tekst
    const preText = preTextRef.current
    const orderText = orderTextRef.current
    const circle = circleRef.current
    const circleContainer = circleContainerRef.current

    if (preText && orderText && circle && circleContainer) {
      // Hover effect voor de hele container
      circleContainer.addEventListener('mouseenter', () => {
        gsap.to([preText, orderText], {
          scale: 1.1,
          duration: 0.3,
          ease: 'power2.out'
        })
        gsap.to(circle, {
          scale: 1.05,
          borderColor: 'rgba(255, 255, 255, 0.4)',
          duration: 0.3,
          ease: 'power2.out'
        })
      })

      circleContainer.addEventListener('mouseleave', () => {
        gsap.to([preText, orderText], {
          scale: 1,
          duration: 0.3,
          ease: 'power2.in'
        })
        gsap.to(circle, {
          scale: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          duration: 0.3,
          ease: 'power2.in'
        })
      })
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    try {
      // Hier kun je eventueel de data naar je backend sturen
      // bijvoorbeeld met fetch of supabase
      
      // Sluit de modal
      setIsModalOpen(false)
      
      // Redirect naar de gegevenspage met de form data als query parameters
      router.push(`/gegevenspage?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black z-[999]">
        <div className="flex h-[80px] sm:h-[100px] md:h-[120px] items-center px-4 sm:px-6 md:px-8 border-b border-white/20">
          {/* Left: Contact Links - Stack vertically on all screens */}
          <div className="flex flex-col gap-1">
            <a 
              href="mailto:info@whiskyforcharity.com" 
              className="text-white/80 hover:text-white transition-colors flex items-center"
              aria-label="Send email"
            >
              <MdEmail size={24} />
            </a>
            <a 
              href="https://www.instagram.com/whiskyforcharity/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors flex items-center"
              aria-label="Visit Instagram"
            >
              <FaInstagram size={22} />
            </a>
          </div>

          {/* Center: Pre-order with Logo - Kleiner op mobiel */}
          <div className="flex-1 flex justify-center items-center">
            <div 
              ref={circleContainerRef} 
              className="relative flex items-center cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Open pre-order form"
            >
              <span ref={preTextRef} className="text-white text-base sm:text-lg md:text-xl mr-3 sm:mr-4 md:mr-6">PRE</span>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                {/* Witte cirkel border met zwarte achtergrond */}
                <div 
                  ref={circleRef}
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
              <span ref={orderTextRef} className="text-white text-base sm:text-lg md:text-xl ml-3 sm:ml-4 md:ml-6">ORDER</span>
            </div>
          </div>

          {/* Right: Menu Button - Kleiner op mobiel */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-white/80 transition-colors text-base sm:text-lg md:text-xl"
          >
            Menu
          </button>
        </div>
      </nav>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-4">Pre-order Your Whisky</h2>
          <p className="mb-6">
            Get ready to experience our exclusive whisky collection. Fill in your details below to secure your pre-order.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input 
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-white"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-white text-black py-2 rounded hover:bg-white/90 transition-colors"
            >
              Submit Pre-order
            </button>
          </form>
        </div>
      </Modal>

      <FullscreenMenu />
    </>
  )
} 