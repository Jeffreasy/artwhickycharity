import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Function to send email using WFC Email Service
async function sendOrderEmailWithWFC(orderData: any) {
  // Skip API calls during build time in Vercel
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    return { success: true, skipped: true }
  }
  
  try {
    // Use the backend URL or default to the Render.com hosted service
    const backendUrl = process.env.WFC_BACKEND_URL || 'https://dklemailservice.onrender.com'
    const endpoint = '/api/wfc/order-email'
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const apiKey = process.env.WFC_API_KEY || 'dkl_metrics_api_key_2025'
      
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(orderData),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`WFC Email Service error (${response.status}): ${errorText}`)
      }
      
      return await response.json()
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request to WFC Email Service timed out after 10 seconds')
      }
      throw error
    }
  } catch (error) {
    throw error
  }
}

// Export the function so it can be imported elsewhere
export { sendOrderEmailWithWFC };

export async function POST(request: Request) {
  // Skip API calls during build time in Vercel
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    return NextResponse.json({ message: 'Skipping email processing during build time' }, { status: 200 })
  }
  
  try {
    const { orderId, customer } = await request.json()
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }
    
    // Create Supabase client
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
    
    if (orderError || !order) {
      throw new Error('Order not found')
    }
    
    // Fetch order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        price,
        product_id
      `)
      .eq('order_id', orderId)
    
    if (itemsError) {
      throw new Error('Failed to fetch order items')
    }

    // Fetch products for the order items
    if (orderItems.length === 0) {
      throw new Error('No order items found')
    }

    // Get all product IDs
    const productIds = orderItems.map((item: any) => item.product_id)
    
    // Fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        image
      `)
      .in('id', productIds)
      
    if (productsError) {
      throw new Error('Failed to fetch products')
    }
    
    // Match order items with products and create final items array
    const items = orderItems.map((item: any) => {
      const product = products.find((p: any) => p.id === item.product_id)
      return {
        name: product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        image: product?.image || ''
      }
    })
    
    // Prepare data for WFC email service
    const backendRequestData = {
      order_id: order.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_address: customer.address,
      customer_postal: customer.postalCode,
      customer_city: customer.city,
      customer_country: customer.country,
      total_amount: order.total_amount,
      items: orderItems.map((item: any) => {
        const product = products.find((p: any) => p.id === item.product_id)
        return {
          id: item.id || `item_${Math.random().toString(36).substr(2, 9)}`,
          order_id: order.id,
          product_id: item.product_id || '',
          product_name: product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price
        }
      }),
      notify_admin: true,
      admin_email: process.env.WFC_ADMIN_EMAIL || 'laventejeffrey@gmail.com',
      site_url: process.env.WFC_SITE_URL || 'https://whiskyforcharity.com',
      template_type: "wfc_order_confirmation"
    }
    
    // Send email using WFC Email Service
    let emailSent = false
    
    try {
      const result = await sendOrderEmailWithWFC(backendRequestData)
      emailSent = true
      
      // Update order to mark email as sent
      if (emailSent) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ emails_sent: true })
          .eq('id', orderId)
        
        if (updateError) {
          throw new Error('Error updating order emails_sent status')
        }
      }
      
      return NextResponse.json({
        success: true,
        emailSent: true,
        details: result
      })
      
    } catch (error) {
      throw error
    }
    
  } catch (error) {
    throw error
  }
} 