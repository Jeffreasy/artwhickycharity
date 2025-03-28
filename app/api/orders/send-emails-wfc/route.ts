import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Function to send email using WFC Email Service
async function sendOrderEmailWithWFC(orderData: any) {
  // Skip API calls during build time in Vercel
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    console.log('Skipping WFC email during build time')
    return { success: true, skipped: true }
  }
  
  try {
    // Use the backend URL or default to the Render.com hosted service
    const backendUrl = process.env.WFC_BACKEND_URL || 'https://dklemailservice.onrender.com'
    const endpoint = '/api/wfc/order-email'
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      console.log('Sending email through WFC email service:', `${backendUrl}${endpoint}`)
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
        console.error('WFC Email Service request timed out')
        throw new Error('Request to WFC Email Service timed out after 10 seconds')
      }
      throw error
    }
  } catch (error) {
    console.error('Error sending email with WFC:', error)
    throw error
  }
}

export async function POST(request: Request) {
  // Skip API calls during build time in Vercel
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    console.log('Skipping order email processing during build time')
    return NextResponse.json({
      success: true,
      emailSent: true,
      skippedDuringBuild: true
    })
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
      console.error('Error fetching order:', orderError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
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
      console.error('Error fetching order items:', itemsError)
      return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 })
    }

    // Fetch products for the order items
    if (orderItems.length === 0) {
      console.warn('No order items found for order:', orderId)
      return NextResponse.json({ error: 'No order items found' }, { status: 404 })
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
      console.error('Error fetching products:', productsError)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
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
      OrderID: order.id,                     // Exact volgens struct format
      OrderNumber: order.order_number,
      CustomerName: customer.name,
      CustomerEmail: customer.email,
      
      // Lowercase versies
      orderID: order.id,
      orderId: order.id, 
      orderid: order.id,
      
      customerName: customer.name,
      customername: customer.name,
      
      customerEmail: customer.email,
      customeremail: customer.email,
      
      CustomerAddress: customer.address,
      customerAddress: customer.address,
      
      CustomerCity: customer.city,
      customerCity: customer.city,
      
      CustomerPostalCode: customer.postalCode,
      customerPostalCode: customer.postalCode,
      
      CustomerCountry: customer.country,
      customerCountry: customer.country,
      
      TotalAmount: order.total_amount,
      totalAmount: order.total_amount,
      
      Items: orderItems.map((item: any) => {
        const product = products.find((p: any) => p.id === item.product_id)
        return {
          ID: item.id || `item_${Math.random().toString(36).substr(2, 9)}`,
          OrderID: order.id,
          ProductID: item.product_id || '',
          ProductName: product?.name || 'Unknown Product',
          Quantity: item.quantity,
          Price: item.price
        }
      }),
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
      
      NotifyAdmin: true,
      notifyAdmin: true,
      
      AdminEmail: process.env.WFC_ADMIN_EMAIL || 'laventejeffrey@gmail.com',
      adminEmail: process.env.WFC_ADMIN_EMAIL || 'laventejeffrey@gmail.com',
      
      SiteURL: process.env.WFC_SITE_URL || 'https://whiskyforcharity.com',
      siteURL: process.env.WFC_SITE_URL || 'https://whiskyforcharity.com'
    }
    
    // Log de aanvraag body voor debugging
    console.log('DEBUG - WFC Email Request Data:', JSON.stringify(backendRequestData))
    
    // Send email using WFC Email Service
    console.log('Sending order email via WFC Email Service...')
    let emailSent = false
    
    try {
      const result = await sendOrderEmailWithWFC(backendRequestData)
      console.log('Email sent result:', result)
      emailSent = true
      
      // Update order to mark email as sent
      if (emailSent) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ emails_sent: true })
          .eq('id', orderId)
        
        if (updateError) {
          console.error('Error updating order emails_sent status:', updateError)
        }
      }
      
      return NextResponse.json({
        success: true,
        emailSent: true,
        details: result
      })
      
    } catch (error) {
      console.error('Failed to send order email:', error)
      return NextResponse.json({
        success: false,
        emailSent: false,
        error: (error as Error).message
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error in send-emails-wfc API route:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: (error as Error).message },
      { status: 500 }
    )
  }
} 