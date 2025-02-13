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
  host: process.env.SMTP_HOST,  // mail.argewebhosting.nl
  port: Number(process.env.SMTP_PORT), // 587
  secure: false,  // false voor STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'TLSv1.2',
    minVersion: 'TLSv1.2'
  },
  debug: true
})

// Verifieer SMTP verbinding alleen in productie
if (process.env.NODE_ENV === 'production') {
  try {
    const verification = await transporter.verify()
    console.log('SMTP Connection verified:', verification)
  } catch (err) {
    console.error('SMTP Verification failed:', err)
  }
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

    // Alleen emails versturen in productie
    if (process.env.NODE_ENV === 'production') {
      try {
        // Email logica hier
        await transporter.sendMail({
          from: '"Whisky For Charity" <Jeffrey@whiskyforcharity.com>',
          to: formData.email,
          subject: `Order Bevestiging #${orderNumber}`,
          // ... rest van de email configuratie
        })
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Ga door met de order zelfs als email faalt
      }
    }

    return NextResponse.json({ 
      success: true, 
      orderNumber,
      message: process.env.NODE_ENV === 'production' 
        ? 'Order successfully processed.' 
        : 'Order processed (email disabled in development)'
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    )
  }
} 