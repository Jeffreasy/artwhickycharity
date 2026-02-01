/**
 * Unified Order Email API Route
 * Consolidates WFC, DKL, and SendGrid email functionality
 * Uses the new unified email service with automatic fallback
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailService, type EmailOptions } from '@/lib/email-service'

// Skip API calls during build time
const isBuildTime =
  process.env.VERCEL_ENV === 'production' &&
  process.env.NEXT_PHASE === 'phase-production-build'

/**
 * Format order data for email template
 */
function formatOrderEmail(order: any, customer: any, items: any[]): EmailOptions {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Orderbevestiging - Whisky4Charity</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Whisky4Charity</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Bedankt voor uw bestelling!</h2>
          <p>Beste ${customer.name},</p>
          <p>Hartelijk dank voor uw bestelling bij Whisky4Charity. Hier is een overzicht van uw bestelling:</p>
          
          <h3>Ordergegevens</h3>
          <p><strong>Ordernummer:</strong> ${order.id}</p>
          <p><strong>Datum:</strong> ${new Date(order.created_at).toLocaleDateString('nl-NL')}</p>
          
          <h3>Afleveradres</h3>
          <p>
            ${customer.name}<br>
            ${customer.address}<br>
            ${customer.postalCode} ${customer.city}<br>
            ${customer.country || 'Nederland'}
          </p>
          
          <h3>Bestellingsoverzicht</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #000; color: #fff;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Aantal</th>
                <th style="padding: 10px; text-align: right;">Prijs</th>
                <th style="padding: 10px; text-align: right;">Totaal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Totaal:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">€${order.total_amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <p style="margin-top: 30px; padding: 15px; background-color: #fff; border-left: 4px solid #000;">
            <strong>Goede doel:</strong> Met uw aankoop steunt u een goed doel. Een deel van de opbrengst gaat naar liefdadigheidsorganisaties.
          </p>
          
          <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
            Heeft u vragen over uw bestelling? Neem contact met ons op via 
            <a href="mailto:info@whiskyforcharity.com" style="color: #000;">info@whiskyforcharity.com</a>
          </p>
        </div>
        
        <div style="background-color: #333; color: #fff; padding: 15px; text-align: center; font-size: 0.85em;">
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} Whisky4Charity</p>
          <p style="margin: 5px 0;">Goede whisky voor een goed doel</p>
        </div>
      </body>
    </html>
  `

  return {
    to: customer.email,
    subject: `Orderbevestiging #${order.id} - Whisky4Charity`,
    html,
    from: process.env.WFC_ADMIN_EMAIL || 'noreply@whiskyforcharity.com',
    replyTo: 'info@whiskyforcharity.com',
  }
}

/**
 * Format admin notification email
 */
function formatAdminEmail(order: any, customer: any, items: any[]): EmailOptions {
  const itemsList = items
    .map((item) => `- ${item.name} (${item.quantity}x) - €${(item.quantity * item.price).toFixed(2)}`)
    .join('\n')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Nieuwe Bestelling - Admin Notificatie</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #000; color: #fff; padding: 20px;">
          <h1 style="margin: 0;">🎉 Nieuwe Bestelling!</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Orderdetails</h2>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Datum:</strong> ${new Date(order.created_at).toLocaleDateString('nl-NL', { dateStyle: 'full' })}</p>
          <p><strong>Tijdstip:</strong> ${new Date(order.created_at).toLocaleTimeString('nl-NL')}</p>
          
          <h3>Klantgegevens</h3>
          <p>
            <strong>Naam:</strong> ${customer.name}<br>
            <strong>Email:</strong> <a href="mailto:${customer.email}">${customer.email}</a><br>
            <strong>Adres:</strong> ${customer.address}, ${customer.postalCode} ${customer.city}
          </p>
          
          <h3>Bestelde Producten</h3>
          <pre style="background-color: #fff; padding: 15px; border-left: 4px solid #000;">${itemsList}</pre>
          
          <p style="font-size: 1.2em; font-weight: bold; margin-top: 20px;">
            Totaalbedrag: €${order.total_amount.toFixed(2)}
          </p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
            <strong>⚡ Actie vereist:</strong> Verwerk deze bestelling en zorg voor tijdige verzending.
          </div>
        </div>
      </body>
    </html>
  `

  const adminEmail = process.env.WFC_ADMIN_EMAIL || 'laventejeffrey@gmail.com'

  return {
    to: adminEmail,
    subject: `🔔 Nieuwe Bestelling #${order.id} - €${order.total_amount.toFixed(2)}`,
    html,
    from: 'system@whiskyforcharity.com',
  }
}

/**
 * POST - Send order confirmation and admin notification emails
 */
export async function POST(request: Request) {
  if (isBuildTime) {
    return NextResponse.json({ message: 'Skipping email during build' }, { status: 200 })
  }

  try {
    const { orderId, customer } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Fetch order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, quantity, price, product_id')
      .eq('order_id', orderId)

    if (itemsError || !orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: 'No order items found' }, { status: 404 })
    }

    // Fetch products
    const productIds = orderItems.map((item: any) => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, image')
      .in('id', productIds)

    if (productsError) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Combine order items with product details
    const items = orderItems.map((item: any) => {
      const product = products?.find((p: any) => p.id === item.product_id)
      return {
        name: product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        image: product?.image || '',
      }
    })

    // Send customer email
    const customerEmailOptions = formatOrderEmail(order, customer, items)
    const customerResult = await emailService.send(customerEmailOptions)

    // Send admin notification
    const adminEmailOptions = formatAdminEmail(order, customer, items)
    const adminResult = await emailService.send(adminEmailOptions)

    // Update order to mark emails as sent
    if (customerResult.success) {
      await supabase
        .from('orders')
        .update({ emails_sent: true })
        .eq('id', orderId)
    }

    return NextResponse.json({
      success: true,
      customer: {
        sent: customerResult.success,
        provider: customerResult.provider,
        error: customerResult.error,
      },
      admin: {
        sent: adminResult.success,
        provider: adminResult.provider,
        error: adminResult.error,
      },
    })
  } catch (error) {
    console.error('Order Email Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to send order emails',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}