'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'
import { CldImage } from 'next-cloudinary'

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
  product?: {
    name: string
    image: string
  }
}

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
  items?: OrderItem[]
}

export default function OrderDetails({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch order details
  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        setDataLoading(true)
        
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (orderError) throw orderError
        
        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', params.id)
        
        if (itemsError) throw itemsError
        
        // Fetch product details for each item
        const itemsWithProducts = await Promise.all(
          itemsData.map(async (item) => {
            const { data: productData, error: productError } = await supabase
              .from('products')
              .select('name, image')
              .eq('id', item.product_id)
              .single()
            
            if (productError) {
              console.error('Error fetching product:', productError)
              return { ...item, product: { name: 'Unknown Product', image: '' } }
            }
            
            return { ...item, product: productData }
          })
        )
        
        setOrder(orderData)
        setOrderItems(itemsWithProducts)
      } catch (err: any) {
        console.error('Error fetching order details:', err)
        setError(err.message || 'Failed to load order details')
      } finally {
        setDataLoading(false)
      }
    }
    
    if (user && params.id) {
      fetchOrderDetails()
    }
  }, [user, params.id, supabase])
  
  async function updateOrderStatus(newStatus: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', params.id)
      
      if (error) throw error
      
      // Update local state
      if (order) {
        setOrder({ ...order, status: newStatus, updated_at: new Date().toISOString() })
      }
    } catch (err: any) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status: ' + err.message)
    }
  }
  
  async function resendOrderEmails() {
    try {
      const response = await fetch('/api/orders/send-emails-wfc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId: params.id,
          customer: {
            name: `${order?.customer_first_name} ${order?.customer_last_name}`,
            email: order?.customer_email,
            address: order?.customer_address,
            city: order?.customer_city,
            postalCode: order?.customer_postal_code,
            country: order?.customer_country
          }
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to send emails')
      }
      
      // Update order to mark emails as sent
      const { error } = await supabase
        .from('orders')
        .update({ emails_sent: true })
        .eq('id', params.id)
      
      if (error) throw error
      
      // Update local state
      if (order) {
        setOrder({ ...order, emails_sent: true })
      }
      
      alert('Emails sent successfully')
    } catch (err: any) {
      console.error('Error sending emails:', err)
      alert('Failed to send emails: ' + err.message)
    }
  }
  
  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-xl">Loading order details...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/admin/login')
    return null
  }
  
  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Order Not Found</h1>
          <button
            onClick={() => router.push('/admin/orders')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
          >
            Back to Orders
          </button>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400">
          {error || 'Order not found or you do not have permission to view it.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
        <button
          onClick={() => router.push('/admin/orders')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
        >
          Back to Orders
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          
          <div className="flex flex-wrap justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm">Date</p>
              <p>{format(new Date(order.created_at), 'MMMM dd, yyyy HH:mm')}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <div className="flex items-center gap-2 mt-1">
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
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="font-bold">€{Number(order.total_amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email Status</p>
              <span className={`px-2 py-1 rounded-full text-xs ${
                order.emails_sent
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {order.emails_sent ? 'Sent' : 'Not Sent'}
              </span>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6 mb-6">
            <h3 className="font-bold mb-3">Order Items</h3>
            {orderItems.length === 0 ? (
              <p className="text-gray-400">No items found for this order</p>
            ) : (
              <div className="space-y-4">
                {orderItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-700/40 rounded">
                    {item.product?.image && (
                      <div className="w-16 h-16 flex-shrink-0">
                        <CldImage
                          src={item.product.image}
                          alt={item.product?.name || 'Product image'}
                          width={64}
                          height={64}
                          className="object-contain rounded"
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                      <div className="flex justify-between mt-1">
                        <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                        <p className="text-sm">€{Number(item.price).toFixed(2)} each</p>
                      </div>
                    </div>
                    <div className="font-bold">
                      €{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between pt-4 border-t border-gray-700">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">€{Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button
              onClick={resendOrderEmails}
              disabled={order.emails_sent}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {order.emails_sent ? 'Emails Already Sent' : 'Resend Order Emails'}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Customer Information</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm">Name</p>
              <p className="font-medium">{order.customer_first_name} {order.customer_last_name}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="font-medium">{order.customer_email}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Address</p>
              <p className="font-medium">{order.customer_address}</p>
              <p className="font-medium">
                {order.customer_postal_code} {order.customer_city}
              </p>
              <p className="font-medium">{order.customer_country}</p>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">Payment Reference</p>
              <p className="font-medium">{order.payment_reference || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 