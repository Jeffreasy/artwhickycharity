'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'

interface Order {
  id: string
  order_number: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_address: string
  customer_city: string
  customer_postal_code: string
  customer_country: string
  total_amount: number
  status: string
  payment_reference: string | null
  created_at: string
  updated_at: string
  emails_sent: boolean
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<string>('desc')
  
  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        setDataLoading(true)
        
        let query = supabase
          .from('orders')
          .select('*')
        
        // Apply status filter
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter)
        }
        
        // Apply sorting
        query = query.order(sortField, { ascending: sortDirection === 'asc' })
        
        const { data, error: fetchError } = await query
        
        if (fetchError) throw fetchError
        setOrders(data || [])
      } catch (err: any) {
        console.error('Error fetching orders:', err)
        setError(err.message || 'Failed to load orders')
      } finally {
        setDataLoading(false)
      }
    }
    
    if (user) {
      fetchOrders()
    }
  }, [user, supabase, statusFilter, sortField, sortDirection])
  
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Default to descending for new sort field
      setSortField(field)
      setSortDirection('desc')
    }
  }
  
  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
      
      if (error) throw error
      
      // Update local state to reflect the change
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus, updated_at: new Date().toISOString() } : order
      ))
    } catch (err: any) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status: ' + err.message)
    }
  }
  
  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-xl">Loading orders...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400">
          {error}
        </div>
      )}
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium mb-1 text-gray-400">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 cursor-pointer" onClick={() => handleSort('order_number')}>
                  <div className="flex items-center">
                    Order Number
                    {sortField === 'order_number' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="pb-3 cursor-pointer" onClick={() => handleSort('customer_last_name')}>
                  <div className="flex items-center">
                    Customer
                    {sortField === 'customer_last_name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="pb-3 cursor-pointer" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center">
                    Date
                    {sortField === 'created_at' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="pb-3 cursor-pointer" onClick={() => handleSort('total_amount')}>
                  <div className="flex items-center">
                    Amount
                    {sortField === 'total_amount' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Email</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-400">No orders found</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="border-b border-gray-700">
                    <td className="py-4">#{order.order_number}</td>
                    <td className="py-4">
                      <div>
                        {order.customer_first_name} {order.customer_last_name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="py-4">{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</td>
                    <td className="py-4">€{Number(order.total_amount).toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'paid' 
                          ? 'bg-green-500/20 text-green-400' 
                          : order.status === 'shipped'
                          ? 'bg-blue-500/20 text-blue-400'
                          : order.status === 'completed'
                          ? 'bg-purple-500/20 text-purple-400'
                          : order.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400'
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
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs transition-colors"
                        >
                          View
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
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