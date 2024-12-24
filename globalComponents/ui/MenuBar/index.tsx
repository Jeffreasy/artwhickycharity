'use client'

import React from 'react'
import { cn } from '@/utils/cn'
import { useMenu } from '@/contexts/MenuContext'

interface MenuBarProps {
  className?: string
}

export function MenuBar({ className }: MenuBarProps) {
  const { isMenuOpen, setIsMenuOpen } = useMenu()

  return (
    <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className={cn(
        "flex items-center justify-center text-white text-lg font-medium",
        "w-full h-full hover:bg-white/5 transition-colors",
        className
      )}
    >
      {isMenuOpen ? 'CLOSE' : 'MENU'}
    </button>
  )
} 