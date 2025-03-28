import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendOrderEmails } from '@/lib/email-sendgrid'
import { Order, OrderItem } from '@/types/order'

interface OrderItemDB {
  id: string
  product_id: string
  quantity: number
  price: number
}

interface OrderDB {
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
  status: 'pending' | 'paid' | 'completed' | 'cancelled'
  payment_reference?: string
  created_at: string
  updated_at: string
  order_items: OrderItemDB[]
}

interface ProductDB {
  id: string
  name: string
  description: string
  image: string
  images: string[]
}

// API route om orderbevestigingsmails te verzenden
export async function POST(request: NextRequest) {
  try {
    // API body parsen
    const body = await request.json()
    const { orderId } = body
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    // Order ophalen uit database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, 
        order_number, 
        customer_first_name, 
        customer_last_name, 
        customer_email, 
        customer_address, 
        customer_city, 
        customer_postal_code, 
        customer_country, 
        total_amount, 
        status, 
        payment_reference, 
        created_at, 
        updated_at,
        order_items:order_items(
          id, 
          product_id,
          quantity, 
          price
        )
      `)
      .eq('id', orderId)
      .single()
    
    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }
    
    const typedOrder = order as unknown as OrderDB
    
    // Nu moeten we de productinformatie ophalen voor elk order item
    const productIds = typedOrder.order_items.map((item: OrderItemDB) => item.product_id)
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, description, image, images')
      .in('id', productIds)
    
    if (productsError || !products) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch product details' },
        { status: 500 }
      )
    }
    
    // Volledig order object maken dat voldoet aan Order interface
    const productMap = new Map(products.map((product: ProductDB) => [product.id, product]))
    
    const orderData: Order = {
      ...typedOrder,
      items: typedOrder.order_items.map((item: OrderItemDB) => {
        const product = productMap.get(item.product_id) as ProductDB | undefined
        return {
          id: product?.id || item.product_id,
          name: product?.name || 'Unknown Product',
          description: product?.description || '',
          image: product?.image || '',
          images: product?.images || [],
          stock: 0, // Niet nodig voor e-mails
          is_active: true,
          created_at: typedOrder.created_at,
          updated_at: typedOrder.updated_at,
          price: item.price,
          quantity: item.quantity,
          order_id: typedOrder.id
        } as OrderItem
      })
    }
    
    // E-mails versturen via SendGrid
    console.log('Sending emails using SendGrid...')
    const { customerEmailSent, adminEmailSent } = await sendOrderEmails(orderData)
    
    // Log resultaten en reageer met status
    console.log(`Email sending results - Customer: ${customerEmailSent}, Admin: ${adminEmailSent}`)
    
    // Markeer order als mails verzonden indien nodig (optioneel)
    if (customerEmailSent || adminEmailSent) {
      await supabase
        .from('orders')
        .update({ 
          emails_sent: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
    }
    
    return NextResponse.json({
      success: true,
      customerEmailSent,
      adminEmailSent
    })
    
  } catch (error) {
    console.error('Error processing email request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 