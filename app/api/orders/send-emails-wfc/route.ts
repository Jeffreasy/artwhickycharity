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
    // Use the backend URL or default to localhost for development
    const backendUrl = process.env.WFC_BACKEND_URL || 'http://localhost:3001'
    const endpoint = '/api/wfc/order-email'
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    try {
      console.log('Sending email through WFC email service:', `${backendUrl}${endpoint}`)
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.WFC_API_KEY || 'dkl_metrics_api_key_2025',
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
        throw new Error('Request to WFC Email Service timed out after 5 seconds')
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
        quantity, 
        products (
          id,
          name,
          price,
          image_url
        )
      `)
      .eq('order_id', orderId)
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
      return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 })
    }
    
    // Format items for email
    const items = orderItems.map((item: any) => ({
      name: item.products.name,
      quantity: item.quantity,
      price: item.products.price,
      image: item.products.image_url
    }))
    
    // Prepare data for WFC email service
    const emailData = {
      order: {
        id: order.id,
        orderNumber: order.order_number,
        date: new Date(order.created_at).toISOString(),
        totalAmount: order.total_amount,
        items: items
      },
      customer: {
        name: `${customer.name}`,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        postalCode: customer.postalCode,
        country: customer.country
      },
      adminEmail: process.env.WFC_ADMIN_EMAIL || 'laventejeffrey@gmail.com',
      siteUrl: process.env.WFC_SITE_URL || 'https://whiskyforcharity.com'
    }
    
    // Send email using WFC Email Service
    console.log('Sending order email via WFC Email Service...')
    let emailSent = false
    
    try {
      const result = await sendOrderEmailWithWFC(emailData)
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