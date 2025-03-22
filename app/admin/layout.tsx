'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useSupabaseAuth } from '@/app/providers/SupabaseAuthProvider'
import { Suspense } from 'react'
import { Loading } from '@/globalComponents/ui/Loading'

// Icons
import { RiDashboardLine, RiSettings4Line, RiLogoutBoxLine, RiUserAddLine } from 'react-icons/ri'
import { FaChartLine, FaBug } from 'react-icons/fa'

// Component that uses pathname
function AdminLayoutWithPathname({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, session, isLoading, signOut } = useSupabaseAuth()
  
  const pathname = usePathname()

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
    await signOut()
    window.location.href = '/admin/login'
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      {/* Sidebar */}
      <div className="w-64 bg-[#121212] p-4">
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
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8">
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        }>
          {children}
        </Suspense>
      </div>
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