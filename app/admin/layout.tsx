'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

// Icons
import { RiDashboardLine, RiSettings4Line, RiLogoutBoxLine } from 'react-icons/ri'
import { FaChartLine, FaBug } from 'react-icons/fa'
import { signOut } from 'next-auth/react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Blok toegang tot admin pagina's behalve login
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  // Redirect naar login als niet ingelogd, maar sta de login pagina wel toe
  if (status === 'unauthenticated' && pathname !== '/admin/login') {
    redirect('/admin/login')
  }

  // Toon de login pagina zonder layout als dat de huidige pagina is
  if (pathname === '/admin/login') {
    return children
  }

  // Admin menu items
  const menuItems = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: <RiDashboardLine size={20} /> },
    { title: 'Analytics', href: '/admin/analytics', icon: <FaChartLine size={20} /> },
    { title: 'Error Logs', href: '/admin/errors', icon: <FaBug size={20} /> },
    { title: 'Settings', href: '/admin/settings', icon: <RiSettings4Line size={20} /> },
  ]

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/admin/login' })
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      {/* Sidebar */}
      <div className="w-64 bg-[#121212] p-4">
        <div className="mb-8 flex items-center space-x-2 pt-4">
          <div className="h-8 w-8 rounded-full bg-amber-500" />
          <span className="text-xl font-bold text-white">Admin Panel</span>
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
        {children}
      </div>
    </div>
  )
} 