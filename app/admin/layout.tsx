'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useSupabaseAuth } from '@/app/providers/SupabaseAuthProvider'
import { Suspense, useState, useEffect } from 'react'
import { Loading } from '@/globalComponents/ui/Loading'

// Icons
import { RiDashboardLine, RiSettings4Line, RiLogoutBoxLine, RiUserAddLine, RiMenuLine, RiCloseLine } from 'react-icons/ri'
import { FaChartLine, FaBug, FaInstagram, FaEnvelope } from 'react-icons/fa'

// Component that uses pathname
function AdminLayoutWithPathname({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, session, isLoading, signOut } = useSupabaseAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const pathname = usePathname()

  // Handle window resize and set mobile state
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Check on mount
    checkIfMobile()
    
    // Listen for window resize
    window.addEventListener('resize', checkIfMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Bepaal of de gebruiker is ingelogd
  const isAuthenticated = !!user && !!session

  // Toon loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  // Redirect naar login als niet ingelogd, maar sta de login pagina wel toe
  if (!isAuthenticated && pathname !== '/admin/login' && pathname !== '/admin/register') {
    redirect('/admin/login')
  }

  // Toon de login/register pagina zonder layout als dat de huidige pagina is
  if (pathname === '/admin/login' || pathname === '/admin/register') {
    return <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    }>{children}</Suspense>
  }

  // Admin menu items
  const menuItems = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: <RiDashboardLine size={20} /> },
    { title: 'Analytics', href: '/admin/analytics', icon: <FaChartLine size={20} /> },
    { title: 'Error Logs', href: '/admin/errors', icon: <FaBug size={20} /> },
    { title: 'Settings', href: '/admin/settings', icon: <RiSettings4Line size={20} /> },
  ]

  // Management
  const managementItems = [
    { title: 'Add User', href: '/admin/register', icon: <RiUserAddLine size={20} /> },
  ]

  const handleSignOut = async () => {
    try {
      // Clear any emergency access cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'admin_bypass=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      }
      
      // Sign out of Supabase
      await signOut()
      
      // Use timeout to ensure all state is cleared before redirecting
      setTimeout(() => {
        window.location.href = '/admin/login'
      }, 800)
    } catch (error) {
      console.error('Error during sign out:', error)
      window.location.href = '/admin/login'
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Render sidebar content (used for both desktop and mobile)
  const renderSidebarContent = () => (
    <>
      <div className="mb-8 flex items-center space-x-2 pt-4">
        <div className="h-8 w-8 rounded-full bg-amber-500" />
        <span className="text-xl font-bold text-white">Admin Panel</span>
      </div>

      <div className="mb-4 text-xs text-gray-500">
        {user ? `Ingelogd als ${user.email}` : 'Niet ingelogd'}
      </div>

      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg p-2 transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-black'
                      : 'text-gray-300 hover:bg-[#1E1E1E] hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-8 border-t border-[#2A2A2A] pt-4">
          <div className="mb-2 px-2 text-xs font-semibold uppercase text-gray-600">Management</div>
          <ul className="space-y-2 mb-4">
            {managementItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 rounded-lg p-2 transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-black'
                        : 'text-gray-300 hover:bg-[#1E1E1E] hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          
          <button
            onClick={handleSignOut}
            className="flex w-full items-center space-x-3 rounded-lg p-2 text-gray-300 transition-colors hover:bg-[#1E1E1E] hover:text-white"
          >
            <RiLogoutBoxLine size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  )

  // Simplified mobile navigation items (4 main items + menu button)
  const mobileNavItems = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: <RiDashboardLine size={24} /> },
    { title: 'Analytics', href: '/admin/analytics', icon: <FaChartLine size={24} /> },
    { title: 'Errors', href: '/admin/errors', icon: <FaBug size={24} /> },
    { title: 'Settings', href: '/admin/settings', icon: <RiSettings4Line size={24} /> },
  ]

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Mobile header - branding only */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-[#121212] p-4 border-b border-[#2A2A2A]">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-amber-500" />
          <span className="text-xl font-bold text-white">Admin Panel</span>
        </div>
        <button 
          onClick={toggleMobileMenu}
          className="text-white p-2"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
        </button>
      </header>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 bg-[#121212] p-4 overflow-y-auto">
        {renderSidebarContent()}
      </div>

      {/* Main content - adjusted for both mobile and desktop */}
      <main className={`flex-1 overflow-y-auto ${isMobile ? 'pt-16 pb-16' : ''}`}>
        <div className="p-4 md:p-8">
          <Suspense fallback={
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          }>
            {children}
          </Suspense>
        </div>
      </main>

      {/* Mobile bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#121212] border-t border-[#2A2A2A]">
        <div className="flex items-center justify-around">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-3 px-2 ${
                  isActive ? 'text-amber-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <div>{item.icon}</div>
                <span className="text-xs mt-1">{item.title}</span>
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center py-3 px-2 text-gray-400 hover:text-white"
          >
            <RiLogoutBoxLine size={24} />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </nav>

      {/* Full sidebar for mobile (shown when menu is open) */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileMenu} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-[#121212] p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-amber-500" />
                <span className="text-xl font-bold text-white">Admin Panel</span>
              </div>
              <button onClick={toggleMobileMenu} className="text-white p-2">
                <RiCloseLine size={24} />
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        </>
      )}
    </div>
  )
}

// Main export with Suspense
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<Loading />}>
      <AdminLayoutWithPathname children={children} />
    </Suspense>
  )
} 