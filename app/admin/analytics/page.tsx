'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CustomMetrics } from './custom-metrics'
import gsap from 'gsap'

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'business' | 'looker'>('business')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isLoading && user) {
      // Animatie voor de hele container
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
      
      // Animatie voor de tabs
      gsap.fromTo(
        tabsRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: 'back.out(1.7)' }
      );
      
      // Voor de iframe container of custom metrics, afhankelijk van actieve tab
      if (activeTab === 'looker' && iframeContainerRef.current) {
        gsap.fromTo(
          iframeContainerRef.current,
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, delay: 0.3, ease: 'power3.out' }
        );
      }
    }
  }, [isLoading, user, activeTab]);
  
  // Animatie bij tab wisselen
  const switchTab = (tab: 'business' | 'looker') => {
    // Animeer huidige content uit
    const timeline = gsap.timeline();
    
    timeline.to('.tab-content', {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(tab);
        
        // Na state update, animeer nieuwe content in
        setTimeout(() => {
          gsap.fromTo(
            '.tab-content',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
          );
        }, 50);
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xl">Loading analytics...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/admin/login')
    return null
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Analytics Dashboard</h1>
        <div ref={tabsRef} className="flex items-center gap-4">
          <div className="bg-gray-800/80 p-1 rounded-md flex shadow-lg">
            <button
              onClick={() => activeTab !== 'business' && switchTab('business')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'business' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Business Metrics
            </button>
            <button
              onClick={() => activeTab !== 'looker' && switchTab('looker')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'looker' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Looker Studio
            </button>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors shadow-md hover:-translate-y-0.5 hover:shadow-lg transform duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      
      {activeTab === 'business' && (
        <div className="tab-content">
          <CustomMetrics />
        </div>
      )}
      
      {activeTab === 'looker' && (
        <div ref={iframeContainerRef} className="tab-content bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50">
          <h2 className="text-xl font-medium mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Google Looker Studio Dashboard</h2>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-2xl" style={{ height: 'calc(100vh - 200px)', minHeight: '800px' }}>
            <iframe 
              width="100%" 
              height="100%" 
              src="https://lookerstudio.google.com/embed/reporting/a2b98320-db81-4585-8369-7eb86e0968f6/page/kIV1C" 
              frameBorder="0" 
              style={{ border: 0 }} 
              allowFullScreen 
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              className="transition-opacity duration-300"
              onLoad={(e) => {
                // Fade in iframe when loaded
                e.currentTarget.style.opacity = '1';
              }}
              style={{ opacity: 0 }}
            />
          </div>
          
          <div className="mt-6 text-sm text-gray-400 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-300 mb-1">About This Dashboard</h3>
                <p>
                  This dashboard is powered by Google Looker Studio and displays real-time analytics data from your Google Analytics account.
                  For best experience, view in fullscreen mode using the controls in the embedded dashboard.
                </p>
                <p className="mt-2">
                  <span className="font-medium text-gray-300">Pro Tip:</span> You can customize this dashboard directly in Looker Studio to add more metrics or visualizations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 