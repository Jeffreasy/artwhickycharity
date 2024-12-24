'use client'

import { cn } from '@/utils/cn'
import { useMenu } from '@/contexts/MenuContext'

export function MenuBar() {
  const { isOpen, toggleMenu } = useMenu()

  return (
    <button
      onClick={toggleMenu}
      className={cn(
        "fixed top-4 right-4 z-50",
        "flex flex-col justify-center items-center",
        "w-12 h-12 rounded-full",
        "bg-white/10 backdrop-blur-sm",
        "transition-all duration-300",
        isOpen && "bg-white/20"
      )}
    >
      <div className="space-y-2">
        <span className={cn(
          "block w-6 h-0.5 bg-white transition-transform",
          isOpen && "rotate-45 translate-y-2.5"
        )} />
        <span className={cn(
          "block w-6 h-0.5 bg-white transition-opacity",
          isOpen && "opacity-0"
        )} />
        <span className={cn(
          "block w-6 h-0.5 bg-white transition-transform",
          isOpen && "-rotate-45 -translate-y-2.5"
        )} />
      </div>
    </button>
  )
} 