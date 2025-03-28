'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthProvider'

export default function AdminDashboard() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-xl">Loading dashboard...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Logged in as: {user.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Orders</h2>
          <p className="text-3xl font-bold mb-2">12</p>
          <p className="text-gray-400">Total orders</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          <p className="text-3xl font-bold mb-2">8</p>
          <p className="text-gray-400">Active products</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <p className="text-3xl font-bold mb-2">3</p>
          <p className="text-gray-400">Unread messages</p>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-4">#38901</td>
                <td className="py-4">John Doe</td>
                <td className="py-4">March 28, 2025</td>
                <td className="py-4">€120.00</td>
                <td className="py-4">
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Paid</span>
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-4">#38900</td>
                <td className="py-4">Jane Smith</td>
                <td className="py-4">March 27, 2025</td>
                <td className="py-4">€85.50</td>
                <td className="py-4">
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">Pending</span>
                </td>
              </tr>
              <tr>
                <td className="py-4">#38899</td>
                <td className="py-4">Robert Johnson</td>
                <td className="py-4">March 27, 2025</td>
                <td className="py-4">€220.75</td>
                <td className="py-4">
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Paid</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 