'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/globalComponents/ui/Loading'

// Component that uses router
function RegisterPageContent() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    try {
      // Create a new admin user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin'
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }

      // Show success message
      setIsSuccess(true)
      setIsLoading(false)
    } catch (error: any) {
      setError('An error occurred during registration')
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#121212] p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Add New Admin User</h2>
      
      {isSuccess ? (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Registration successful</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  User has been created successfully. They will need to confirm their email to access the admin panel.
                </p>
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="text-sm font-medium text-white bg-amber-500 px-4 py-2 rounded hover:bg-amber-400 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 bg-[#1E1E1E] border border-[#333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 bg-[#1E1E1E] border border-[#333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 bg-[#1E1E1E] border border-[#333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating user...' : 'Create Admin User'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// Main export with Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RegisterPageContent />
    </Suspense>
  )
} 