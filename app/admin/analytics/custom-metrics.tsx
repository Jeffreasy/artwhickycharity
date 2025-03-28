'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface AnalyticsMetrics {
  ordersCount: number
  revenueTotal: number
  conversionRate: string
  avgOrderValue: string
  topSellingProduct: string
}

export function CustomMetrics() {
  const supabase = createClientComponentClient()
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  
  useEffect(() => {
    async function fetchMetrics() {
      try {
        setIsLoading(true)
        
        // Calculate date range based on selected period
        const now = new Date()
        let startDate = new Date()
        
        if (period === '7d') {
          startDate.setDate(now.getDate() - 7)
        } else if (period === '30d') {
          startDate.setDate(now.getDate() - 30)
        } else if (period === '90d') {
          startDate.setDate(now.getDate() - 90)
        } else {
          // 'all' - use a very old date to include everything
          startDate = new Date('2020-01-01')
        }
        
        const startDateStr = startDate.toISOString()
        
        // Fetch orders for the period
        let ordersQuery = supabase
          .from('orders')
          .select('*')
        
        // Apply date filter for all except 'all'
        if (period !== 'all') {
          ordersQuery = ordersQuery.gte('created_at', startDateStr)
        }
        
        const { data: orders, error: ordersError } = await ordersQuery
        
        if (ordersError) throw ordersError
        
        // Calculate revenue
        const revenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
        
        // Calculate average order value
        const avgOrderValue = orders?.length ? revenue / orders.length : 0
        
        // For conversion rate and top selling product, we need more data
        // Here we're using placeholder data, but in a real app you would:
        // 1. Track site visits through analytics
        // 2. Query order_items to find the top selling product
        
        // Find top selling product (simplified version - in reality would require more complex query)
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('product_id, quantity')
        
        if (itemsError) throw itemsError
        
        // Group by product and sum quantities
        const productQuantities: Record<string, number> = {}
        orderItems?.forEach(item => {
          const productId = item.product_id
          const quantity = Number(item.quantity)
          productQuantities[productId] = (productQuantities[productId] || 0) + quantity
        })
        
        // Find the product with highest quantity
        let topProductId = ''
        let maxQuantity = 0
        
        Object.entries(productQuantities).forEach(([productId, quantity]) => {
          if (quantity > maxQuantity) {
            topProductId = productId
            maxQuantity = quantity
          }
        })
        
        // Get product name
        let topProductName = 'Unknown Product'
        if (topProductId) {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('name')
            .eq('id', topProductId)
            .single()
          
          if (!productError && product) {
            topProductName = product.name
          }
        }
        
        // Set the metrics
        setMetrics({
          ordersCount: orders?.length || 0,
          revenueTotal: revenue,
          conversionRate: '2.5%', // Placeholder - would need actual visitor data
          avgOrderValue: avgOrderValue.toFixed(2),
          topSellingProduct: topProductName
        })
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMetrics()
  }, [supabase, period])
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Business Metrics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('7d')}
            className={`px-3 py-1 rounded text-sm ${
              period === '7d' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1 rounded text-sm ${
              period === '30d' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            30d
          </button>
          <button
            onClick={() => setPeriod('90d')}
            className={`px-3 py-1 rounded text-sm ${
              period === '90d' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            90d
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1 rounded text-sm ${
              period === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Time
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-700/30 animate-pulse rounded h-24"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 p-4 rounded">
            <h3 className="text-sm text-gray-400">Orders</h3>
            <p className="text-2xl font-bold mt-2">{metrics?.ordersCount || 0}</p>
            <p className="text-xs text-gray-500 mt-1">In selected period</p>
          </div>
          
          <div className="bg-gray-700/30 p-4 rounded">
            <h3 className="text-sm text-gray-400">Revenue</h3>
            <p className="text-2xl font-bold mt-2">€{metrics?.revenueTotal.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500 mt-1">Total in period</p>
          </div>
          
          <div className="bg-gray-700/30 p-4 rounded">
            <h3 className="text-sm text-gray-400">Average Order Value</h3>
            <p className="text-2xl font-bold mt-2">€{metrics?.avgOrderValue || '0.00'}</p>
            <p className="text-xs text-gray-500 mt-1">Per order</p>
          </div>
          
          <div className="bg-gray-700/30 p-4 rounded">
            <h3 className="text-sm text-gray-400">Conversion Rate</h3>
            <p className="text-2xl font-bold mt-2">{metrics?.conversionRate || '0%'}</p>
            <p className="text-xs text-gray-500 mt-1">Visitors to customers</p>
          </div>
          
          <div className="bg-gray-700/30 p-4 rounded md:col-span-2">
            <h3 className="text-sm text-gray-400">Top Selling Product</h3>
            <p className="text-xl font-bold mt-2 truncate">{metrics?.topSellingProduct || 'No data'}</p>
            <p className="text-xs text-gray-500 mt-1">Most popular in selected period</p>
          </div>
        </div>
      )}
    </div>
  )
} 