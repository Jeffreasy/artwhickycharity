'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheckIcon } from '@heroicons/react/24/solid' // Example icon

// URLs voor de productie omgeving (of waar je admin app live staat)
const ADMIN_APP_URL = 'https://admin.whiskyforcharity.com/dashboard' // Link naar admin dashboard
const ADMIN_STATUS_ENDPOINT = 'https://admin.whiskyforcharity.com/api/auth/status' // API op admin panel

export function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Functie om admin status te checken
    const checkAdminStatus = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(ADMIN_STATUS_ENDPOINT, {
          method: 'GET',
          credentials: 'include', // Belangrijk: stuur cookies mee
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.isAdmin === true) {
            setIsAdmin(true)
          } else {
            setIsAdmin(false) // Expliciet false zetten
          }
        } else {
          // Gebruiker is waarschijnlijk niet ingelogd in de admin app of endpoint bestaat niet
          // Log de status voor debugging
          console.log(`Admin status check failed with status: ${response.status}`)
          setIsAdmin(false) 
        }
      } catch (error) {
        // Netwerkfout of CORS probleem
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, []) // Draait alleen bij mount

  // Render de knop niet tijdens het laden of als gebruiker geen admin is
  if (isLoading || !isAdmin) {
    return null 
  }

  // Render de admin knop
  return (
    <Link 
      href={ADMIN_APP_URL}
      target="_blank" // Open in nieuw tabblad
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
      title="Open Admin Panel"
      aria-label="Open Admin Panel"
    >
      <ShieldCheckIcon className="h-6 w-6" />
    </Link>
  )
} 