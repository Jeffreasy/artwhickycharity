'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CustomMetrics } from './custom-metrics'

// Analytics periode type
type AnalyticsPeriod = '24h' | '7d' | '30d' | '90d'

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d')
  const [analyticsUrl, setAnalyticsUrl] = useState<string | null>(null)
  const [iframeKey, setIframeKey] = useState<number>(0)
  
  // Vercel Analytics URL
  useEffect(() => {
    // Project ID uit env variable of hardcoded voor demo
    const projectId = process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID || ''
    
    if (projectId) {
      // Set the analytics URL for the selected period
      setAnalyticsUrl(`https://vercel.com/swr/insights/project/${projectId}/overview?period=${period}&modal=1&layout=analytics`)
      setIframeKey(prev => prev + 1) // Force iframe refresh
    }
  }, [period])
  
  const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
    setPeriod(newPeriod)
  }
  
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
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
      
      <CustomMetrics />
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Website Performance</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handlePeriodChange('24h')}
              className={`px-3 py-1 rounded text-sm ${
                period === '24h' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => handlePeriodChange('7d')}
              className={`px-3 py-1 rounded text-sm ${
                period === '7d' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => handlePeriodChange('30d')}
              className={`px-3 py-1 rounded text-sm ${
                period === '30d' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              30d
            </button>
            <button
              onClick={() => handlePeriodChange('90d')}
              className={`px-3 py-1 rounded text-sm ${
                period === '90d' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              90d
            </button>
          </div>
        </div>
        
        {analyticsUrl ? (
          <div className="relative w-full" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
            <iframe
              key={iframeKey}
              src={analyticsUrl}
              className="absolute top-0 left-0 w-full h-full border-0 rounded-md bg-white"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-700/30 rounded-md">
            <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-400">Vercel Analytics integration not configured</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
              To display Vercel Analytics, add NEXT_PUBLIC_VERCEL_PROJECT_ID to your environment variables.
            </p>
            <button
              onClick={() => router.push('https://vercel.com/dashboard')}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
            >
              Go to Vercel Dashboard
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-medium mb-4">Traffic Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>Total Page Views</span>
              <span className="font-bold text-blue-400">View in Vercel</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>Unique Visitors</span>
              <span className="font-bold text-blue-400">View in Vercel</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>Average Time on Site</span>
              <span className="font-bold text-blue-400">View in Vercel</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Bounce Rate</span>
              <span className="font-bold text-blue-400">View in Vercel</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-medium mb-4">Top Pages</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>/shop</span>
              <span className="font-bold text-blue-400">View in Vercel</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>/whisky</span>
              <span className="font-bold text-blue-400">View in Vercel</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>/art</span>
              <span className="font-bold text-blue-400">View in Vercel</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>/charity</span>
              <span className="font-bold text-blue-400">View in Vercel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 