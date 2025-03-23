'use client'

import { useState, useEffect } from 'react'
import { FaUsers, FaClock, FaGlobe, FaMobileAlt, FaDesktop, FaTabletAlt, FaExclamationTriangle } from 'react-icons/fa'

interface AnalyticsData {
  visitors: number;
  pageviews: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ path: string; views: number; avgTime: number }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  countries: Array<{ country: string; visitors: number }>;
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('7d')
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: 0,
    pageviews: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    topPages: [],
    deviceBreakdown: {
      mobile: 0,
      desktop: 0,
      tablet: 0
    },
    countries: []
  })

  // Convert period to actual date range
  const getDateRange = (period: string): { startDate: string; endDate: string } => {
    const today = new Date()
    const endDate = today.toISOString().split('T')[0]
    
    let startDate: Date = new Date()
    if (period === '7d') {
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === '30d') {
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else if (period === '90d') {
      startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate
    }
  }

  useEffect(() => {
    const fetchGoogleAnalyticsData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { startDate, endDate } = getDateRange(period)
        
        // Make an API call to our backend endpoint that will fetch from GA4
        const response = await fetch(`/api/analytics?startDate=${startDate}&endDate=${endDate}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch analytics data: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // Update state with real data
        setAnalytics({
          visitors: data.visitors || 0,
          pageviews: data.pageviews || 0,
          avgSessionDuration: data.avgSessionDuration || 0,
          bounceRate: data.bounceRate || 0,
          topPages: data.topPages || [],
          deviceBreakdown: {
            mobile: data.deviceBreakdown?.mobile || 0,
            desktop: data.deviceBreakdown?.desktop || 0,
            tablet: data.deviceBreakdown?.tablet || 0
          },
          countries: data.countries || []
        })
      } catch (err: any) {
        console.error('Error fetching Google Analytics data:', err)
        setError(err.message || 'Failed to load analytics data')
        
        // Fallback to mock data in case of error
        setAnalytics({
          visitors: 2438,
          pageviews: 8752,
          avgSessionDuration: 124, // seconds
          bounceRate: 42.8, // percentage
          topPages: [
            { path: '/', views: 3241, avgTime: 82 },
            { path: '/shop', views: 1867, avgTime: 143 },
            { path: '/about', views: 985, avgTime: 95 },
            { path: '/events', views: 754, avgTime: 127 },
            { path: '/contact', views: 532, avgTime: 68 }
          ],
          deviceBreakdown: {
            mobile: 58,
            desktop: 36,
            tablet: 6
          },
          countries: [
            { country: 'Netherlands', visitors: 1542 },
            { country: 'Belgium', visitors: 431 },
            { country: 'United Kingdom', visitors: 226 },
            { country: 'Germany', visitors: 124 },
            { country: 'United States', visitors: 115 }
          ]
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoogleAnalyticsData()
  }, [period])

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics</h1>
        
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p)
              }}
              className={`rounded-md px-3 py-1 text-sm ${
                period === p 
                  ? 'bg-amber-500 text-black' 
                  : 'bg-[#252525] text-white hover:bg-[#303030]'
              }`}
            >
              {p === '7d' ? 'Week' : p === '30d' ? 'Month' : '3 Months'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-900 p-4 text-red-300">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p>{error}</p>
          </div>
          <p className="text-sm mt-2">Using fallback data. Please check your API configuration or try again later.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Overview stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticCard
              title="Total Visitors"
              value={analytics.visitors.toLocaleString()}
              icon={<FaUsers className="text-amber-500" />}
            />
            <AnalyticCard
              title="Total Pageviews"
              value={analytics.pageviews.toLocaleString()}
              icon={<FaGlobe className="text-blue-500" />}
            />
            <AnalyticCard
              title="Avg. Session"
              value={formatTime(analytics.avgSessionDuration)}
              icon={<FaClock className="text-green-500" />}
            />
            <AnalyticCard
              title="Bounce Rate"
              value={`${analytics.bounceRate}%`}
              icon={<FaGlobe className="text-red-500" />}
            />
          </div>

          {/* Top Pages */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">Top Pages</h2>
            <div className="overflow-x-auto rounded-lg bg-[#1A1A1A]">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Page</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Views</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Avg. Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {analytics.topPages.map((page, i) => (
                    <tr key={i} className="text-white">
                      <td className="px-4 py-3 text-sm">{page.path}</td>
                      <td className="px-4 py-3 text-sm">{page.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{formatTime(page.avgTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Device and Country Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Device Breakdown */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">Device Breakdown</h2>
              <div className="rounded-lg bg-[#1A1A1A] p-4">
                <div className="mb-6 flex items-end justify-around sm:justify-between">
                  <div className="flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-full bg-[#252525] text-amber-500">
                    <FaMobileAlt size={20} className="sm:text-2xl" />
                  </div>
                  <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full bg-[#252525] text-blue-500">
                    <FaDesktop size={16} className="sm:text-xl" />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#252525] text-green-500">
                    <FaTabletAlt size={14} className="sm:text-base" />
                  </div>
                </div>
                
                <div className="mb-2 h-4 w-full overflow-hidden rounded-full bg-[#252525]">
                  <div className="flex h-full">
                    <div 
                      className="bg-amber-500" 
                      style={{ width: `${analytics.deviceBreakdown.mobile}%` }}
                    />
                    <div 
                      className="bg-blue-500" 
                      style={{ width: `${analytics.deviceBreakdown.desktop}%` }}
                    />
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${analytics.deviceBreakdown.tablet}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-xs sm:text-sm text-gray-300">
                  <div>
                    <span className="text-amber-500">{analytics.deviceBreakdown.mobile}%</span> Mobile
                  </div>
                  <div>
                    <span className="text-blue-500">{analytics.deviceBreakdown.desktop}%</span> Desktop
                  </div>
                  <div>
                    <span className="text-green-500">{analytics.deviceBreakdown.tablet}%</span> Tablet
                  </div>
                </div>
              </div>
            </div>

            {/* Top Countries */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">Top Countries</h2>
              <div className="overflow-x-auto rounded-lg bg-[#1A1A1A]">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Country</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Visitors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2A]">
                    {analytics.countries.map((country, i) => (
                      <tr key={i} className="text-white">
                        <td className="px-4 py-3 text-sm">{country.country}</td>
                        <td className="px-4 py-3 text-sm">{country.visitors.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

type AnalyticCardProps = {
  title: string
  value: string
  icon: React.ReactNode
}

function AnalyticCard({ title, value, icon }: AnalyticCardProps) {
  return (
    <div className="rounded-lg bg-[#1A1A1A] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="h-8 w-8">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
} 