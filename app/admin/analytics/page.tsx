'use client'

import { useState, useEffect } from 'react'
import { FaUsers, FaClock, FaGlobe, FaMobileAlt, FaDesktop, FaTabletAlt } from 'react-icons/fa'

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('7d')
  const [analytics, setAnalytics] = useState({
    visitors: 0,
    pageviews: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    topPages: [] as Array<{path: string, views: number, avgTime: number}>,
    deviceBreakdown: {
      mobile: 0,
      desktop: 0,
      tablet: 0
    },
    countries: [] as Array<{country: string, visitors: number}>
  })

  useEffect(() => {
    // Simuleer het laden van Google Analytics data
    // In een productie omgeving zou je hier de Google Analytics API aanroepen
    const timer = setTimeout(() => {
      setAnalytics({
        visitors: 2438,
        pageviews: 8752,
        avgSessionDuration: 124, // seconden
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
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [period])

  // Formatteren van seconden naar mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6 pt-24 sm:pt-28 md:pt-32">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        
        <div className="mt-4 flex space-x-2 sm:mt-0">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p)
                setIsLoading(true)
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

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Overview stats */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-white">Top Pages</h2>
            <div className="overflow-hidden rounded-lg bg-[#1A1A1A]">
              <table className="w-full">
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Device Breakdown */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">Device Breakdown</h2>
              <div className="rounded-lg bg-[#1A1A1A] p-4">
                <div className="mb-6 flex items-end justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#252525] text-amber-500">
                    <FaMobileAlt size={24} />
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#252525] text-blue-500">
                    <FaDesktop size={20} />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#252525] text-green-500">
                    <FaTabletAlt size={16} />
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
                
                <div className="flex justify-between text-sm">
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
              <div className="overflow-hidden rounded-lg bg-[#1A1A1A]">
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