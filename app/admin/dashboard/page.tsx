'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthProvider'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'

interface Order {
  id: string
  order_number: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  total_amount: number
  status: string
  created_at: string
  emails_sent: boolean
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  is_active: boolean
}

export default function AdminDashboard() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setDataLoading(true)
        
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
          
        if (ordersError) throw ordersError
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          
        if (productsError) throw productsError
        
        setOrders(ordersData)
        setProducts(productsData)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setDataLoading(false)
      }
    }
    
    if (user) {
      fetchData()
    }
  }, [user, supabase])

  if (isLoading || dataLoading) {
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
  
  const openGoogleAnalytics = () => {
    window.open('https://analytics.google.com/analytics/web', '_blank')
  }

  // Calculate dashboard stats
  const totalOrders = orders.length
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0)

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Logged in as: {user.email}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/analytics')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
          >
            Analytics
          </button>
          <button
            onClick={openGoogleAnalytics}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white transition-colors"
          >
            Google Analytics
          </button>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Orders</h2>
          <p className="text-3xl font-bold mb-2">{totalOrders}</p>
          <p className="text-gray-400">Total orders</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          <p className="text-3xl font-bold mb-2">{activeProducts}/{totalProducts}</p>
          <p className="text-gray-400">Active products</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Revenue</h2>
          <p className="text-3xl font-bold mb-2">€{totalRevenue.toFixed(2)}</p>
          <p className="text-gray-400">Total revenue</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Status</h2>
          <div className="flex gap-2 items-center">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <p className="text-xl font-bold">Online</p>
          </div>
          <p className="text-gray-400 mt-2">All systems running</p>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <button 
            onClick={() => router.push('/admin/orders')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">No orders found</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="border-b border-gray-700">
                    <td className="py-4">#{order.order_number}</td>
                    <td className="py-4">{order.customer_first_name} {order.customer_last_name}</td>
                    <td className="py-4">{format(new Date(order.created_at), 'MMM dd, yyyy')}</td>
                    <td className="py-4">€{Number(order.total_amount).toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'paid' 
                          ? 'bg-green-500/20 text-green-400' 
                          : order.status === 'shipped'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.emails_sent
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {order.emails_sent ? 'Sent' : 'Not Sent'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Products</h2>
          <button 
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Product</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">No products found</td>
                </tr>
              ) : (
                products.slice(0, 5).map(product => (
                  <tr key={product.id} className="border-b border-gray-700">
                    <td className="py-4">{product.name}</td>
                    <td className="py-4">€{Number(product.price).toFixed(2)}</td>
                    <td className="py-4">{product.stock}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 