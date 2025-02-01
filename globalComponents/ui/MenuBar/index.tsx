'use client'

import { cn } from '@/utils/cn'
import { useMenu } from '@/contexts/MenuContext'

export function MenuBar() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()

  return (
    <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className={cn(
        "fixed top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-50",
        "flex flex-col justify-center items-center",
        "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full",
        "bg-white/10 backdrop-blur-sm",
        "transition-all duration-300",
        isMenuOpen && "bg-white/20"
      )}
    >
      <div className="space-y-1.5 sm:space-y-2">
        <span className={cn(
          "block w-5 sm:w-5.5 md:w-6 h-0.5 bg-white transition-transform",
          isMenuOpen && "rotate-45 translate-y-2"
        )} />
        <span className={cn(
          "block w-5 sm:w-5.5 md:w-6 h-0.5 bg-white transition-opacity",
          isMenuOpen && "opacity-0"
        )} />
        <span className={cn(
          "block w-5 sm:w-5.5 md:w-6 h-0.5 bg-white transition-transform",
          isMenuOpen && "-rotate-45 -translate-y-2"
        )} />
      </div>
    </button>
  )
} 