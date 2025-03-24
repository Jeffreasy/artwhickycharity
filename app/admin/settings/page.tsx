'use client'

import { useState } from 'react'
import { FaSave, FaUserShield } from 'react-icons/fa'

export default function SettingsPage() {
  const [sentrySettings, setSentrySettings] = useState({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://example@sentry.io/123456',
    tracesSampleRate: 0.2,
    environment: 'production',
    enablePerformanceMonitoring: true,
    enableErrorReporting: true
  })

  const [saveStatus, setSaveStatus] = useState<{
    sentry: 'idle' | 'saving' | 'success' | 'error'
  }>({
    sentry: 'idle'
  })

  const handleSentryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSentrySettings({
      ...sentrySettings,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const saveSentrySettings = () => {
    setSaveStatus({ ...saveStatus, sentry: 'saving' })
    
    // Simuleer een API request met een kleine vertraging
    setTimeout(() => {
      setSaveStatus({ ...saveStatus, sentry: 'success' })
      
      // Reset na 3 seconden
      setTimeout(() => {
        setSaveStatus({ ...saveStatus, sentry: 'idle' })
      }, 3000)
    }, 800)
  }

  const getButtonClass = (status: string) => {
    if (status === 'saving') {
      return 'bg-amber-700 text-white cursor-not-allowed'
    } else if (status === 'success') {
      return 'bg-green-600 text-white'
    } else if (status === 'error') {
      return 'bg-red-600 text-white'
    }
    return 'bg-amber-500 text-black hover:bg-amber-400'
  }

  const getButtonText = (status: string) => {
    if (status === 'saving') return 'Saving...'
    if (status === 'success') return 'Saved!'
    if (status === 'error') return 'Error!'
    return 'Save Settings'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Settings</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Sentry Settings */}
          <div className="rounded-lg bg-[#1A1A1A] p-4 sm:p-6">
            <div className="mb-6 flex items-center">
              <div className="mr-3 rounded-full bg-amber-500/20 p-2">
                <FaUserShield className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Sentry</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Sentry DSN
                </label>
                <input
                  type="text"
                  name="dsn"
                  value={sentrySettings.dsn}
                  onChange={handleSentryChange}
                  className="w-full rounded-md border border-[#2A2A2A] bg-[#121212] px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Environment
                </label>
                <input
                  type="text"
                  name="environment"
                  value={sentrySettings.environment}
                  onChange={handleSentryChange}
                  className="w-full rounded-md border border-[#2A2A2A] bg-[#121212] px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Traces Sample Rate (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  name="tracesSampleRate"
                  min="0"
                  max="1"
                  step="0.1"
                  value={sentrySettings.tracesSampleRate}
                  onChange={handleSentryChange}
                  className="w-full rounded-md border border-[#2A2A2A] bg-[#121212] px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enablePerformanceMonitoring"
                  name="enablePerformanceMonitoring"
                  checked={sentrySettings.enablePerformanceMonitoring}
                  onChange={handleSentryChange}
                  className="h-4 w-4 rounded border-[#2A2A2A] bg-[#121212] text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="enablePerformanceMonitoring" className="ml-2 text-sm text-gray-300">
                  Enable Performance Monitoring
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableErrorReporting"
                  name="enableErrorReporting"
                  checked={sentrySettings.enableErrorReporting}
                  onChange={handleSentryChange}
                  className="h-4 w-4 rounded border-[#2A2A2A] bg-[#121212] text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="enableErrorReporting" className="ml-2 text-sm text-gray-300">
                  Enable Error Reporting
                </label>
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={saveSentrySettings}
                  disabled={saveStatus.sentry === 'saving'}
                  className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${getButtonClass(saveStatus.sentry)}`}
                >
                  {saveStatus.sentry !== 'idle' ? (
                    getButtonText(saveStatus.sentry)
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 