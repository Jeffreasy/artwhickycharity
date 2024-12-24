'use client'

import { cn } from '@/utils/cn'
import { useMenu } from '@/contexts/MenuContext'
import Link from 'next/link'

export function FullscreenMenu() {
  const { isOpen } = useMenu()

  return (
    <div className={cn(
      "fixed inset-0 z-40",
      "flex items-center justify-center",
      "bg-black/95 backdrop-blur-sm",
      "transition-all duration-300",
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )}>
      <nav className="text-center">
        <ul className="space-y-8">
          <li>
            <Link href="/" className="text-4xl font-bold hover:text-gray-300">
              Home
            </Link>
          </li>
          <li>
            <Link href="/art" className="text-4xl font-bold hover:text-gray-300">
              Art
            </Link>
          </li>
          <li>
            <Link href="/whisky" className="text-4xl font-bold hover:text-gray-300">
              Whisky
            </Link>
          </li>
          <li>
            <Link href="/charity" className="text-4xl font-bold hover:text-gray-300">
              Charity
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-4xl font-bold hover:text-gray-300">
              About
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
} 