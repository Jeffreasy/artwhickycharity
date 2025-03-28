'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CustomMetrics } from './custom-metrics'

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'business' | 'looker'>('business')
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-xl">Loading analytics...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 p-1 rounded-md flex">
            <button
              onClick={() => setActiveTab('business')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'business' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Business Metrics
            </button>
            <button
              onClick={() => setActiveTab('looker')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'looker' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Looker Studio
            </button>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      
      {activeTab === 'business' && <CustomMetrics />}
      
      {activeTab === 'looker' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-xl font-medium mb-6">Google Looker Studio Dashboard</h2>
          
          <div className="bg-white rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '800px' }}>
            <iframe 
              width="100%" 
              height="100%" 
              src="https://lookerstudio.google.com/embed/reporting/a2b98320-db81-4585-8369-7eb86e0968f6/page/kIV1C" 
              frameBorder="0" 
              style={{ border: 0 }} 
              allowFullScreen 
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>
              This dashboard is powered by Google Looker Studio and displays real-time analytics data from your Google Analytics account.
              For best experience, view in fullscreen mode.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 