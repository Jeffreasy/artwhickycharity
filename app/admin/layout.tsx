import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from './auth/AuthProvider'

// Admin styles
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Dashboard - Whisky For Charity',
  description: 'Admin dashboard voor Whisky For Charity',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="bg-gray-900 text-white min-h-screen">
        {/* Fixed header with z-index to display above main content */}
        <header className="fixed top-[60px] left-0 right-0 bg-gray-800 border-b border-gray-700 py-4 z-10">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-xl font-bold">Whisky For Charity Admin</h1>
          </div>
        </header>
        
        {/* Main content with padding to account for both top navbars */}
        <main className="pt-[132px] px-6 pb-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
} 