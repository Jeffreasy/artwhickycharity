import { createTransport } from 'nodemailer'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CartItem } from '@/types/cart'
import { CheckoutFormData } from '@/types/checkout'

// Maak een nieuwe Supabase client specifiek voor de API route
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Nieuwe SMTP configuratie voor Argeweb
const transporter = createTransport({
  host: 'mail.argewebhosting.nl', // Gebruik de algemene mail server
  port: 587,
  secure: false,
  auth: {
    user: 'Jeffrey@whiskyforcharity.com', // Volledige email
    pass: 'Bootje@12'
  }
})

// Verifieer SMTP verbinding
try {
  await transporter.verify()
  console.log('SMTP Connection verified')
} catch (err) {
  console.error('SMTP Verification failed:', err)
}

interface RequestData {
  formData: CheckoutFormData
  items: CartItem[]
  totalPrice: number
}

export async function POST(request: Request) {
  try {
    const { formData, items, totalPrice }: RequestData = await request.json()
    const orderNumber = `W4C${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(-2).toUpperCase()}`

    // Sla order op in database
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_data: formData,
        order_items: items,
        total_amount: totalPrice,
        status: 'pending'
      })

    if (dbError) {
      throw new Error('Failed to save order')
    }

    // Tijdelijk: stuur geen emails, alleen order opslaan
    return NextResponse.json({ 
      success: true, 
      orderNumber,
      message: 'Order successfully processed. Email confirmation temporarily disabled.'
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    )
  }
} 