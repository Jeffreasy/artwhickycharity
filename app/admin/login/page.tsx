'use client'

import { useState, Suspense, useEffect } from 'react'
import { signIn as nextAuthSignIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCombinedAuth } from '@/app/providers/CombinedAuthProvider'
import { Loading } from '@/globalComponents/ui/Loading'

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
  
  // Check for existing session and redirect if found
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('User is authenticated, redirecting to dashboard')
      setDebugMsg('Redirecting to: ' + callbackUrl)
      // Decode the URL if it's encoded
      const decodedUrl = decodeURIComponent(callbackUrl)
      window.location.href = decodedUrl // Use direct navigation to avoid Next.js router issues
    }
  }, [session, status, callbackUrl])
  
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

    try {
      if (isEmail(email)) {
        // Use Supabase auth for email logins
        setDebugMsg('Using Supabase auth for email login...')
        const { error: supabaseError } = await supabaseSignIn(email, password)

        if (supabaseError) {
          setError(supabaseError.message)
          setDebugMsg('Supabase login failed: ' + supabaseError.message)
          setIsLoading(false)
          return
        }
        
        setDebugMsg('Supabase login successful, redirecting to: ' + callbackUrl)
        // Decode the URL if it's encoded
        const decodedUrl = decodeURIComponent(callbackUrl)
        window.location.href = decodedUrl // Use direct navigation to avoid Next.js router issues
      } else {
        // Use NextAuth for username-based admin login
        setDebugMsg('Using NextAuth for username login...')
        const result = await nextAuthSignIn('credentials', {
          username: email, // We're reusing the email field for username
          password,
          redirect: false,
          callbackUrl: callbackUrl,
        })

        if (result?.error) {
          setError('Invalid username or password')
          setDebugMsg('NextAuth login failed: ' + result.error)
          setIsLoading(false)
          return
        }

        setDebugMsg('NextAuth login successful, redirecting to: ' + callbackUrl)
        // Wait a moment for the session to be established
        setTimeout(() => {
          // Decode the URL if it's encoded
          const decodedUrl = decodeURIComponent(callbackUrl)
          window.location.href = decodedUrl // Use direct navigation to avoid Next.js router issues
        }, 1000)
      }
    } catch (error: any) {
      setError('An error occurred during login')
      setDebugMsg('Login error: ' + (error.message || 'Unknown error'))
      setIsLoading(false)
    }
  }

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
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email of Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6"
                placeholder="Email of username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          
          {/* Always show debug info in production temporarily to diagnose issues */}
          {debugMsg && (
            <div className="text-amber-500 text-xs text-center">{debugMsg}</div>
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
        </form>
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