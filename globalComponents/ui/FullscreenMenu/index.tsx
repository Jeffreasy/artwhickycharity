'use client'

import React from 'react'
import { cn } from '@/utils/cn'
import { useMenu } from '@/contexts/MenuContext'

interface FullscreenMenuProps {
  children?: React.ReactNode
}


export function FullscreenMenu({ children }: FullscreenMenuProps) {
  const { isMenuOpen } = useMenu()

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black z-50 transition-opacity duration-300",
        isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {children}
    </div>
  )
} 