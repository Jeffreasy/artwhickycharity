import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Function to send email using DKL Email Service
async function sendEmailWithDKL(templateType: string, data: any) {
  // Skip API calls during build time in Vercel
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    console.log(`Skipping DKL email (${templateType}) during build time`)
    return { success: true, skipped: true }
  }
  
  try {
    // Replace with your actual DKL Email Service URL
    const DKL_SERVICE_URL = process.env.DKL_EMAIL_SERVICE_URL || 'https://dklemailservice.onrender.com'
    const endpoint = templateType === 'admin' ? '/api/aanmelding-email' : '/api/contact-email'
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    try {
      const response = await fetch(`${DKL_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DKL_EMAIL_API_KEY || 'dkl_metrics_api_key_2025'}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DKL Email Service error (${response.status}): ${errorText}`)
      }
      
      return await response.json()
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('DKL Email Service request timed out')
        throw new Error('Request to DKL Email Service timed out after 5 seconds')
      }
      throw error
    }
  } catch (error) {
    console.error('Error sending email with DKL:', error)
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
      customerEmailSent: true,
      adminEmailSent: true,
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
    
    // Prepare data for customer email
    const customerEmailData = {
      naam: customer.name,
      email: customer.email,
      bericht: `Thank you for your order #${order.order_number}. We have received your order and will process it soon.`,
      privacy_akkoord: true,
      additionalData: {
        orderNumber: order.order_number,
        orderDate: new Date(order.created_at).toLocaleDateString(),
        totalAmount: order.total_amount,
        items: items,
        shippingAddress: {
          address: customer.address,
          city: customer.city,
          postalCode: customer.postalCode,
          country: customer.country
        }
      }
    }
    
    // Prepare data for admin email
    const adminEmailData = {
      naam: "Whisky For Charity Admin",
      email: process.env.ADMIN_EMAIL || "laventejeffrey@gmail.com",
      bericht: `New order #${order.order_number} received from ${customer.name} (${customer.email})`,
      privacy_akkoord: true,
      additionalData: {
        orderNumber: order.order_number,
        orderDate: new Date(order.created_at).toLocaleDateString(),
        totalAmount: order.total_amount,
        items: items,
        customer: {
          name: customer.name,
          email: customer.email,
          address: customer.address,
          city: customer.city,
          postalCode: customer.postalCode,
          country: customer.country
        }
      }
    }
    
    // Send emails using DKL Email Service
    console.log('Sending customer email via DKL Email Service...')
    let customerEmailSent = false
    let adminEmailSent = false
    
    try {
      const customerResult = await sendEmailWithDKL('customer', customerEmailData)
      console.log('Customer email sent result:', customerResult)
      customerEmailSent = true
    } catch (error) {
      console.error('Failed to send customer email:', error)
    }
    
    try {
      const adminResult = await sendEmailWithDKL('admin', adminEmailData)
      console.log('Admin email sent result:', adminResult)
      adminEmailSent = true
    } catch (error) {
      console.error('Failed to send admin email:', error)
    }
    
    // Update order to mark emails as sent if at least one email was sent
    if (customerEmailSent || adminEmailSent) {
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
      customerEmailSent,
      adminEmailSent
    })
    
  } catch (error) {
    console.error('Error in send-emails-dkl API route:', error)
    return NextResponse.json(
      { error: 'Failed to send emails', details: (error as Error).message },
      { status: 500 }
    )
  }
} 