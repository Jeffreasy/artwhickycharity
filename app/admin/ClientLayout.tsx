'use client'

import { Inter } from 'next/font/google'
import { AuthProvider } from './auth/AuthProvider'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import gsap from 'gsap'

// Admin styles
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Orders', path: '/admin/orders' },
  { name: 'Products', path: '/admin/products' },
  { name: 'Analytics', path: '/admin/analytics' },
]

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    
    // Animeer het binnenkomen van de pagina
    if (isMounted) {
      // Content fade in
      gsap.fromTo(
        '.admin-content',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
      
      // Header slide in
      gsap.fromTo(
        '.admin-header',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      )
      
      // Nav items staggered animation
      gsap.fromTo(
        '.nav-item',
        { opacity: 0, x: -10 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.3, 
          stagger: 0.1, 
          ease: 'power2.out',
          delay: 0.2
        }
      )
    }
  }, [isMounted, pathname])
  
  const isActive = (path: string) => {
    return pathname === path || 
           (path !== '/admin/dashboard' && pathname?.startsWith(path))
  }

  return (
    <AuthProvider>
      <div className="bg-gray-900 text-white min-h-screen">
        {/* Fixed header with z-index to display above main content */}
        <header className="admin-header fixed top-[60px] left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 py-4 z-10 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">WFC</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Whisky For Charity <span className="text-amber-500 font-normal">Admin</span>
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-item px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600/80 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        
        {/* Mobile navigation bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700/50 p-2 z-10">
          <nav className="flex justify-around">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center p-2 rounded-md transition-all duration-150 ${
                  isActive(item.path)
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full mb-1 ${isActive(item.path) ? 'bg-blue-400' : 'bg-transparent'}`}></div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Main content with padding to account for both top navbars */}
        <main className="admin-content pt-[132px] pb-20 md:pb-10 px-4 md:px-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
} 