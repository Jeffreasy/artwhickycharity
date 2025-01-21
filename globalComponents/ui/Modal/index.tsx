'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { IoClose } from 'react-icons/io5'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Fade in animatie
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
      gsap.fromTo(contentRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      )
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] opacity-0"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 flex items-center justify-center">
        <div
          ref={contentRef}
          className="relative bg-black border border-white/20 p-8 max-w-2xl w-full rounded-lg"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <IoClose size={24} />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
} 