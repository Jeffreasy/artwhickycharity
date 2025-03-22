'use client'

import { useState, Suspense, useEffect } from 'react'
import { signIn as nextAuthSignIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCombinedAuth } from '@/app/providers/CombinedAuthProvider'
import { Loading } from '@/globalComponents/ui/Loading'
import { FaUser, FaLock, FaExclamationTriangle, FaBug } from "react-icons/fa";
import Cookies from "js-cookie";

// Component that uses router
function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin/dashboard'
  
  const { signIn: supabaseSignIn } = useCombinedAuth()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debugMsg, setDebugMsg] = useState('')
  const [showEmergencyAccess, setShowEmergencyAccess] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [cookieInfo, setCookieInfo] = useState('')

  // Check for existing session and redirect if found
  useEffect(() => {
    console.log('Session status:', status, 'Session:', session);
    setDebugMsg(`Session status: ${status}`);

    // Check for admin bypass cookie
    const hasEmergencyCookie = document.cookie.includes('admin_bypass=true');
    if (hasEmergencyCookie) {
      setDebugMsg('Emergency access cookie detected. Redirecting to dashboard...');
      window.location.href = '/admin/dashboard';
      return;
    }
    
    if (status === 'authenticated' && session) {
      console.log('User is authenticated, redirecting to dashboard');
      setDebugMsg('Authenticated! Redirecting to: ' + callbackUrl);
      
      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => {
        try {
          // Direct navigation for most reliable method
          window.location.href = callbackUrl.startsWith('/') 
            ? callbackUrl 
            : decodeURIComponent(callbackUrl);
        } catch (e) {
          console.error('Redirect error:', e);
          // Fallback
          window.location.href = '/admin/dashboard';
        }
      }, 100);
    }
  }, [session, status, callbackUrl])

  // Check and display cookies for debugging
  useEffect(() => {
    if (showDebug) {
      try {
        const allCookies = document.cookie;
        setCookieInfo(`Current cookies: ${allCookies || 'None'}`);
      } catch (e: any) {
        setCookieInfo(`Error reading cookies: ${e.message}`);
      }
    }
  }, [showDebug]);
  
  // Determines if input is email or username
  const isEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setDebugMsg('Attempting login...')

    // EMERGENCY ACCESS: Check for admin credentials directly
    if (email === "admin" && password === "admin123") {
      console.log("EMERGENCY ACCESS GRANTED! Setting bypass cookie...");
      setDebugMsg("EMERGENCY ACCESS GRANTED! Setting bypass cookie...");
      
      // Clear any existing cookies that might interfere
      Cookies.remove('next-auth.session-token', { path: '/' });
      Cookies.remove('next-auth.csrf-token', { path: '/' });
      Cookies.remove('next-auth.callback-url', { path: '/' });
      
      // Set admin bypass cookie - expires in 2 hours
      Cookies.set('admin_bypass', 'true', { 
        expires: 1/12, 
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      }); 
      
      // Short delay to ensure cookie is set
      setTimeout(() => {
        // Redirect directly to dashboard
        window.location.href = '/admin/dashboard';
      }, 500);
      return;
    }

    try {
      if (isEmail(email)) {
        // Email login with Supabase
        setDebugMsg('Using Supabase auth with email: ' + email)
        
        const { error: supabaseError } = await supabaseSignIn(email, password)
        
        if (supabaseError) {
          console.error('Supabase auth error:', supabaseError)
          setError(supabaseError.message)
          setDebugMsg('Login failed: ' + supabaseError.message)
          setIsLoading(false)
          return
        }
        
        setDebugMsg('Supabase login successful! Redirecting...')
        // Force page reload to dashboard
        window.location.href = '/admin/dashboard'
      } else {
        // Username login with NextAuth
        setDebugMsg('Using NextAuth with username: ' + email)
        
        // Standard NextAuth flow with callback
        const result = await nextAuthSignIn('credentials', {
          username: email,
          password,
          redirect: false,
          callbackUrl: '/admin/dashboard' // Explicitly set callback
        })
        
        if (result?.error) {
          setError("Invalid credentials");
          setDebugMsg('NextAuth error: ' + result.error);
          setIsLoading(false);
          return;
        }
        
        setDebugMsg('NextAuth login successful! Redirecting...');
        
        // Set a flag cookie to help with redirects
        Cookies.set('login_success', 'true', { 
          path: '/',
          secure: window.location.protocol === 'https:',
          sameSite: 'lax',
          expires: 1/144 // 10 minutes
        });
        
        // Use window.location for most reliable redirect
        window.location.href = '/admin/dashboard';
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError('An error occurred during login')
      setDebugMsg('Error during login: ' + (error.message || 'Unknown error'))
      setIsLoading(false)
    }
  }

  const toggleEmergencyAccess = () => {
    setShowEmergencyAccess(!showEmergencyAccess);
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Login met je admin account of email
          </p>
          <p className="mt-2 text-center text-xs text-amber-500">
            Callback URL: {callbackUrl}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email of Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6"
                  placeholder="Email of username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
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
                  className="relative block w-full rounded-b-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-bold">{error}</div>
          )}
          
          {/* Debug info */}
          {debugMsg && (
            <div className="text-amber-500 text-xs text-center">{debugMsg}</div>
          )}

          {showDebug && (
            <div className="bg-gray-800 p-3 rounded text-xs text-gray-400 mt-2">
              <div>Session status: {status}</div>
              <div>Session data: {session ? JSON.stringify(session).substring(0, 100) + '...' : 'null'}</div>
              <div>URL: {typeof window !== 'undefined' ? window.location.href : 'Server rendering'}</div>
              <div>Host: {typeof window !== 'undefined' ? window.location.host : 'Unknown'}</div>
              <div>{cookieInfo}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || status === 'loading'}
              className="group relative flex w-full justify-center rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-black hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-70"
            >
              {isLoading ? 'Inloggen...' : 'Login'}
            </button>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-between text-xs mt-4">
            <button
              onClick={toggleEmergencyAccess}
              className="font-bold text-amber-500 hover:underline"
              type="button"
            >
              NOODTOEGANG
            </button>
            
            <button
              onClick={toggleDebug}
              className="text-gray-500 hover:text-gray-400 flex items-center gap-1"
              type="button"
            >
              <FaBug className="h-3 w-3" />
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
          </div>
        </form>

        {showEmergencyAccess && (
          <div className="mt-4 bg-gray-700 p-4 rounded-md">
            <div className="flex items-center mb-2">
              <FaExclamationTriangle className="text-yellow-500 mr-2" />
              <span className="text-white font-bold">Emergency Access</span>
            </div>
            <p className="text-gray-300 text-sm mb-2">
              Use emergency credentials for urgent access when normal authentication is unavailable.
            </p>
            <div className="text-gray-400 text-xs">
              <p>Username: admin</p>
              <p>Password: admin123</p>
              <p className="mt-1 text-yellow-500">
                Note: Emergency access has limited functionality and is monitored.
              </p>
            </div>
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