'use client'

import { useState, useEffect } from 'react'
import { FaExclamationTriangle, FaTimes, FaBug, FaExclamationCircle, FaInfo } from 'react-icons/fa'

type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info'

interface ErrorLog {
  id: string
  message: string
  type: string
  url: string
  timestamp: string
  status: 'open' | 'resolved' | 'ignored'
  severity: ErrorSeverity
  occurrences: number
  lastSeen: string
  users: number
}

export default function ErrorsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')

  useEffect(() => {
    // In een echte applicatie zou je hier de Sentry API aanroepen
    // Nu simuleren we error data
    const timer = setTimeout(() => {
      setErrors([
        {
          id: 'err-1',
          message: 'TypeError: Cannot read property "data" of undefined',
          type: 'TypeError',
          url: '/shop/product/[id]',
          timestamp: '2023-06-10T14:32:18Z',
          status: 'open',
          severity: 'error',
          occurrences: 28,
          lastSeen: '5 minutes ago',
          users: 12
        },
        {
          id: 'err-2',
          message: 'API Timeout Error: Failed to fetch order data',
          type: 'NetworkError',
          url: '/api/orders',
          timestamp: '2023-06-10T12:18:44Z',
          status: 'open',
          severity: 'fatal',
          occurrences: 15,
          lastSeen: '32 minutes ago',
          users: 8
        },
        {
          id: 'err-3',
          message: 'ReferenceError: window is not defined',
          type: 'ReferenceError',
          url: '/about',
          timestamp: '2023-06-09T22:45:12Z',
          status: 'resolved',
          severity: 'error',
          occurrences: 42,
          lastSeen: '1 day ago',
          users: 27
        },
        {
          id: 'err-4',
          message: 'React hydration error: Attribute mismatch',
          type: 'HydrationError',
          url: '/events',
          timestamp: '2023-06-09T18:12:33Z',
          status: 'open',
          severity: 'warning',
          occurrences: 8,
          lastSeen: '2 hours ago',
          users: 5
        },
        {
          id: 'err-5',
          message: 'Invalid auth token provided',
          type: 'AuthenticationError',
          url: '/api/auth',
          timestamp: '2023-06-08T09:22:45Z',
          status: 'ignored',
          severity: 'warning',
          occurrences: 3,
          lastSeen: '2 days ago',
          users: 2
        }
      ])
      setIsLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  const filteredErrors = errors.filter(error => {
    if (filter === 'all') return true
    if (filter === 'open') return error.status === 'open'
    if (filter === 'resolved') return error.status === 'resolved'
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-red-500 bg-red-500/10'
      case 'resolved':
        return 'text-green-500 bg-green-500/10'
      case 'ignored':
        return 'text-gray-500 bg-gray-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'fatal':
        return <FaTimes className="text-red-500" />
      case 'error':
        return <FaExclamationTriangle className="text-orange-500" />
      case 'warning':
        return <FaExclamationCircle className="text-yellow-500" />
      case 'info':
        return <FaInfo className="text-blue-500" />
      default:
        return <FaBug className="text-gray-500" />
    }
  }

  return (
    <div className="p-6 pt-16">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-white">Error Logs</h1>
        
        <div className="mt-4 flex space-x-2 sm:mt-0">
          {['all', 'open', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as 'all' | 'open' | 'resolved')}
              className={`rounded-md px-3 py-1 text-sm ${
                filter === f 
                  ? 'bg-amber-500 text-black' 
                  : 'bg-[#252525] text-white hover:bg-[#303030]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-[#1A1A1A]">
          <table className="min-w-full divide-y divide-[#2A2A2A]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Error</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Location</th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-gray-400 md:table-cell">Occurrences</th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-gray-400 md:table-cell">Users</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Last Seen</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {filteredErrors.map((error) => (
                <tr key={error.id} className="text-white hover:bg-[#252525]">
                  <td className="px-4 py-4">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">{getSeverityIcon(error.severity)}</div>
                      <div>
                        <div className="font-medium">{error.type}</div>
                        <div className="text-sm text-gray-400">{error.message}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className="font-mono text-gray-300">{error.url}</span>
                  </td>
                  <td className="hidden px-4 py-4 text-sm md:table-cell">
                    {error.occurrences}
                  </td>
                  <td className="hidden px-4 py-4 text-sm md:table-cell">
                    {error.users}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {error.lastSeen}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(error.status)}`}>
                      {error.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 text-center text-sm text-gray-500">
        Showing {filteredErrors.length} errors from Sentry
      </div>
    </div>
  )
} 