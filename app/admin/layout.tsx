import type { Metadata } from 'next'
import { ClientLayout } from './ClientLayout'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Whisky For Charity',
  description: 'Admin dashboard voor Whisky For Charity',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
} 