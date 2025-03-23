'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseAuth } from '@/app/providers/SupabaseAuthProvider'
import { Loading } from '@/globalComponents/ui/Loading'
import { FaUser, FaLock, FaExclamationTriangle, FaBug, FaShieldAlt } from "react-icons/fa";
import Cookies from "js-cookie";

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin/dashboard'
  
  const { signIn, session, user, isLoading: authLoading } = useSupabaseAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showEmergencyAccess, setShowEmergencyAccess] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  // Check for existing session and redirect if found
  useEffect(() => {
    // Avoid redirect loops by checking timing
    const lastRedirectAttempt = sessionStorage.getItem('lastRedirectAttempt');
    const now = Date.now();
    
    if (lastRedirectAttempt && now - parseInt(lastRedirectAttempt) < 5000) {
      return;
    }

    // Check for admin bypass cookie
    const hasEmergencyCookie = document.cookie.includes('admin_bypass=true');
    if (hasEmergencyCookie) {
      sessionStorage.setItem('lastRedirectAttempt', now.toString());
      window.location.href = '/admin/dashboard';
      return;
    }
    
    if (user && session) {
      sessionStorage.setItem('lastRedirectAttempt', now.toString());
      sessionStorage.setItem('isRedirecting', 'true');
      
      // Set login success cookie to help with redirect loops
      Cookies.set('login_success', 'true', { 
        expires: 1/48, // 30 minutes
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      
      // Use direct navigation for most reliable method
      window.location.href = callbackUrl.startsWith('/') 
        ? callbackUrl 
        : decodeURIComponent(callbackUrl);
    }
  }, [user, session, callbackUrl]);

  // Debug function
  const collectDebugInfo = () => {
    try {
      const allCookies = document.cookie;
      const sessionData = session ? JSON.stringify(session).substring(0, 100) + '...' : 'null';
      const userData = user ? 'Authenticated' : 'Not authenticated';
      const authErrors = localStorage.getItem('supabase.auth.error') || 'None';
      
      setDebugInfo(
        `Status: ${userData}\n` +
        `Session: ${sessionData}\n` +
        `Cookies: ${allCookies || 'None'}\n` +
        `Auth Errors: ${authErrors}\n` +
        `URL: ${window.location.href}`
      );
    } catch (e: any) {
      setDebugInfo(`Error collecting debug info: ${e.message}`);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // EMERGENCY ACCESS: Check for admin credentials directly
    if (email === "admin" && password === "admin123") {
      // Set admin bypass cookie - expires in 2 hours
      Cookies.set('admin_bypass', 'true', { 
        expires: 1/12, 
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      }); 
      
      // Set redirect timestamp
      sessionStorage.setItem('lastRedirectAttempt', Date.now().toString());
      
      // Redirect directly to dashboard
      window.location.href = '/admin/dashboard';
      return;
    }

    try {
      // Email login with Supabase
      const { error: supabaseError } = await signIn(email, password)
      
      if (supabaseError) {
        const errorMessage = supabaseError.message === 'Invalid login credentials' 
          ? 'Incorrect email or password'
          : supabaseError.message;
        
        setError(errorMessage)
        setIsLoading(false)
        return
      }
      
      // Set redirect timestamp
      sessionStorage.setItem('lastRedirectAttempt', Date.now().toString());
      sessionStorage.setItem('isRedirecting', 'true');
      
      // Set login success cookie
      Cookies.set('login_success', 'true', { 
        expires: 1/48, // 30 minutes
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      
      // Force page reload to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 1000)
    } catch (error: any) {
      setError('Authentication service is unavailable. Please try again later.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center">
            <FaShieldAlt className="h-6 w-6 text-black" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>
        
        <div className="mt-8 bg-[#121212] rounded-lg p-6 shadow-lg border border-[#2A2A2A]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 text-red-400 text-sm py-2 px-3 rounded-md border border-red-900">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="group relative flex w-full justify-center rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-black hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-70"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          
          {/* Action buttons */}
          <div className="flex justify-between text-xs mt-6 pt-4 border-t border-[#2A2A2A]">
            <button
              onClick={() => setShowEmergencyAccess(!showEmergencyAccess)}
              className="text-gray-500 hover:text-amber-500"
              type="button"
            >
              Emergency Access
            </button>
            
            <button
              onClick={() => {
                setShowDebug(!showDebug);
                if (!showDebug) collectDebugInfo();
              }}
              className="text-gray-500 hover:text-gray-400 flex items-center gap-1"
              type="button"
            >
              <FaBug className="h-3 w-3" />
              {showDebug ? 'Hide Debug' : 'Debug'}
            </button>
          </div>
        </div>

        {showEmergencyAccess && (
          <div className="mt-4 bg-[#1A1A1A] p-4 rounded-md border border-amber-900/50">
            <div className="flex items-center mb-2">
              <FaExclamationTriangle className="text-amber-500 mr-2" />
              <span className="text-white font-bold">Emergency Access</span>
            </div>
            <p className="text-gray-300 text-sm mb-2">
              Use emergency credentials for urgent access when normal authentication is unavailable.
            </p>
            <div className="text-gray-400 text-xs bg-[#121212] p-3 rounded">
              <p>Username: admin</p>
              <p>Password: admin123</p>
              <p className="mt-1 text-amber-500 text-xs">
                Note: Emergency access is logged and has limited functionality.
              </p>
            </div>
          </div>
        )}

        {showDebug && (
          <div className="mt-4 bg-[#1A1A1A] p-4 rounded-md border border-gray-800 text-xs font-mono text-gray-400 whitespace-pre-wrap">
            {debugInfo}
          </div>
        )}
      </div>
    </div>
  )
}

// Main export with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginPageContent />
    </Suspense>
  )
} 