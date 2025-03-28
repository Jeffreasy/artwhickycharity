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
      <div className={`${inter.className} min-h-screen bg-gray-900 text-white`}>
        <header className="bg-gray-800 border-b border-gray-700 py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-xl font-bold">Whisky For Charity Admin</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
} 