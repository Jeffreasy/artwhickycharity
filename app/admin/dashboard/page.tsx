'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/AuthProvider'
import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'
import gsap from 'gsap'

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
  is_active: boolean | string
}

export default function AdminDashboard() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Refs voor GSAP animaties
  const statsRef = useRef<HTMLDivElement>(null)
  const welcomeRef = useRef<HTMLDivElement>(null)
  const ordersTableRef = useRef<HTMLDivElement>(null)
  const productsTableRef = useRef<HTMLDivElement>(null)

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
        
        // Debug logging
        console.log('Product data from Supabase:', productsData);
        console.log('Product is_active values:', productsData.map(p => ({ id: p.id, name: p.name, is_active: p.is_active, type: typeof p.is_active })));
        
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
  
  // GSAP animaties
  useEffect(() => {
    if (!dataLoading && statsRef.current) {
      // Welkom banner animatie
      gsap.fromTo(
        welcomeRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
      
      // Statistieken animatie
      gsap.fromTo(
        '.stat-card',
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6, 
          stagger: 0.1,
          ease: 'back.out(1.5)'
        }
      );
      
      // Tabellen animatie
      gsap.fromTo(
        ordersTableRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: 'power2.out' }
      );
      
      gsap.fromTo(
        productsTableRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.6, ease: 'power2.out' }
      );
      
      // Statistiek nummers tellen animatie
      const statValueElements = document.querySelectorAll('.stat-value');
      statValueElements.forEach(element => {
        const finalValue = parseFloat(element.textContent?.replace(/[^0-9.-]+/g, '') || '0');
        const prefix = element.textContent?.includes('€') ? '€' : '';
        const suffix = element.textContent?.includes('/') ? `/${element.textContent?.split('/')[1]}` : '';
        
        gsap.fromTo(
          element, 
          { textContent: '0' },
          {
            duration: 1.5,
            delay: 0.3,
            textContent: finalValue,
            snap: { textContent: 1 },
            onUpdate: function() {
              if (this.targets()[0]) {
                let value = parseFloat(this.targets()[0].textContent || '0');
                if (prefix === '€') {
                  this.targets()[0].textContent = `${prefix}${value.toFixed(2)}`;
                } else {
                  this.targets()[0].textContent = `${prefix}${Math.round(value)}${suffix}`;
                }
              }
            }
          }
        );
      });
    }
  }, [dataLoading]);

  if (isLoading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xl">Loading dashboard...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/admin/login')
    return null
  }
  
  // Calculate dashboard stats
  const totalOrders = orders.length
  const totalProducts = products.length

  // Verbeterde functie voor het bepalen van actieve producten
  const isProductActive = (product: Product): boolean => {
    // Controleer verschillende mogelijke representaties
    if (typeof product.is_active === 'boolean') {
      return product.is_active;
    }
    if (typeof product.is_active === 'string') {
      return product.is_active.toLowerCase() === 'true';
    }
    // Als het een andere waarde is, log deze voor debugging
    console.log('Onbekend is_active type:', product.id, product.name, product.is_active, typeof product.is_active);
    return false;
  };

  const activeProducts = products.filter(isProductActive).length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0)

  return (
    <div className="space-y-6">
      <div ref={welcomeRef} className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 p-6 rounded-xl shadow-lg flex justify-between items-center border border-gray-700/50">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Welcome back
            </span>
            <div className="ml-2 inline-block w-1.5 h-6 bg-blue-500 animate-pulse rounded"></div>
          </h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/analytics')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors shadow-lg hover:shadow-blue-900/30"
          >
            Analytics
          </button>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors shadow-lg hover:shadow-red-900/30"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400 animate-pulse">
          {error}
        </div>
      )}
      
      <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-gray-300">Orders</h2>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
          </div>
          <p className="stat-value text-3xl font-bold mb-2">{totalOrders}</p>
          <div className="flex items-center text-gray-400 text-sm">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            <span>Total orders</span>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-gray-300">Products</h2>
            <span className="p-2 bg-green-500/10 text-green-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </span>
          </div>
          <p className="stat-value text-3xl font-bold mb-2">{activeProducts}/{totalProducts}</p>
          <div className="flex items-center text-gray-400 text-sm">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span>Active products</span>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-gray-300">Revenue</h2>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="stat-value text-3xl font-bold mb-2">€{totalRevenue.toFixed(2)}</p>
          <div className="flex items-center text-gray-400 text-sm">
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            <span>Total revenue</span>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-gray-300">Status</h2>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="flex gap-2 items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xl font-bold">Online</p>
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
      
      <div ref={ordersTableRef} className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          <button 
            onClick={() => router.push('/admin/orders')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-gray-400 font-medium">Order Number</th>
                <th className="pb-3 text-gray-400 font-medium">Customer</th>
                <th className="pb-3 text-gray-400 font-medium">Date</th>
                <th className="pb-3 text-gray-400 font-medium">Amount</th>
                <th className="pb-3 text-gray-400 font-medium">Status</th>
                <th className="pb-3 text-gray-400 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400 bg-gray-800/50 rounded-lg">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      No orders found
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order.id} 
                      className="cursor-pointer hover:bg-gray-800/80 transition-colors"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}>
                    <td className="py-3 px-2 bg-gray-800/30 first:rounded-l-lg">
                      <div className="font-medium">{order.order_number}</div>
                    </td>
                    <td className="py-3 px-2 bg-gray-800/30">
                      <div>{order.customer_first_name} {order.customer_last_name}</div>
                    </td>
                    <td className="py-3 px-2 bg-gray-800/30">
                      <div>{format(new Date(order.created_at), 'MMM dd, yyyy')}</div>
                    </td>
                    <td className="py-3 px-2 bg-gray-800/30">
                      <div className="font-medium">€{Number(order.total_amount).toFixed(2)}</div>
                    </td>
                    <td className="py-3 px-2 bg-gray-800/30">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'paid' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : order.status === 'shipped'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 bg-gray-800/30 last:rounded-r-lg">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.emails_sent
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
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
      
      <div ref={productsTableRef} className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Products</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/admin/products/new')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white text-sm transition-colors"
            >
              Add New
            </button>
            <button 
              onClick={() => router.push('/admin/products')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
            >
              View All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-gray-400 font-medium">Product</th>
                <th className="pb-3 text-gray-400 font-medium">Price</th>
                <th className="pb-3 text-gray-400 font-medium">Stock</th>
                <th className="pb-3 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-400 bg-gray-800/50 rounded-lg">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      No products found
                    </div>
                  </td>
                </tr>
              ) : (
                products.slice(0, 5).map(product => (
                  <tr key={product.id} 
                      className="cursor-pointer hover:bg-gray-800/80 transition-colors"
                      onClick={() => router.push(`/admin/products/${product.id}`)}>
                    <td className="py-3 px-2 bg-gray-800/30 first:rounded-l-lg">
                      <div className="font-medium">{product.name}</div>
                    </td>
                    <td className="py-3 px-2 bg-gray-800/30">
                      <div className="font-medium">€{Number(product.price).toFixed(2)}</div>
                    </td>
                    <td className="py-3 px-2 bg-gray-800/30">
                      <div className={`${product.stock <= 5 ? 'text-red-400' : 'text-gray-200'}`}>
                        {product.stock}
                      </div>
                    </td>
                    <td className="py-3 px-2 bg-gray-800/30 last:rounded-r-lg">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
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